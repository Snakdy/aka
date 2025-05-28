package oidc

import (
	"context"
	_ "embed"
	"encoding/base64"
	"fmt"
	"github.com/go-logr/logr"
	"golang.org/x/oauth2"
	"net/http"
	"text/template"
)

//go:embed redirect.tpl.html
var redirectHtml string

var redirectTemplate = template.Must(template.New("").Parse(redirectHtml))

func (f *Filter) HandleCallback(w http.ResponseWriter, r *http.Request) {
	log := logr.FromContextOrDiscard(r.Context())
	oauth2Token, err := f.config.Exchange(r.Context(), r.URL.Query().Get("code"))
	if err != nil {
		log.Error(err, "failed to parse oauth2 token")
		http.Error(w, fmt.Sprintf("failed to parse oauth2 token: %s", err.Error()), http.StatusBadRequest)
		return
	}
	// extract the id token from the oauth2 token
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		msg := "id_token is missing"
		log.Info(msg)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	// parse and verify the ID token payload
	idToken, err := f.verifier.Verify(r.Context(), rawIDToken)
	if err != nil {
		log.Error(err, "failed to verify OIDC token")
		http.Error(w, fmt.Sprintf("failed to verify oidc token: %s", err.Error()), http.StatusBadRequest)
		return
	}
	log.Info("identified OIDC user", "sub", idToken.Subject, "iss", idToken.Issuer)
	log.V(1).Info("successfully verified id token", "token", idToken)
	_, _ = f.getUserInfo(r.Context(), oauth2Token)
	// save the oauth2 token
	f.saveToken(w, r, TokenName, oauth2Token.RefreshToken)
	// save the id token
	f.saveToken(w, r, IDName, rawIDToken)
	f.saveToken(w, r, AccessTokenName, oauth2Token.AccessToken)

	// see if we can grab the URL that the user was previously on from the state
	path, err := base64.URLEncoding.DecodeString(r.URL.Query().Get("state"))
	if err != nil {
		log.Error(err, "failed to decode base64 state", "raw", r.URL.Query().Get("state"))
	}

	// send the user a bit of HTML that will then
	// redirect them to the proper location.
	// we need to do this so that Go sets the cookies,
	// and we're not stuck in an infinite loop
	w.Header().Set("Content-Type", "text/html")
	if err := redirectTemplate.Execute(w, Redirect{Path: string(path)}); err != nil {
		log.Error(err, "failed to execute redirect template", "path", path)
		http.Error(w, "Could not generate direction template. Please reload the page to try again.", http.StatusInternalServerError)
		return
	}
	log.V(2).Info("redirecting user after successful callback")
}

// getUserInfo retrieves OIDC UserInfo from the OIDC provider.
// If it has previously cached, it will return cached data.
func (f *Filter) getUserInfo(ctx context.Context, token *oauth2.Token) (Claims, bool) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(1).Info("fetching userinfo")
	claims := Claims{}
	// otherwise fetch the data manually
	userInfo, err := f.provider.UserInfo(ctx, oauth2.StaticTokenSource(token))
	if err != nil {
		log.Error(err, "failed to get userinfo")
		return nil, false
	}
	var info Claims
	if err := userInfo.Claims(&info); err != nil {
		log.Error(err, "failed to unmarshal claims")
		return nil, false
	}
	for k, v := range info {
		claims[safeHeader(k)] = v
	}
	log.Info("successfully retrieved user claims", "Claims", claims)
	return claims, true
}

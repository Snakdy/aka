package oidc

import (
	"errors"
	"fmt"
	"github.com/go-logr/logr"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
)

func (f *Filter) Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		oidcUser, err := f.DoFilter(w, r)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		r.Header.Del(xForwardedUser)
		r.Header.Del(xForwardedEmail)
		r.Header.Del(xForwardedGroups)
		r.Header.Del(xForwardedUsername)
		if oidcUser.Sub != "" {
			r.Header.Set(xForwardedUser, oidcUser.Sub)
			r.Header.Set(xForwardedEmail, oidcUser.Email)
			r.Header.Set(xForwardedGroups, strings.Join(oidcUser.Groups, ","))
			r.Header.Set(xForwardedUsername, oidcUser.Username)
		}
		h.ServeHTTP(w, r)
	})
}

func (f *Filter) DoFilter(w http.ResponseWriter, r *http.Request) (User, error) {
	log := logr.FromContextOrDiscard(r.Context()).WithValues("path", r.URL.Path)
	log.Info("checking for OIDC cookie", "UserAgent", r.UserAgent())
	accessToken, err := f.getToken(r, AccessTokenName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		log.V(2).Error(err, "failed to extract access_token from cookie")
	}
	refreshToken, err := f.getToken(r, TokenName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		log.V(2).Error(err, "failed to extract refresh_token from cookie")
	}
	// get the raw token from the cookie
	rawIDToken, err := f.getToken(r, IDName)
	if err != nil && !errors.Is(err, http.ErrNoCookie) {
		log.V(2).Error(err, "failed to extract id_token from cookie")
		return User{}, nil
	}
	idToken, err := f.isTokenValid(r.Context(), rawIDToken)
	if err != nil {
		// try to exchange the token for a new one (refresh flow)
		ts := f.config.TokenSource(r.Context(), &oauth2.Token{RefreshToken: refreshToken})
		newToken, err := ts.Token()
		if err != nil {
			log.Error(err, "failed to exchange token")
			return User{}, nil
		}
		log.Info("successfully retrieved new oidc token")
		// save the new token
		f.saveToken(w, r, TokenName, newToken.RefreshToken)
		// save the new token
		accessToken = newToken.AccessToken
		f.saveToken(w, r, AccessTokenName, newToken.AccessToken)
		// get the id token from our new oauth2 token
		rid, ok := newToken.Extra("id_token").(string)
		if !ok {
			log.Info("failed to get id_token from oauth2 token")
			return User{}, nil
		}
		rawIDToken = rid
		// verify the new id token
		idToken, err = f.isTokenValid(r.Context(), rid)
		if err != nil {
			log.Error(err, "failed to validate refreshed token")
			return User{}, nil
		}
	}
	// assume from here-on that the token is valid
	log.Info("oidc token has been successfully validated")
	f.saveToken(w, r, IDName, rawIDToken)
	// parse the claims if we can
	claims := Claims{}
	if err := idToken.Claims(&claims); err != nil {
		log.Error(err, "failed to marshal claims from oidc token")
	}
	// fetch the userInfo if we've cached it
	userInfo, ok := f.getUserInfo(r.Context(), &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		Expiry:       idToken.Expiry,
	})
	if ok {
		log.Info("located userinfo")
		for k, v := range userInfo {
			claims[safeHeader(k)] = v
		}
	}
	log.Info("successfully retrieved OIDC user", "Sub", idToken.Subject, "Iss", idToken.Issuer, "Claims", claims)
	// safely handle claims
	email, _ := claims[f.opts.Claim.Email].(string)
	username, _ := claims[f.opts.Claim.Email].(string)

	var groups []string
	groupClaimRaw, ok := claims[f.opts.Claim.Groups]
	if ok {
		groups = parseGroupsClaim(groupClaimRaw)
	}

	// return the required info
	return User{
		Sub:      idToken.Subject,
		Iss:      idToken.Issuer,
		Email:    email,
		Groups:   groups,
		Username: username,
	}, nil
}

func parseGroupsClaim(claim any) []string {
	// if the claim is a slice of strings,
	// then we can exit early
	if groups, ok := claim.([]string); ok {
		return groups
	}
	// otherwise try our best to
	// parse it
	groupClaim, ok := claim.([]any)
	if !ok {
		return nil
	}
	groups := make([]string, len(groupClaim))
	for i := range groupClaim {
		groups[i] = fmt.Sprintf("%v", groupClaim[i])
	}
	return groups
}

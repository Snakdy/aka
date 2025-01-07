package oidc

import (
	"context"
	"fmt"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/go-logr/logr"
	"net/http"
	"time"
)

// isTokenValid checks whether a given oidc id_token is valid
func (f *Filter) isTokenValid(ctx context.Context, token string) (*oidc.IDToken, error) {
	log := logr.FromContextOrDiscard(ctx)
	idToken, err := f.verifier.Verify(ctx, token)
	if err != nil {
		log.Error(err, "failed to verify OIDC token")
		return nil, err
	}
	return idToken, nil
}

func (f *Filter) getToken(r *http.Request, name string) (string, error) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return "", fmt.Errorf("retrieving cookie: %w", err)
	}
	return cookie.Value, nil
}

func (f *Filter) saveToken(w http.ResponseWriter, r *http.Request, name, token string) {
	cookie := &http.Cookie{
		Name:     name,
		Value:    token,
		HttpOnly: true,
		Domain:   r.Host,
		Secure:   true,
		Path:     "/",
		SameSite: f.cookieSameSite,
		Expires:  time.Now().AddDate(999, 0, 0),
	}
	http.SetCookie(w, cookie)
}

func safeHeader(s string) string {
	return HeaderKeyRegex.ReplaceAllString(s, "-")
}

package oidc

import (
	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
	"net/http"
	"regexp"
)

type Claims map[string]any

var HeaderKeyRegex = regexp.MustCompile(`[^\w!#$%&'*+\-.^\x60|~]`)

var (
	xForwardedUser     = http.CanonicalHeaderKey("X-Forwarded-User")
	xForwardedGroups   = http.CanonicalHeaderKey("X-Forwarded-Groups")
	xForwardedEmail    = http.CanonicalHeaderKey("X-Forwarded-Email")
	xForwardedUsername = http.CanonicalHeaderKey("X-Forwarded-Preferred-Username")
)

const (
	AccessTokenName = "oidc-access-token"
	TokenName       = "oidc-token"
	IDName          = "oidc-id_token"
)

type Filter struct {
	config         oauth2.Config
	provider       *oidc.Provider
	verifier       *oidc.IDTokenVerifier
	cookieSameSite http.SameSite
	opts           Options
}

type User struct {
	Sub      string
	Iss      string
	Groups   []string
	Email    string
	Username string
}

type Options struct {
	IssuerURI string `split_words:"true"`
	Client    struct {
		ID     string `split_words:"true" required:"true"`
		Secret string `split_words:"true" required:"true"`
	}
	Claim struct {
		Email             string `split_words:"true" default:"email"`
		Groups            string `split_words:"true" default:"groups"`
		PreferredUsername string `split_words:"true" default:"preferred_username"`
	}
	RedirectURI    string   `split_words:"true" required:"true"`
	CookieSameSite string   `split_words:"true" default:"Lax"`
	Scopes         []string `split_words:"true" required:"true"`
}

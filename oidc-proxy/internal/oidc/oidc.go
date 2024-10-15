package oidc

import (
	"context"
	"fmt"
	"github.com/coreos/go-oidc"
	"golang.org/x/oauth2"
	"net/http"
	"strings"
)

func NewFilter(ctx context.Context, opts Options) (*Filter, error) {
	provider, err := oidc.NewProvider(ctx, opts.IssuerURI)
	if err != nil {
		return nil, fmt.Errorf("getting oidc provider: %w", err)
	}
	var sameSite http.SameSite
	switch strings.ToLower(opts.CookieSameSite) {
	default:
		fallthrough
	case "lax":
		sameSite = http.SameSiteLaxMode
	case "strict":
		sameSite = http.SameSiteStrictMode
	case "none":
		sameSite = http.SameSiteNoneMode
	}
	return &Filter{
		config: oauth2.Config{
			ClientID:     opts.Client.ID,
			ClientSecret: opts.Client.Secret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  opts.RedirectURI,
			Scopes:       append(opts.Scopes, oidc.ScopeOpenID),
		},
		provider:       provider,
		verifier:       provider.Verifier(&oidc.Config{ClientID: opts.Client.ID}),
		cookieSameSite: sameSite,
		opts:           opts,
	}, nil
}

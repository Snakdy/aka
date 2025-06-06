package oidc

import (
	"encoding/base64"
	"github.com/go-logr/logr"
	"net/http"
)

func (f *Filter) GetRedirect(w http.ResponseWriter, r *http.Request) {
	log := logr.FromContextOrDiscard(r.Context())
	uri := f.config.AuthCodeURL("state")
	log.V(1).Info("fetching redirect uri", "path", r.URL.Path, "url", uri)
	_, _ = w.Write([]byte(uri))
}

func (f *Filter) HandleRedirect(w http.ResponseWriter, r *http.Request) {
	log := logr.FromContextOrDiscard(r.Context())
	// encore the current path in the URL
	state := base64.URLEncoding.EncodeToString([]byte(r.URL.Path))
	uri := f.config.AuthCodeURL(state)
	log.V(1).Info("redirecting request", "path", r.URL.Path, "url", uri)
	http.Redirect(w, r, uri, http.StatusFound)
}

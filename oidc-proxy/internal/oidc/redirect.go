package oidc

import (
	"github.com/go-logr/logr"
	"net/http"
)

func (f *Filter) HandleRedirect(w http.ResponseWriter, r *http.Request) {
	log := logr.FromContextOrDiscard(r.Context())
	uri := f.config.AuthCodeURL("state")
	log.V(1).Info("redirecting request", "path", r.URL.Path, "url", uri)
	http.Redirect(w, r, uri, http.StatusFound)
}

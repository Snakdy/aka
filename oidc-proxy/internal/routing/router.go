package routing

import (
	"net/http"
	"strings"
)

func NewRouter(upstreams []Upstream) *Router {
	return &Router{upstreams: upstreams}
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	requestPath := req.URL.Path

	var longest *Upstream
	for _, u := range r.upstreams {
		if !strings.HasPrefix(requestPath, u.Path) {
			continue
		}
		if longest == nil || len(u.Path) > len(longest.Path) {
			longest = &u
		}
	}
	if longest == nil {
		http.Error(w, "no valid upstream", http.StatusBadGateway)
		return
	}
	longest.ServeHTTP(w, req)
}

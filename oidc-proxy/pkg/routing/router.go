package routing

import (
	"errors"
	"net/http"
	"strings"
)

func NewRouter(upstreams []Upstream) *Router {
	return &Router{upstreams: upstreams}
}

func (r *Router) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	requestPath := req.URL.Path

	longest, err := r.getRouterForPath(requestPath)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	longest.ServeHTTP(w, req)
}

func (r *Router) getRouterForPath(path string) (*Upstream, error) {
	var longest *Upstream
	for _, u := range r.upstreams {
		if !strings.HasPrefix(path, u.Path) {
			continue
		}
		if longest == nil || len(u.Path) > len(longest.Path) {
			longest = &u
		}
	}
	if longest == nil {
		return nil, errors.New("no valid upstream")
	}
	return longest, nil
}

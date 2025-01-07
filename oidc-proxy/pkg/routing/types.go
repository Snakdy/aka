package routing

import "net/http"

type Router struct {
	upstreams []Upstream
}

type Upstream struct {
	http.Handler
	Path string
}

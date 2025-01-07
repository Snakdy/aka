package proxy

import (
	"net/http/httputil"
	"net/url"
)

type Handler struct {
	target *url.URL
	proxy  *httputil.ReverseProxy
}

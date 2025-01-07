package proxy

import (
	"crypto/tls"
	"fmt"
	"github.com/go-logr/logr"
	"net/http"
	"net/http/httputil"
	"net/url"
)

var (
	xForwardedHost  = http.CanonicalHeaderKey("X-Forwarded-Host")
	xForwardedProto = http.CanonicalHeaderKey("X-Forwarded-Proto")
)

func NewHandler(target string) (*Handler, error) {
	uri, err := url.Parse(target)
	if err != nil {
		return nil, fmt.Errorf("parsing proxy target: %w", err)
	}
	proxyUri := *uri
	proxyUri.Path = ""

	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.TLSClientConfig = &tls.Config{
		MinVersion: tls.VersionTLS12,
		CipherSuites: []uint16{
			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
			tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
		},
	}
	transport.ForceAttemptHTTP2 = true

	proxy := httputil.NewSingleHostReverseProxy(&proxyUri)
	proxy.Transport = transport
	proxy.ModifyResponse = func(response *http.Response) error {
		log := logr.FromContextOrDiscard(response.Request.Context())
		log.Info("proxying response", "method", response.Request.Method, "url", response.Request.URL.Redacted(), "contentLength", response.ContentLength, "code", response.StatusCode)
		return nil
	}

	return &Handler{
		target: uri,
		proxy:  proxy,
	}, nil
}

func (h *Handler) Target() *url.URL {
	return h.target
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	log := logr.FromContextOrDiscard(r.Context())
	log.Info("proxying request", "method", r.Method, "url", r.URL.Redacted(), "contentLength", r.ContentLength)

	originalURL := *r.URL

	// update the request
	r.URL.Host = h.target.Host
	r.URL.Scheme = h.target.Scheme
	r.Header.Set(xForwardedHost, originalURL.Host)
	r.Header.Set(xForwardedProto, originalURL.Scheme)
	r.Host = h.target.Host

	h.proxy.ServeHTTP(w, r)
}

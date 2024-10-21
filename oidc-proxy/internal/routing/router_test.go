package routing

import (
	"github.com/stretchr/testify/assert"
	"net/http"
	"testing"
)

func TestRouter_ServeHTTP(t *testing.T) {
	router := NewRouter([]Upstream{
		{
			http.HandlerFunc(http.NotFound),
			"/",
		},
		{
			http.HandlerFunc(http.NotFound),
			"/foo",
		},
		{
			http.HandlerFunc(http.NotFound),
			"/foo/bar",
		},
		{
			http.HandlerFunc(http.NotFound),
			"/foobar",
		},
	})

	var cases = []struct {
		in  string
		out string
	}{
		{
			"/index.html",
			"/",
		},
		{
			"/foo/bar/zoo",
			"/foo/bar",
		},
		{
			"/foo/bar",
			"/foo/bar",
		},
		{
			"/foo/zoo",
			"/foo",
		},
		{
			"/foobar/zoo",
			"/foobar",
		},
	}

	for _, tt := range cases {
		t.Run(tt.in, func(t *testing.T) {
			out, err := router.getRouterForPath(tt.in)
			assert.NoError(t, err)
			assert.EqualValues(t, tt.out, out.Path)
		})
	}
}

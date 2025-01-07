package proxy

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHandler_ServeHTTP(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))

	resource := httptest.NewServer(http.HandlerFunc(http.NotFound))
	t.Cleanup(resource.Close)

	h, err := NewHandler(resource.URL)
	require.NoError(t, err)
	require.NotNil(t, h)

	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest("GET", "/", nil).WithContext(ctx))
	assert.Equal(t, http.StatusNotFound, w.Code)
}

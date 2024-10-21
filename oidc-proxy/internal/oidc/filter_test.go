package oidc

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestParseGroupsClaim(t *testing.T) {
	var cases = []struct {
		in  any
		out []string
	}{
		{
			nil,
			nil,
		},
		{
			struct{}{},
			nil,
		},
		{
			"foo",
			nil,
		},
		{
			[]string{"foo", "bar"},
			[]string{"foo", "bar"},
		},
		{
			[]any{"foo", "bar"},
			[]string{"foo", "bar"},
		},
	}
	for _, tt := range cases {
		t.Run("", func(t *testing.T) {
			out := parseGroupsClaim(tt.in)
			assert.EqualValues(t, tt.out, out)
		})
	}
}

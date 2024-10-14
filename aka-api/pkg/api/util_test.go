/*
 *    Copyright 2021 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

package api

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/av1o/cap10/pkg/verify"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetUsername(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))
	req := &http.Request{
		Header: map[string][]string{
			client.DefaultSubjectHeader: {"<CN=Test User>"},
			client.DefaultIssuerHeader:  {"<CN=Test Issuer>"},
		},
	}
	w := httptest.NewRecorder()
	c := client.NewClient(verify.NewNoOpVerifier())
	c.WithUserFunc(func(w http.ResponseWriter, r *http.Request) {
		expected := "CN=Test Issuer/CN=Test User"
		assert.EqualValues(t, expected, GetUsername(r))
	})(w, req.WithContext(ctx))
}

func TestGetUsernameEmpty(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))
	r := &http.Request{}
	assert.Empty(t, GetUsername(r.WithContext(ctx)))
}

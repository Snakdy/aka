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
	"gitlab.dcas.dev/jmp/go-jmp/internal/identity"
	"net/http"
)

// GetUsername returns the username
// of the currently authenticated
// user. Will return an empty string ""
// if there is no user.
func GetUsername(r *http.Request) string {
	return GetUsernameCtx(r.Context())
}

// GetUsernameCtx returns the username
// of the currently authenticated
// user. Will return an empty string ""
// if there is no user.
func GetUsernameCtx(ctx context.Context) string {
	log := logr.FromContextOrDiscard(ctx)
	user, ok := identity.GetContextUser(ctx)
	if !ok {
		log.Info("failed to locate user")
		return ""
	}
	return user.Subject
}

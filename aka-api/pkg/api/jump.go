/*
 *    Copyright 2020 Django Cass
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
	"encoding/base64"
	"errors"
	"fmt"
	"github.com/Snakdy/go-rbac-proxy/pkg/rbac"
	"github.com/go-logr/logr"
	"github.com/gorilla/mux"
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"net/http"
	"strconv"
	"strings"
)

type JumpAPI struct {
	svc *JumpService
}

func NewJumpAPI(ctx context.Context, repos *dao.Repos, auth *client.Client, allowPublicJumpCreation bool, authz rbac.AuthorityClient, router *mux.Router) *JumpAPI {
	api := new(JumpAPI)
	api.svc = NewJumpService(ctx, repos, authz, allowPublicJumpCreation, nil)

	router.HandleFunc("/v3/jump", auth.WithOptionalUserFunc(func(w http.ResponseWriter, r *http.Request) {
		withPagedData(w, r, api.List)
	})).Methods(http.MethodGet)
	router.HandleFunc("/v3/jump/-/{target}", auth.WithOptionalUserFunc(func(w http.ResponseWriter, r *http.Request) {
		withPagedData(w, r, api.Jump)
	})).Methods(http.MethodGet)

	return api
}

// List godoc
// @Security AuthUser
// @Security AuthSource
// @Tags jump
// @Summary get all visible jumps
// @Produce json
// @Param page_offset query string false "Page offset"
// @Param page_size query string false "Page size"
// @Success 200 {object} PageResponse
// @Failure 400 {string} string "bad request"
// @Failure 500 {string} string "internal server error"
// @Router /v3/jump [get]
func (api *JumpAPI) List(_ http.ResponseWriter, r *http.Request, pr PageRequest) (PageResponse, int, error) {
	results, err := api.svc.List(r.Context(), pr.PageOffset, pr.PageSize)
	if err != nil {
		return PageResponse{}, http.StatusInternalServerError, err
	}
	nextOffset := pr.PageOffset + pr.PageSize
	if !results.More {
		nextOffset = -1
	}
	return PageResponse{
		NextPageOffset: nextOffset,
		TotalItems:     int64(results.Count),
		Content:        results.Results,
	}, http.StatusOK, nil
}

// Jump godoc
// @Security AuthUser
// @Security AuthSource
// @Tags jump
// @Summary search for jumps
// @Produce json
// @Param page_offset query string false "Page offset"
// @Param page_size query string false "Page size"
// @Param target path string true "Search term"
// @Param id query int false "Specific jump ID"
// @Success 200 {object} []dao.Jump
// @Failure 400 {string} string "bad request"
// @Failure 500 {string} string "internal server error"
// @Router /v3/jump/-/{target} [get]
func (api *JumpAPI) Jump(_ http.ResponseWriter, r *http.Request, pr PageRequest) (PageResponse, int, error) {
	log := logr.FromContextOrDiscard(r.Context())
	t, ok := mux.Vars(r)["target"]
	if !ok || t == "" {
		return PageResponse{}, http.StatusBadRequest, errors.New("target must be a non-empty string")
	}
	idStr := r.URL.Query().Get("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		log.Info("given id param may have been given incorrectly", "Value", idStr)
		id = -1
	}
	jumps, err := api.svc.Search(r.Context(), pr.PageOffset, pr.PageSize, id, t)
	if err != nil {
		return PageResponse{}, http.StatusBadRequest, err
	}
	nextOffset := pr.PageOffset + pr.PageSize
	if !jumps.More {
		nextOffset = -1
	}
	// return our response
	return PageResponse{
		NextPageOffset: nextOffset,
		TotalItems:     int64(jumps.Count),
		Content:        jumps,
	}, http.StatusOK, nil
}

// getValidTarget performs any required validation on an incoming jump request
func (api *JumpAPI) getValidTarget(ctx context.Context, encodedTarget string, id int) (string, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id, "Target", encodedTarget)
	// decode the target query and trim any whitespace
	target := ""
	t, err := base64.StdEncoding.DecodeString(encodedTarget)
	if err != nil {
		log.Error(err, "failed to parse base64 data", "Size", len(encodedTarget))
		target = strings.TrimSpace(encodedTarget)
	} else {
		// trim whitespace
		target = strings.TrimSpace(string(t))
	}
	if target == "" && id < 0 {
		return "", fmt.Errorf("empty or null target for id: %d", id)
	}
	return target, nil
}

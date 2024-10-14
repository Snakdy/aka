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
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/svc"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type SimilarService struct {
	repos *dao.Repos
	svc   *svc.SimilarService
}

func NewSimilarService(repos *dao.Repos, svc *svc.SimilarService) *SimilarService {
	return &SimilarService{
		repos: repos,
		svc:   svc,
	}
}

func (svc *SimilarService) GetSimilarJump(ctx context.Context, query string) ([]*model.Jump, error) {
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_similar_getSimilarJump", trace.WithAttributes(attribute.String("query", query)))
	defer span.End()
	items, err := svc.getSimilar(ctx)
	if err != nil {
		return nil, err
	}
	return svc.svc.ForJumping(ctx, items, query), nil
}

func (svc *SimilarService) GetSimilarSuggest(ctx context.Context, query string) ([]string, error) {
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_similar_getSimilarSuggest", trace.WithAttributes(attribute.String("query", query)))
	defer span.End()
	items, err := svc.getSimilar(ctx)
	if err != nil {
		return nil, err
	}
	return svc.svc.ForSuggesting(ctx, items, query), nil
}

func (svc *SimilarService) getSimilar(ctx context.Context) ([]*model.Jump, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_similar_getSimilar")
	defer span.End()
	username := GetUsernameCtx(ctx)
	// get the users groups
	groups, err := svc.repos.GroupRepo.GetUserGroups(ctx, username)
	if err != nil {
		log.Error(err, "failed to get user groups, response may be limited")
		groups = nil
	}
	groupIDs := make([]uint, len(groups))
	for i := range groups {
		groupIDs[i] = groups[i].ID
	}
	results, err := svc.repos.JumpRepo.GetAll(ctx, username, 0, 20, groupIDs)
	if err != nil {
		return nil, err
	}
	items := make([]*model.Jump, len(results.Results))
	for i := range results.Results {
		items[i] = results.Results[i].(*model.Jump)
	}
	return items, nil
}

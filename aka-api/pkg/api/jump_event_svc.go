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
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type JumpEventService struct {
	repos *dao.Repos
}

func NewJumpEventService(repos *dao.Repos) *JumpEventService {
	return &JumpEventService{
		repos: repos,
	}
}

func (svc *JumpEventService) GetTopPicks(ctx context.Context, amount int) ([]*model.Jump, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_event_getTopPicks", trace.WithAttributes(attribute.Int("amount", amount)))
	defer span.End()
	user, _ := client.GetContextUser(ctx)
	// get distinct jumps for this user
	topIds, err := svc.repos.JumpEventRepo.GetFrequencyByUserID(ctx, user.AsUsername(), amount)
	if err != nil {
		return nil, err
	}
	// convert the ids back to a list of jumps
	// this could probably be replaced with a join (see #1)

	//goland:noinspection GoPreferNilSlice
	jumps := []*model.Jump{}
	for _, i := range topIds {
		j, err := svc.repos.JumpRepo.GetByID(ctx, i.JumpID)
		if err != nil {
			log.Error(err, "failed to find jump", "ID", i)
			continue
		}
		jumps = append(jumps, j)
	}
	return jumps, nil
}

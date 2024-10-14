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

package dao

import (
	"context"
	"github.com/go-logr/logr"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type JumpEventFrequency struct {
	JumpID uint
	Count  int64
}

type JumpEventRepo struct {
	Repository
}

// Save creates or updates a given JumpEvent
func (r *JumpEventRepo) Save(ctx context.Context, e *model.JumpEvent) (*model.JumpEvent, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_event_save")
	defer span.End()
	if err := r.db.WithContext(ctx).Save(e).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to save JumpEvent")
		return nil, err
	}
	return e, nil
}

func (r *JumpEventRepo) GetFrequencyByUserID(ctx context.Context, userID string, limit int) ([]JumpEventFrequency, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_jump_event_getFrequencyByUserID", trace.WithAttributes(
		attribute.Int("limit", limit),
		attribute.String("user", userID),
	))
	defer span.End()
	var results []JumpEventFrequency
	if err := r.db.WithContext(ctx).
		Table("jump_events").
		Select("jump_id, count(jump_id)").
		Where("user_id = ?", userID).
		Group("jump_id").
		Order("count(jump_id) desc").
		Limit(limit).
		Scan(&results).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to retrieve frequent jump events")
		return nil, err
	}
	return results, nil
}

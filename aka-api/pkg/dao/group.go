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

package dao

import (
	"context"
	"errors"
	"github.com/go-logr/logr"
	"gitlab.dcas.dev/jmp/go-jmp/internal/identity"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type GroupRepo struct {
	Repository
}

// Save creates or updates a given Group
func (r *GroupRepo) Save(e *model.Group) (*model.Group, error) {
	return e, r.db.Save(e).Error
}

func (r *GroupRepo) FindByID(ctx context.Context, id int) (*model.Group, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_group_findByID", trace.WithAttributes(
		attribute.Int("id", id),
	))
	defer span.End()
	user, _ := identity.GetContextUser(ctx)
	var result model.Group
	if err := r.db.Where("id = ?", id).Where("position(? in users) > 0", user.Subject).First(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to find Group")
		return nil, err
	}
	return &result, nil
}

// FindByName returns a Group by a given name
func (r *GroupRepo) FindByName(ctx context.Context, name string) (*model.Group, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Name", name)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_group_findByName", trace.WithAttributes(attribute.String("name", name)))
	defer span.End()
	var result model.Group
	if err := r.db.WithContext(ctx).Where("name = ?", name).First(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to find Group")
		return nil, err
	}
	return &result, nil
}

// GetUserGroups gets all groups that contain a given user.
// If the given user is NOT the current user, the groups
// returned will be the intersection of groups shared between both
// users.
func (r *GroupRepo) GetUserGroups(ctx context.Context, username string) ([]*model.Group, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_group_getUserGroups", trace.WithAttributes(attribute.String("user", username)))
	defer span.End()
	var results []*model.Group
	user, ok := identity.GetContextUser(ctx)
	if !ok {
		return nil, errors.New("unauthorised")
	}

	query := r.db.Where("position(? in users) > 0", username)
	if user.Subject != username {
		// intersect with the current user
		query = query.Where("position(? in users) > 0", user.Subject)
	}
	if err := query.WithContext(ctx).Order("name asc").Find(&results).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to get groups for user")
		return nil, err
	}
	return results, nil
}

// GetGroups gets all groups visible to the
// requesting user.
func (r *GroupRepo) GetGroups(ctx context.Context, user string, offset, limit int) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_group_getGroups", trace.WithAttributes(
		attribute.Int("offset", offset),
		attribute.Int("limit", limit),
	))
	defer span.End()
	var result []*model.Group
	var count int64
	r.db.WithContext(ctx).Model(&model.Group{}).Where("position(? in users) > 0 OR public = true", user).Count(&count)
	if err := r.db.Where("position(? in users) > 0 OR public = true", user).Order("name asc").Limit(limit).Offset(offset).Find(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to read groups")
		return nil, err
	}
	pageable := make([]model.Pageable, len(result))
	for i := range result {
		pageable[i] = result[i]
	}
	return &model.Page{
		Results: pageable,
		Count:   int(count),
		More:    count-int64((offset+1)*limit) > 0,
	}, nil
}

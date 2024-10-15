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
	"gorm.io/gorm"
	"strconv"
	"strings"
)

type UserV2 struct {
	gorm.Model
	Subject  string `json:"subject" gorm:"uniqueIndex"`
	Email    string `json:"email"`
	Groups   string `json:"groups"`
	Username string `json:"username"`
}

func (UserV2) TableName() string {
	return model.TableNameUsersV2
}

func (*UserV2) IsPageable() {}

type UserV2Repo struct {
	Repository
}

// Save creates or updates a given User
func (r *UserV2Repo) Save(ctx context.Context, e *UserV2) (*UserV2, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_userv2_save")
	defer span.End()
	if err := r.db.WithContext(ctx).Save(e).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to save user")
		return nil, err
	}
	return e, nil
}

func (r *UserV2Repo) Get(ctx context.Context, sub string) (*UserV2, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_userv2_get", trace.WithAttributes(
		attribute.String("sub", sub),
	))
	defer span.End()
	var result UserV2
	if err := r.db.WithContext(ctx).Where("subject = ?", sub).First(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to fetch User")
		return nil, err
	}
	return &result, nil
}

func (r *UserV2Repo) GetUsers(ctx context.Context, offset, limit int) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_userv2_getUsers", trace.WithAttributes(
		attribute.Int("offset", offset),
		attribute.Int("limit", limit),
	))
	defer span.End()
	var result []*UserV2
	var count int64
	r.db.WithContext(ctx).Model(&UserV2{}).Count(&count)
	if err := r.db.WithContext(ctx).Limit(limit).Offset(offset).Order("subject asc").Find(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to read users")
		return nil, err
	}
	// convert our results to the pageable type
	pageable := make([]model.Pageable, len(result))
	for i := range result {
		pageable[i] = &model.User{
			ID:       strconv.Itoa(int(result[i].ID)),
			Subject:  result[i].Subject,
			Username: result[i].Username,
			Email:    result[i].Email,
			Admin:    false,
			Groups:   strings.Split(result[i].Groups, ","),
		}
	}
	return &model.Page{
		Results: pageable,
		Count:   int(count),
		More:    count-int64((offset+1)*limit) > 0,
	}, nil
}

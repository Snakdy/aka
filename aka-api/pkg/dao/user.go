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
	"strings"
)

type User struct {
	gorm.Model
	Subject string `json:"subject"`
	Issuer  string `json:"issuer"`
	Groups  string `json:"groups"`
}

func (User) TableName() string {
	return model.TableNameUsers
}

func (*User) IsPageable() {}

type UserRepo struct {
	Repository
}

// Save creates or updates a given User
func (r *UserRepo) Save(ctx context.Context, e *User) (*User, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_jump_save")
	defer span.End()
	if err := r.db.WithContext(ctx).Save(e).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to save User")
		return nil, err
	}
	return e, nil
}

func (r *UserRepo) Get(ctx context.Context, sub, iss string) (*User, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_jump_get", trace.WithAttributes(
		attribute.String("sub", sub),
		attribute.String("iss", iss),
	))
	defer span.End()
	var result User
	if err := r.db.WithContext(ctx).Where("subject = ? AND issuer = ?", sub, iss).First(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to fetch User")
		return nil, err
	}
	return &result, nil
}

func (r *UserRepo) GetUsers(ctx context.Context, offset, limit int) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_user_getUsers", trace.WithAttributes(
		attribute.Int("offset", offset),
		attribute.Int("limit", limit),
	))
	defer span.End()
	var result []*User
	var count int64
	r.db.WithContext(ctx).Model(&User{}).Count(&count)
	if err := r.db.WithContext(ctx).Limit(limit).Offset(offset).Order("subject asc").Find(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to read users")
		return nil, err
	}
	// convert our results to the pageable type
	pageable := make([]model.Pageable, len(result))
	for i := range result {
		pageable[i] = &model.User{
			ID:      int(result[i].ID),
			Subject: result[i].Subject,
			Issuer:  result[i].Issuer,
			Groups:  strings.Split(result[i].Groups, ","),
			Admin:   false,
			Claims:  nil,
		}
	}
	return &model.Page{
		Results: pageable,
		Count:   int(count),
		More:    count-int64((offset+1)*limit) > 0,
	}, nil
}

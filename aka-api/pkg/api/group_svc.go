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
	"errors"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/schemas"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"gorm.io/gorm"
	"slices"
	"strings"
)

type GroupService struct {
	*ListeningService
	repos *dao.Repos
	authz rbac.AuthorityClient
}

func NewGroupService(ctx context.Context, repos *dao.Repos, authz rbac.AuthorityClient, listener chan *dao.Message) *GroupService {
	return &GroupService{
		repos:            repos,
		authz:            authz,
		ListeningService: NewListeningService(ctx, listener),
	}
}

func (svc *GroupService) Create(ctx context.Context, name string, public, external bool) (*model.Group, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Name", name, "Public", public, "external", external)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_group_create", trace.WithAttributes(attribute.String("name", name)))
	defer span.End()
	log.V(1).Info("creating group")
	username := GetUsernameCtx(ctx)
	// check to make sure that the group doesn't already exist
	group, err := svc.repos.GroupRepo.FindByName(ctx, name)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}
	if group == nil {
		group = &model.Group{
			Name:     name,
			Public:   public,
			Owner:    username,
			External: external,
		}
	}
	users := strings.Split(group.Users, ",")
	if !slices.Contains(users, username) {
		users = append(users, username)
	}
	group.External = external
	group.Users = strings.Join(users, ",")
	group, err = svc.repos.GroupRepo.Save(group)
	if err != nil {
		return nil, err
	}
	// create role bindings
	if _, err := svc.authz.AddRole(ctx, &rbac.AddRoleRequest{
		Subject:  username,
		Resource: schemas.ResourceName(schemas.ResourceGroup, group.ID),
		Action:   rbac.Verb_SUDO,
	}); err != nil {
		log.Error(err, "failed to create owner role binding")
		return nil, err
	}
	return group, nil
}

func (svc *GroupService) Patch(ctx context.Context, opt model.EditGroup) (*model.Group, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_group_patch", trace.WithAttributes(attribute.Int("id", opt.ID)))
	defer span.End()
	log.V(1).Info("patching group")

	resp, err := svc.authz.Can(ctx, &rbac.AccessRequest{
		Subject:  GetUsernameCtx(ctx),
		Resource: schemas.ResourceName(schemas.ResourceGroup, opt.ID),
		Action:   rbac.Verb_UPDATE,
	})
	if err != nil {
		return nil, err
	}
	if !resp.Ok {
		return nil, ErrForbidden
	}
	// check that the group exists AND that we're
	// allowed to see it
	group, err := svc.repos.GroupRepo.FindByID(ctx, opt.ID)
	if err != nil {
		return nil, ErrNotFound
	}
	group.Public = opt.Public
	if opt.Owner != "" {
		log.Info("updating group owner", "Before", group.Owner, "After", opt.Owner)
		group.Owner = opt.Owner
	}
	return svc.repos.GroupRepo.Save(group)
}

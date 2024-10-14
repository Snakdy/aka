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
	"fmt"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/schemas"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"strings"
	"time"
)

type JumpService struct {
	*ListeningService
	repos                   *dao.Repos
	authz                   rbac.AuthorityClient
	allowPublicJumpCreation bool
}

type CreateJumpOpts struct {
	GID      int
	Name     string
	Location string
	Alias    []string
}

type UpdateJumpOpts struct {
	ID       int
	Name     string
	Location string
	Alias    []string
}

func NewJumpService(ctx context.Context, repos *dao.Repos, authz rbac.AuthorityClient, allowPublicJumpCreation bool, listener chan *dao.Message) *JumpService {
	return &JumpService{
		repos:                   repos,
		authz:                   authz,
		allowPublicJumpCreation: allowPublicJumpCreation,
		ListeningService:        NewListeningService(ctx, listener),
	}
}

func (svc *JumpService) List(ctx context.Context, offset, limit int) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Offset", offset, "Limit", limit)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_list", trace.WithAttributes(attribute.Int("offset", offset), attribute.Int("limit", limit)))
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
	results, err := svc.repos.JumpRepo.GetAll(ctx, username, offset, limit, groupIDs)
	if err != nil {
		return nil, err
	}
	return results, nil
}

func (svc *JumpService) Search(ctx context.Context, offset, limit, query int, target string) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Offset", offset, "Limit", limit, "Query", query, "Target", target)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_search", trace.WithAttributes(
		attribute.Int("offset", offset),
		attribute.Int("limit", limit),
		attribute.Int("query", query),
		attribute.String("target", target),
	))
	defer span.End()
	username := GetUsernameCtx(ctx)
	target, err := svc.getValidTarget(ctx, target, query)
	if err != nil {
		log.Error(err, "failed to lookup target")
		return nil, err
	}
	var jumps []*model.Jump
	more := false
	var total int
	if query > 0 {
		// load a specific item by id
		log.Info("got request for a specific jump")
		jump, err := svc.JumpTo(ctx, query)
		if err != nil {
			return nil, err
		}
		jumps = append(jumps, jump)
		total = 1
		more = false
	} else {
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
		// do a general search for relevant jumps
		results, err := svc.repos.JumpRepo.SearchForTerm(ctx, username, target, offset, limit, groupIDs)
		if err != nil {
			return nil, err
		}
		more = results.More
		total = results.Count
		log.V(1).Info("located items in search", "Count", len(results.Results))
		for _, res := range results.Results {
			// hi future me!
			// if there's an error thrown here it's going to be
			// because of this cast
			j, ok := res.(*model.Jump)
			if !ok {
				log.Info("failed to case Pageable item into *model.Jump")
				continue
			}
			jumps = append(jumps, j)
		}
	}
	log.Info("successfully got items", "Count", len(jumps))
	results := make([]model.Pageable, len(jumps))
	for i := range jumps {
		results[i] = jumps[i]
	}
	return &model.Page{
		Results: results,
		Count:   total,
		More:    more,
	}, nil
}

func (svc *JumpService) JumpTo(ctx context.Context, query int) (*model.Jump, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Query", query)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_jumpTo", trace.WithAttributes(attribute.Int("query", query)))
	defer span.End()
	username := GetUsernameCtx(ctx)
	// load a specific item by id
	log.Info("got request for a specific jump")
	jump, err := svc.repos.JumpRepo.GetByID(ctx, uint(query))
	if err != nil {
		log.Error(err, "failed to get Jump")
		return nil, err
	}
	jump.Usage++
	jump, _ = svc.repos.JumpRepo.Save(ctx, jump)
	if username != "" {
		log.V(1).Info("recording jump event", "Username", username, "ID", jump.ID)
		_, _ = svc.repos.JumpEventRepo.Save(ctx, &model.JumpEvent{
			UserID: username,
			JumpID: jump.ID,
			Date:   time.Now().Unix(),
		})
	}
	return jump, nil
}

// getValidTarget performs any required validation on an incoming jump request
func (*JumpService) getValidTarget(ctx context.Context, encodedTarget string, id int) (string, error) {
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_getValidTarget")
	defer span.End()
	// decode the target query and trim any whitespace
	target := strings.TrimSpace(encodedTarget)
	if target == "" && id < 0 {
		return "", fmt.Errorf("empty or null target for id: %d", id)
	}
	return target, nil
}

func (svc *JumpService) Create(ctx context.Context, opts CreateJumpOpts) (*model.Jump, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_create")
	defer span.End()
	username := GetUsernameCtx(ctx)
	owner := fmt.Sprintf("user://%s", username)
	if opts.GID > 0 {
		owner = fmt.Sprintf("group://%d", opts.GID)
	} else if opts.GID == -1 {
		// check if normal users are allowed to create public
		// jumps
		if !svc.allowPublicJumpCreation {
			resp, err := svc.authz.Can(ctx, &rbac.AccessRequest{
				Subject:  username,
				Resource: "SUPER",
				Action:   rbac.Verb_SUDO,
			})
			if err != nil {
				log.Error(err, "failed to check privilege")
				return nil, err
			}
			if !resp.Ok {
				return nil, ErrForbidden
			}
		}
		owner = ""
	}
	log.V(1).Info("created jump has owner", "Owner", owner)
	log.Info("creating new jump")
	// create the jump
	jump, err := svc.repos.JumpRepo.Save(ctx, &model.Jump{
		Name:     opts.Name,
		Location: opts.Location,
		Title:    "",
		Owner:    owner,
		Usage:    0,
		Alias:    opts.Alias,
	})
	if err != nil {
		return nil, err
	}
	// create role bindings
	if _, err := svc.authz.AddRole(ctx, &rbac.AddRoleRequest{
		Subject:  username,
		Resource: schemas.ResourceName(schemas.ResourceJump, jump.ID),
		Action:   rbac.Verb_SUDO,
	}); err != nil {
		log.Error(err, "failed to create owner role binding")
		return nil, err
	}
	return jump, nil
}

func (svc *JumpService) Update(ctx context.Context, opts UpdateJumpOpts) (*model.Jump, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_update")
	defer span.End()
	log.V(1).Info("patching jump")

	resp, err := svc.authz.Can(ctx, &rbac.AccessRequest{
		Subject:  GetUsernameCtx(ctx),
		Resource: schemas.ResourceName(schemas.ResourceJump, opts.ID),
		Action:   rbac.Verb_UPDATE,
	})
	if err != nil {
		return nil, err
	}
	if !resp.Ok {
		return nil, ErrForbidden
	}

	// get the matching jump
	existing, err := svc.repos.JumpRepo.GetByID(ctx, uint(opts.ID))
	if err != nil {
		log.Error(err, "cannot update jump")
		return nil, err
	}
	log.V(1).Info("updating jump", "ID", existing.ID)
	// update mutable fields
	existing.Name = opts.Name
	existing.Location = opts.Location
	existing.Alias = opts.Alias
	// save changes
	jump, err := svc.repos.JumpRepo.Save(ctx, existing)
	if err != nil {
		log.Error(err, "failed to save Jump")
		return nil, err
	}
	return jump, nil
}

func (svc *JumpService) Delete(ctx context.Context, id int) (bool, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_jump_delete")
	defer span.End()
	log.Info("deleting jump")

	resp, err := svc.authz.Can(ctx, &rbac.AccessRequest{
		Subject:  GetUsernameCtx(ctx),
		Resource: schemas.ResourceName(schemas.ResourceJump, id),
		Action:   rbac.Verb_DELETE,
	})
	if err != nil {
		return false, err
	}
	if !resp.Ok {
		return false, ErrForbidden
	}

	jump, err := svc.repos.JumpRepo.GetByID(ctx, uint(id))
	if err != nil {
		log.Error(err, "cannot determine existence of jump")
		return false, err
	}
	// delete the jump
	if err = svc.repos.JumpRepo.DeleteByID(ctx, jump.ID); err != nil {
		log.Error(err, "failed to delete jump")
		return false, err
	}
	return true, nil
}

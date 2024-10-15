package graph

//go:generate go run github.com/99designs/gqlgen

import (
	"context"
	"errors"
	"github.com/99designs/gqlgen/graphql"
	"github.com/go-logr/logr"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	"gitlab.dcas.dev/jmp/go-jmp/internal/identity"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/api"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/svc"
)

// This file will not be regenerated automatically.
//
// It serves as dependency injection for your app, add any dependencies you require here.

var (
	// ErrUnauthorised is an HTTP 401 equivalent
	ErrUnauthorised = errors.New("unauthorised")
	// ErrForbidden is an HTTP 403 equivalent
	ErrForbidden = errors.New("forbidden")
)

type Resolver struct {
	repos            *dao.Repos
	userService      *api.UserService
	groupService     *api.GroupService
	jumpService      *api.JumpService
	jumpEventService *api.JumpEventService
	similarService   *api.SimilarService
	authz            rbac.AuthorityClient
	adminGroups      []string
}

func NewResolver(ctx context.Context, repos *dao.Repos, similarSvc *svc.SimilarService, authz rbac.AuthorityClient, allowPublicJumpCreation bool, adminGroups []string, notifiers map[string]chan *dao.Message) *Resolver {
	r := new(Resolver)
	r.repos = repos
	r.userService = api.NewUserService(ctx, repos, notifiers[model.TableNameUsers])
	r.groupService = api.NewGroupService(ctx, repos, authz, notifiers[model.TableNameGroups])
	r.jumpService = api.NewJumpService(ctx, repos, authz, allowPublicJumpCreation, notifiers[model.TableNameJumps])
	r.jumpEventService = api.NewJumpEventService(repos)
	r.similarService = api.NewSimilarService(repos, similarSvc)
	r.authz = authz
	r.adminGroups = adminGroups

	// start listener threads
	go r.groupService.Listen()
	go r.userService.Listen()
	go r.jumpService.Listen()

	return r
}

// CanI checks that the requesting user is allowed
// to perform an action on a resource.
func (r *Resolver) CanI(ctx context.Context, resource string, action rbac.Verb) error {
	log := logr.FromContextOrDiscard(ctx).WithValues("Resource", resource, "Action", action.String())
	user, ok := identity.GetContextUser(ctx)
	if !ok {
		return ErrUnauthorised
	}
	// check if the user is allowed to do this
	// action
	log.V(1).Info("checking user access")
	res, err := r.authz.Can(ctx, &rbac.AccessRequest{
		Subject:  user.Subject,
		Resource: resource,
		Action:   action,
	})
	if err != nil {
		log.Error(err, "failed to check user access")
		return err
	}
	if !res.Ok {
		return ErrForbidden
	}
	return nil
}

func (r *Resolver) streamPage(ctx context.Context, svc *api.ListeningService, f func(message *dao.Message) (*model.Page, error)) chan *model.Page {
	events := make(chan *model.Page, 1)
	l := make(chan *dao.Message)
	// start listening
	svc.AddListener(l)
	// do a first call so the client gets data straight away
	items, err := f(nil)
	if err == nil {
		events <- items
	}
	go func() {
		for {
			select {
			case <-ctx.Done():
				// stop listening
				svc.RemoveListener(l)
				return
			case m := <-l:
				items, err := f(m)
				if err != nil {
					graphql.AddError(ctx, err)
					continue
				}
				events <- items
			}
		}
	}()
	return events
}

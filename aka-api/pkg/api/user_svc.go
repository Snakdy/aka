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
	"gitlab.com/av1o/cap10/pkg/client"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"go.opentelemetry.io/otel"
	"gorm.io/gorm"
	"sort"
	"strings"
)

type UserService struct {
	*ListeningService
	repos *dao.Repos
}

func NewUserService(ctx context.Context, repos *dao.Repos, listener chan *dao.Message) *UserService {
	return &UserService{
		repos:            repos,
		ListeningService: NewListeningService(ctx, listener),
	}
}

func (svc *UserService) CreateOrUpdateUser(ctx context.Context, user *client.UserClaim) (*dao.User, error) {
	log := logr.FromContextOrDiscard(ctx)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_user_createOrUpdateUser")
	defer span.End()
	daoUser, err := svc.repos.UserRepo.Get(ctx, user.Sub, user.Iss)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Error(err, "failed to retrieve user information")
		return nil, err
	}
	// the user exists, and we looked them up, or the user
	// does not exist
	if daoUser == nil {
		log.Info("creating DAO for new user")
		daoUser = &dao.User{
			Subject: user.Sub,
			Issuer:  user.Iss,
		}
	}
	// grab groups information from the
	// oauth claim. We pretty much always
	// need to update this
	repl := strings.NewReplacer(
		`"`, "",
		"[", "",
		"]", "",
	)
	groupsClaim := user.Claims["Groups"]
	if groupsClaim == "" {
		groupsClaim = user.Claims["groups"]
	}
	groups := strings.Split(repl.Replace(groupsClaim), " ")
	// alphabetically sort the groups so we can
	// save the round trip next time
	sort.Strings(groups)

	// update the groups and save the user
	// to the database
	groupStr := strings.Join(groups, ",")
	// if nothing has actually changed, skip
	// the database call
	if daoUser.Groups == groupStr {
		return daoUser, nil
	}
	daoUser.Groups = groupStr
	daoUser, err = svc.repos.UserRepo.Save(ctx, daoUser)
	if err != nil {
		return nil, err
	}
	return daoUser, nil
}

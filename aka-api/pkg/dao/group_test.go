package dao_test

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"gitlab.dcas.dev/jmp/go-jmp/internal/identity"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"testing"
)

func TestGroupRepo(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))
	db := newDB(ctx, t)

	ctx = context.WithValue(ctx, identity.UserContextKey, &identity.OAuthUser{Subject: "john"})

	repo := &dao.GroupRepo{}
	db.NewRepo(&repo.Repository)

	firstGroup, err := repo.Save(&model.Group{
		Name:     "my-group",
		Public:   false,
		Owner:    "user://john",
		Users:    "john,jane",
		External: false,
	})
	assert.NoError(t, err)
	assert.NotNil(t, firstGroup)
	assert.EqualValues(t, "my-group", firstGroup.Name)

	t.Run("find by name", func(t *testing.T) {
		group, err := repo.FindByName(ctx, "my-group")
		assert.NoError(t, err)
		assert.NotNil(t, group)
	})
	t.Run("find by id", func(t *testing.T) {
		group, err := repo.FindByID(ctx, int(firstGroup.ID))
		assert.NoError(t, err)
		assert.NotNil(t, group)
	})
}

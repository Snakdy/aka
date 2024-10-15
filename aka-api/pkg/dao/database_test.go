package dao_test

import (
	"context"
	"github.com/go-logr/logr"
	"github.com/go-logr/logr/testr"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/testconstructs"
	"testing"
)

func newDB(ctx context.Context, t *testing.T) *dao.AccessLayer {
	dsn := testconstructs.NewPostgres(t)
	db, err := dao.NewAccessLayer(ctx, dsn)
	require.NoError(t, err)
	require.NoError(t, db.Init(ctx))

	return db
}

func TestNewAccessLayer(t *testing.T) {
	ctx := logr.NewContext(context.TODO(), testr.NewWithOptions(t, testr.Options{Verbosity: 10}))

	db := newDB(ctx, t)
	assert.NotNil(t, db)
}

package dao

import (
	"context"
	"errors"
	"fmt"
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

type JumpRepo struct {
	Repository
}

// GetAll returns all Jumps available to a user
func (jr *JumpRepo) GetAll(ctx context.Context, user string, offset, limit int, groups []uint) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Offset", offset, "Limit", limit, "Groups", groups)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_jump_getAll", trace.WithAttributes(
		attribute.Int("offset", offset),
		attribute.Int("limit", limit),
	))
	defer span.End()
	groupIDs := jr.getGroupQuery(user, groups)
	var result []*model.Jump
	var count int64

	query := "owner = '' OR owner = ANY(?::text[])"
	jr.db.Model(&model.Jump{}).Where(query, groupIDs).Count(&count)

	if err := jr.db.Limit(limit).Offset(offset).Where(query, groupIDs).Find(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to read jumps")
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

// ExistsByID returns whether a Jump exists by a given primaryKey (ID)
func (jr *JumpRepo) ExistsByID(ctx context.Context, id uint) bool {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	if err := jr.db.First(&model.Jump{}, id).Error; err != nil {
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			log.Error(err, "failed to locate record")
		}
		return false
	}
	return true
}

// GetByID returns a Jump by its primaryKey (ID)
func (jr *JumpRepo) GetByID(ctx context.Context, id uint) (*model.Jump, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("ID", id)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_jump_getByID", trace.WithAttributes(attribute.Int("id", int(id))))
	defer span.End()
	var result model.Jump
	if err := jr.db.WithContext(ctx).Where("ID = ?", id).First(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to fetch jump")
		return nil, err
	}
	return &result, nil
}

func (jr *JumpRepo) getGroupQuery(user string, groups []uint) string {
	var groupIDs strings.Builder
	groupIDs.WriteString(`{"user://`)
	groupIDs.WriteString(user)
	groupIDs.WriteString(`"`)
	for _, g := range groups {
		groupIDs.WriteString(`,"group://`)
		groupIDs.WriteString(strconv.FormatUint(uint64(g), 10))
		groupIDs.WriteString(`"`)
	}
	groupIDs.WriteString("}")
	return groupIDs.String()
}

func (jr *JumpRepo) SearchForTerm(ctx context.Context, user, term string, offset, limit int, groups []uint) (*model.Page, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Term", term, "Offset", offset, "Limit", limit, "Groups", groups)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "repo_jump_searchForTerm", trace.WithAttributes(
		attribute.Int("offset", offset),
		attribute.Int("limit", limit),
		attribute.String("term", term),
	))
	defer span.End()
	groupIDs := jr.getGroupQuery(user, groups)
	var result []*model.Jump
	tsQuery := fmt.Sprintf("%s:*", term)
	var count int64
	query := `(
		to_tsvector('english', name) @@ ?::tsquery OR 
		to_tsvector('english', location) @@ ?::tsquery OR 
		to_tsvector('english', alias) @@ ?::tsquery
	) AND (owner = '' OR owner = ANY(?::text[]))`
	// get the count for paging
	jr.db.WithContext(ctx).Model(&model.Jump{}).Where(query, tsQuery, tsQuery, tsQuery, groupIDs).Count(&count)
	// actually run the request
	if err := jr.db.WithContext(ctx).
		Limit(limit).
		Offset(offset).
		Where(query, tsQuery, tsQuery, tsQuery, groupIDs).
		Find(&result).Error; err != nil {
		span.RecordError(err)
		log.Error(err, "failed to search jumps")
		return nil, err
	}
	pageable := make([]model.Pageable, len(result))
	for i := range result {
		pageable[i] = result[i]
	}
	metricSearch.Add(ctx, 1)
	return &model.Page{
		Results: pageable,
		Count:   int(count),
		More:    count-int64((offset+1)*limit) > 0,
	}, nil
}

// Save creates or updates a Jump
func (jr *JumpRepo) Save(ctx context.Context, j *model.Jump) (*model.Jump, error) {
	metricJumpSave.Add(ctx, 1)
	return j, jr.db.WithContext(ctx).Save(j).Error
}

// DeleteByID soft-deletes a Jump by a given primaryKey (ID)
func (jr *JumpRepo) DeleteByID(ctx context.Context, id uint) error {
	tx := jr.db.WithContext(ctx).Delete(&model.Jump{}, id)
	return tx.Error
}

func FilterJumps(jumps []*model.Jump, f func(j *model.Jump) bool) []*model.Jump {
	vsf := make([]*model.Jump, 0)
	for _, v := range jumps {
		if f(v) {
			vsf = append(vsf, v)
		}
	}
	return vsf
}

package dao

import (
	"bytes"
	"context"
	_ "embed"
	"fmt"
	"github.com/djcass44/go-utils/orm"
	"github.com/getsentry/sentry-go"
	"github.com/go-logr/logr"
	otelgorm "github.com/kostyay/gorm-opentelemetry"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"text/template"
	"time"
)

//go:embed trigger.sql
var triggerTpl string

var tableNames = []string{
	model.TableNameGroups,
	model.TableNameUsers,
	model.TableNameJumps,
}

type AccessLayer struct {
	db  *gorm.DB
	dsn string
}

type Repository struct {
	db *gorm.DB
}

// NewAccessLayer creates an instance of AccessLayer and opens a connection to the database
func NewAccessLayer(ctx context.Context, dsn string) (*AccessLayer, error) {
	log := logr.FromContextOrDiscard(ctx).WithName("database")
	al := new(AccessLayer)
	database, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: orm.NewGormLogger(log, time.Millisecond*200),
	})
	if err != nil {
		log.Error(err, "failed to open database connection")
		return nil, err
	}
	log.V(1).Info("enabling plugins")
	// configure open telemetry
	if err := database.Use(otelgorm.NewPlugin()); err != nil {
		sentry.CaptureException(err)
		log.Error(err, "failed to enable SQL OpenTelemetry plugin")
	}
	log.Info("established database connection")

	al.db = database
	al.dsn = dsn
	return al, nil
}

// Init runs on-start operations such as schema migration
func (al *AccessLayer) Init(ctx context.Context) error {
	log := logr.FromContextOrDiscard(ctx)
	log.Info("running auto-migration of database")
	err := al.db.AutoMigrate(
		&model.Jump{},
		&model.JumpEvent{},
		&User{},
		&model.Group{},
	)
	if err != nil {
		return err
	}
	if err := al.ftIndex(ctx, "alias", "alias"); err != nil {
		return err
	}
	if err := al.ftIndex(ctx, "name", "name"); err != nil {
		return err
	}
	if err := al.ftIndex(ctx, "location", "location"); err != nil {
		return err
	}
	return nil
}

func (al *AccessLayer) ftIndex(ctx context.Context, name, field string) error {
	log := logr.FromContextOrDiscard(ctx).WithValues("Name", name, "Field", field)
	log.V(1).Info("creating full-text index")
	if err := al.db.Raw(fmt.Sprintf("CREATE INDEX IF NOT EXISTS jumps_%s_idx ON jumps USING GIN (to_tsvector('simple', %s))", name, field)).Error; err != nil {
		log.Error(err, "failed to create index")
		return err
	}
	return nil
}

func (al *AccessLayer) InitNotify(ctx context.Context) (map[string]chan *Message, error) {
	log := logr.FromContextOrDiscard(ctx)
	// create the template
	tpl, err := template.New("trigger.sql").Parse(triggerTpl)
	if err != nil {
		log.Error(err, "failed to create template")
		return nil, err
	}
	listeners := map[string]chan *Message{}
	log.V(1).Info("initialising notifiers for tables", "Count", len(tableNames))
	for _, t := range tableNames {
		log = log.WithValues("Table", t)
		log.V(1).Info("creating trigger")
		data := new(bytes.Buffer)
		// execute the template
		if err := tpl.Execute(data, struct {
			Table string
		}{
			Table: t,
		}); err != nil {
			log.Error(err, "failed to template trigger.sql for table: %s", t)
			return nil, err
		}
		// create the trigger
		if err := al.db.Exec(data.String()).Error; err != nil {
			log.Error(err, "failed to setup trigger")
			return nil, err
		}
		// create the listener
		_, h, err := NewNotifier(ctx, al.dsn, fmt.Sprintf("%s_update", t))
		if err != nil {
			return nil, err
		}
		listeners[t] = h
	}
	return listeners, nil
}

// NewRepo attaches our current database connection to a repository struct
func (al *AccessLayer) NewRepo(repository *Repository) {
	repository.db = al.db
}

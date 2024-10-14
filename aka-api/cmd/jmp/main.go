package main

import (
	"context"
	_ "embed"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/djcass44/go-utils/logging"
	"github.com/djcass44/go-utils/otel"
	"github.com/djcass44/go-utils/otel/metrics"
	sentryhttp "github.com/getsentry/sentry-go/http"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/kelseyhightower/envconfig"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"gitlab.com/autokubeops/serverless"
	cap10 "gitlab.com/av1o/cap10/pkg/client"
	"gitlab.com/av1o/cap10/pkg/verify"
	"gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/generated"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/api"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/errtracing"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/svc"
	"go.opentelemetry.io/contrib/instrumentation/github.com/gorilla/mux/otelmux"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"net/http"
	"os"
	"time"
)

//go:embed grpc.json
var grpcPolicy string

type environment struct {
	Port     int    `default:"8080"`
	LogLevel int    `split_words:"true"`
	DSN      string `required:"true"`

	HTTP struct {
		UserHeader       string `split_words:"true" default:"X-Auth-User"`
		SourceHeader     string `split_words:"true" default:"X-Auth-Source"`
		VerifyHeader     string `split_words:"true" default:"X-Auth-Verify"`
		VerifyHashHeader string `split_words:"true" default:"X-Auth-Hash-Verify"`
	}
	CAP10 struct {
		Method string `split_words:"true" default:"http"`
		URL    string `split_words:"true" default:"url"`
		Path   string `split_words:"true" default:"./ca.crt"`
	}
	Sentry errtracing.SentryOptions
	Otel   traceopts.OtelOptions

	RbacURL                 string   `split_words:"true" required:"true"`
	AllowedOrigin           string   `split_words:"true" default:"*"`
	AllowPublicJumpCreation bool     `split_words:"true"`
	AdminGroups             []string `split_words:"true"`
}

// @title JMP
// @version 0.1

// @license.name Apache 2.0
// @license.url https://www.apache.org/licenses/LICENSE-2.0

// @securityDefinitions.apiKey AuthUser
// @in header
// @name X-Auth-User

// @securityDefinitions.apiKey AuthSource
// @in header
// @name X-Auth-Source
func main() {
	// setup environment
	var e environment
	envconfig.MustProcess("aka", &e)

	zc := zap.NewProductionConfig()
	zc.Level = zap.NewAtomicLevelAt(zapcore.Level(e.LogLevel * -1))

	log, ctx := logging.NewZap(context.Background(), zc)

	// setup sentry
	if err := errtracing.Init(ctx, &e.Sentry); err != nil {
		log.Error(err, "failed to setup sentry")
		os.Exit(1)
	}

	// set the extractor headers
	cap10.DefaultSubjectHeader = e.HTTP.UserHeader
	cap10.DefaultIssuerHeader = e.HTTP.SourceHeader
	cap10.DefaultVerifyHeader = e.HTTP.VerifyHeader
	cap10.DefaultVerifyHashHeader = e.HTTP.VerifyHashHeader

	// setup otel
	if err := otel.Build(ctx, otel.Options{
		Enabled:       e.Otel.Enabled,
		ServiceName:   traceopts.DefaultServiceName,
		Environment:   e.Otel.Environment,
		SampleRate:    e.Otel.SampleRate,
		KubeNamespace: os.Getenv("KUBE_NAMESPACE"),
	}); err != nil {
		log.Error(err, "failed to setup tracing")
		os.Exit(1)
		return
	}

	// create the db connection
	accessLayer, err := dao.NewAccessLayer(ctx, e.DSN)
	if err != nil {
		log.Error(err, "failed to establish database connection")
		os.Exit(1)
		return
	}
	if err = accessLayer.Init(ctx); err != nil {
		log.Error(err, "failed to initialise database")
		os.Exit(1)
		return
	}
	notifiers, err := accessLayer.InitNotify(ctx)
	if err != nil {
		log.Error(err, "failed to setup table notifiers")
		os.Exit(1)
		return
	}
	c := cap10.NewClient(verify.NewNoOpVerifier())
	similarService := svc.NewSimilarService(0.7)

	jumpRepo := &dao.JumpRepo{}
	eventRepo := &dao.JumpEventRepo{}
	userRepo := &dao.UserRepo{}
	groupRepo := &dao.GroupRepo{}
	accessLayer.NewRepo(&jumpRepo.Repository)
	accessLayer.NewRepo(&eventRepo.Repository)
	accessLayer.NewRepo(&userRepo.Repository)
	accessLayer.NewRepo(&groupRepo.Repository)

	repos := &dao.Repos{
		JumpRepo:      jumpRepo,
		GroupRepo:     groupRepo,
		UserRepo:      userRepo,
		JumpEventRepo: eventRepo,
	}

	// connect to the RBAC sidecar
	log.V(1).Info("establishing connection to RBAC", "Url", e.RbacURL)
	conn, err := grpc.NewClient(e.RbacURL,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithStatsHandler(otelgrpc.NewClientHandler()),
		grpc.WithDefaultServiceConfig(grpcPolicy),
	)
	if err != nil {
		log.Error(err, "failed to dial RBAC")
		os.Exit(1)
		return
	}
	rbacClient := rbac.NewAuthorityClient(conn)

	// setup router and handlers
	router := mux.NewRouter()

	// setup the swagger handler
	router.Use(sentryhttp.New(sentryhttp.Options{Repanic: true}).Handle)
	router.Use(logging.Middleware(log), metrics.Middleware())
	router.Use(otelmux.Middleware(traceopts.DefaultServiceName))
	router.Handle("/metrics", promhttp.Handler())
	router.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("OK"))
	})

	// graphql
	srv := handler.New(generated.NewExecutableSchema(generated.Config{Resolvers: graph.NewResolver(ctx, repos, similarService, rbacClient, e.AllowPublicJumpCreation, e.AdminGroups, notifiers)}))
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.Websocket{
		KeepAlivePingInterval: 10 * time.Second,
		Upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				log.V(1).Info("validating websocket origin", "Origin", r.Header.Get("Origin"), "AllowedOrigin", e.AllowedOrigin)
				if e.AllowedOrigin == "*" {
					return true
				}
				return r.Host == e.AllowedOrigin
			},
		},
	})
	router.Handle("/v4/query", c.WithOptionalUser(srv))
	router.Handle("/v4/graphql", playground.Handler("GraphQL Playground", "/v4/query"))

	_ = api.NewJumpAPI(ctx, repos, c, e.AllowPublicJumpCreation, rbacClient, router)

	// start the http server
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithLogger(log).
		Run()
}

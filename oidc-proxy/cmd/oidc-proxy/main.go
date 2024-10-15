package main

import (
	"context"
	"github.com/djcass44/go-utils/logging"
	"github.com/gorilla/mux"
	"github.com/kelseyhightower/envconfig"
	"gitlab.com/autokubeops/serverless"
	"gitlab.dcas.dev/aka/aka/oidc-proxy/internal/oidc"
	"gitlab.dcas.dev/aka/aka/oidc-proxy/internal/proxy"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"net/http"
	"os"
)

type environment struct {
	Port     int    `envconfig:"PORT" default:"8080"`
	LogLevel int    `split_words:"true"`
	Upstream string `split_words:"true" required:"true"`
	Options  oidc.Options
}

func main() {
	var e environment
	envconfig.MustProcess("oidc", &e)

	zc := zap.NewProductionConfig()
	zc.Level = zap.NewAtomicLevelAt(zapcore.Level(e.LogLevel * -1))

	log, ctx := logging.NewZap(context.Background(), zc)

	proxyHandler, err := proxy.NewHandler(e.Upstream)
	if err != nil {
		log.Error(err, "failed to setup proxy")
		os.Exit(1)
	}

	filter, err := oidc.NewFilter(ctx, e.Options)
	if err != nil {
		log.Error(err, "failed to setup oidc filter")
		os.Exit(1)
	}

	router := mux.NewRouter()
	router.Use(logging.Middleware(log))
	router.HandleFunc("/auth/redirect", filter.HandleRedirect).Methods(http.MethodGet)
	router.HandleFunc("/auth/callback", filter.HandleCallback).Methods(http.MethodGet)
	router.PathPrefix("/").Handler(filter.Middleware(proxyHandler))

	// start the server
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithLogger(log).
		Run()
}

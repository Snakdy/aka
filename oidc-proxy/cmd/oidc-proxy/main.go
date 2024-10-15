package main

import (
	"context"
	"github.com/djcass44/go-utils/logging"
	"github.com/gorilla/mux"
	"github.com/kelseyhightower/envconfig"
	"gitlab.com/autokubeops/serverless"
	"gitlab.dcas.dev/aka/aka/oidc-proxy/internal/proxy"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"os"
)

type environment struct {
	Port     int    `envconfig:"PORT" default:"8080"`
	LogLevel int    `split_words:"true"`
	Upstream string `split_words:"true" required:"true"`
	OIDC     struct {
		IssuerURI string `split_words:"true"`
		Client    struct {
			ID     string `split_words:"true" required:"true"`
			Secret string `split_words:"true" required:"true"`
		}
		RedirectURI    string   `split_words:"true" required:"true"`
		CookieSameSite string   `split_words:"true" default:"Lax"`
		Scopes         []string `split_words:"true" required:"true"`
	}
}

func main() {
	var e environment
	envconfig.MustProcess("oidc", &e)

	zc := zap.NewProductionConfig()
	zc.Level = zap.NewAtomicLevelAt(zapcore.Level(e.LogLevel * -1))

	log, _ := logging.NewZap(context.Background(), zc)

	proxyHandler, err := proxy.NewHandler(e.Upstream)
	if err != nil {
		log.Error(err, "failed to setup proxy")
		os.Exit(1)
	}

	router := mux.NewRouter()
	router.Use(logging.Middleware(log))
	router.PathPrefix("/").Handler(proxyHandler)

	// start the server
	serverless.NewBuilder(router).
		WithPort(e.Port).
		WithLogger(log).
		Run()
}

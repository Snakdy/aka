package dao

import (
	metric2 "go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/sdk/metric"
)

var (
	meter           = metric.NewMeterProvider().Meter("aka")
	metricSearch, _ = meter.Int64Counter(
		"aka.api.action.search.total",
		metric2.WithDescription("Measures the number of queries."),
	)
	metricJumpSave, _ = meter.Int64Counter(
		"aka.api.resource.jump.save.total",
		metric2.WithDescription("Measures the number Jumps created or updated."),
	)
)

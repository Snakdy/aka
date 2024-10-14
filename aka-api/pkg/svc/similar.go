/*
 *    Copyright 2020 Django Cass
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

package svc

import (
	"context"
	"fmt"
	"github.com/go-logr/logr"
	"github.com/masatana/go-textdistance"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"gitlab.dcas.dev/jmp/go-jmp/internal/traceopts"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
	"net/url"
	"strings"
)

type SimilarService struct {
	threshold float64
}

// NewSimilarService creates a new service with given parameters
func NewSimilarService(threshold float64) *SimilarService {
	ss := new(SimilarService)
	ss.threshold = threshold

	return ss
}

func (ss *SimilarService) ForSearching(ctx context.Context, items []*model.Jump, term string) []*model.Jump {
	_, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_similar_forSearching", trace.WithAttributes(attribute.String("term", term)))
	defer span.End()
	return dao.FilterJumps(items, func(j *model.Jump) bool {
		// get the similarity
		dists := make([]float64, 2)
		dists[0] = textdistance.JaroWinklerDistance(term, j.Name)
		dists[1] = textdistance.JaroWinklerDistance(term, j.Location)
		// basic tokenisation of something we know is probably a sentence
		dists = append(dists, getDistances(strings.Split(j.Title, " "), term)...)
		for _, d := range dists {
			if d >= ss.threshold {
				return true
			}
		}
		return false
	})
}

func (ss *SimilarService) ForJumping(ctx context.Context, items []*model.Jump, term string) []*model.Jump {
	_, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_similar_forJumping", trace.WithAttributes(attribute.String("term", term)))
	defer span.End()
	results := ss.checkForDuplicates(items, term)
	// if we have exact matches, return them straight away
	if len(results) > 0 {
		span.AddEvent("exact matches", trace.WithAttributes(attribute.Int("matches", len(results))))
		return results
	}
	var bestJump *model.Jump
	var bestDist = 0.0
	var j *model.Jump
	for i := range items {
		j = items[i] // use the index so we avoid implicit memory aliasing
		dist := textdistance.JaroWinklerDistance(term, j.Name)
		if dist > ss.threshold {
			// add it if it crosses the threshold
			results = append(results, j)
		}
		// track 'okay' values as a fallback
		if dist > 0.65 && dist > bestDist {
			bestJump = j
			bestDist = dist
		}
	}
	// if we got no good results, fallback to the best 'okay' value
	if len(results) == 0 && bestJump != nil {
		span.AddEvent("no good match")
		results = append(results, bestJump)
	}
	return results
}

// ForSuggesting returns the id suffix so that the webextension can skip the /similar hop
func (ss *SimilarService) ForSuggesting(ctx context.Context, items []*model.Jump, term string) []string {
	log := logr.FromContextOrDiscard(ctx).WithValues("Term", term)
	ctx, span := otel.Tracer(traceopts.DefaultTracerName).Start(ctx, "svc_similar_forSuggesting", trace.WithAttributes(attribute.String("term", term)))
	defer span.End()
	vs := ss.ForJumping(ctx, items, term)
	vsm := make([]string, len(vs))
	for i, v := range vs {
		var host string
		if u, err := url.Parse(v.Location); err != nil {
			log.V(1).Error(err, "failed to parse url", "Url", v.Location)
			host = v.Location
		} else {
			host = u.Host
		}
		vsm[i] = fmt.Sprintf("%s&id=%d", host, v.ID)
	}
	return vsm
}

// checkForDuplicates checks if any Jumps are exact matches
func (ss *SimilarService) checkForDuplicates(items []*model.Jump, term string) []*model.Jump {
	return dao.FilterJumps(items, func(j *model.Jump) bool {
		return j.Name == term
	})
}

func getDistances(vs []string, term string) []float64 {
	vsm := make([]float64, len(vs))
	for i, v := range vs {
		vsm[i] = textdistance.JaroWinklerDistance(term, v)
	}
	return vsm
}

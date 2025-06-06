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

package svc

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"gitlab.dcas.dev/jmp/go-jmp/internal/ql/graph/model"
	"testing"
)

var dupeTests = []struct {
	term     string
	expected int
}{
	{"bar", 1},
	{"foo", 2},
	{"something else", 0},
}

func TestSimilarService_checkForDuplicates(t *testing.T) {
	ss := &SimilarService{}

	items := []*model.Jump{
		{
			Name: "foo",
		},
		{
			Name: "bar",
		},
		{
			Name: "foo",
		},
	}

	for _, tt := range dupeTests {
		t.Run(fmt.Sprintf("%v", tt), func(t *testing.T) {
			assert.EqualValues(t, tt.expected, len(ss.checkForDuplicates(items, tt.term)))
		})
	}
}

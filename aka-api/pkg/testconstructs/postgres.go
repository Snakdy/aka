/*
 *    Copyright 2024 Django Cass
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

package testconstructs

import (
	embeddedpostgres "github.com/fergusstrange/embedded-postgres"
	"github.com/stretchr/testify/require"
	"math/rand/v2"
	"testing"
)

func NewPostgres(t *testing.T) string {
	port := uint32(30000 + rand.IntN(2000))

	cfg := embeddedpostgres.DefaultConfig().
		Username("aka").
		Password("hunter2").
		Database("aka").
		Version(embeddedpostgres.V16).
		Port(port).
		BinariesPath(t.TempDir()).
		DataPath(t.TempDir()).
		RuntimePath(t.TempDir())

	postgres := embeddedpostgres.NewDatabase(cfg)
	require.NoError(t, postgres.Start())
	// cleanup when we're done
	t.Cleanup(func() {
		_ = postgres.Stop()
	})
	return cfg.GetConnectionURL()
}

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

package api

import (
	"errors"
	"github.com/go-logr/logr"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"sync"
)

var (
	ErrNotFound  = errors.New("not found")
	ErrForbidden = errors.New("forbidden")
)

type ListeningService struct {
	log       logr.Logger
	listener  chan *dao.Message
	listeners map[chan *dao.Message]struct{}
	lisLock   sync.Mutex
}

/*
 *    Copyright 2022 Django Cass
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
	"context"
	"github.com/go-logr/logr"
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao"
	"sync"
)

func NewListeningService(ctx context.Context, listener chan *dao.Message) *ListeningService {
	log := logr.FromContextOrDiscard(ctx)
	return &ListeningService{
		log:       log,
		listener:  listener,
		listeners: map[chan *dao.Message]struct{}{},
		lisLock:   sync.Mutex{},
	}
}

func (svc *ListeningService) AddListener(l chan *dao.Message) {
	svc.log.V(2).Info("adding new listener")
	svc.lisLock.Lock()
	svc.listeners[l] = struct{}{}
	svc.lisLock.Unlock()
}

func (svc *ListeningService) RemoveListener(l chan *dao.Message) {
	svc.log.V(2).Info("removing listener")
	svc.lisLock.Lock()
	delete(svc.listeners, l)
	svc.lisLock.Unlock()
}

func (svc *ListeningService) Listen() {
	for {
		msg := <-svc.listener
		svc.log.V(2).Info("sending event to listeners", "Count", len(svc.listeners))
		for k := range svc.listeners {
			k <- msg
		}
	}
}

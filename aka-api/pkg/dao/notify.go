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

package dao

import (
	"context"
	"encoding/json"
	"github.com/go-logr/logr"
	"github.com/lib/pq"
	"time"
)

type Message struct {
	Operation string `json:"OPERATION"`
	ID        int    `json:"ID"`
	Table     string `json:"TABLE"`
}

type Notifier struct {
	log         logr.Logger
	channelName string
	listener    *pq.Listener
	failed      chan error
	handler     chan *Message
}

func NewNotifier(ctx context.Context, dsn, channelName string) (*Notifier, chan *Message, error) {
	log := logr.FromContextOrDiscard(ctx).WithValues("Channel", channelName)
	n := new(Notifier)
	n.log = log
	log.Info("opening listener")
	listener := pq.NewListener(dsn, 10*time.Second, time.Minute, n.logListener)
	if err := listener.Listen(channelName); err != nil {
		log.Error(err, "failed to listen")
		log.V(2).Info("closing listener")
		if err := listener.Close(); err != nil {
			log.V(1).Error(err, "failed to close listener")
		}
		return nil, nil, err
	}

	n.channelName = channelName
	n.listener = listener
	n.failed = make(chan error, 2)
	n.handler = make(chan *Message)

	// start the event loop in the background
	go func() {
		for {
			_ = n.notify()
		}
	}()

	return n, n.handler, nil
}

func (n *Notifier) logListener(event pq.ListenerEventType, err error) {
	if err != nil {
		n.log.Error(err, "listener error")
	}
	if event == pq.ListenerEventConnectionAttemptFailed {
		n.failed <- err
	}
}

func (n *Notifier) notify() error {
	log := n.log
	var fetchCounter uint64
	for {
		select {
		case e := <-n.listener.Notify:
			if e == nil {
				continue
			}
			fetchCounter++
			log.V(2).Info("notify received", "Count", fetchCounter, "Message", e.Extra)
			msg, err := n.parseMessage(e.Extra)
			if err != nil {
				continue
			}
			n.handler <- msg
		case err := <-n.failed:
			return err
		case <-time.After(time.Minute):
			go func() {
				log.V(4).Info("pinging listener")
				if err := n.listener.Ping(); err != nil {
					log.Error(err, "failed to ping listener")
				}
			}()
		}
	}
}

func (n *Notifier) parseMessage(data string) (*Message, error) {
	var message Message
	if err := json.Unmarshal([]byte(data), &message); err != nil {
		n.log.Error(err, "failed to parse message", "Raw", data)
		return nil, err
	}
	return &message, nil
}

func (n *Notifier) Close() error {
	close(n.failed)
	return n.listener.Close()
}

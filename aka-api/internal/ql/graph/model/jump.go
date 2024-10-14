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

package model

import (
	"gitlab.dcas.dev/jmp/go-jmp/pkg/dao/datatypes"
	"gorm.io/gorm"
)

type Jump struct {
	gorm.Model
	Name     string              `json:"name"`
	Location string              `json:"location"`
	Title    string              `json:"title"`
	Owner    string              `json:"owner"`
	Usage    int                 `json:"usage"`
	Alias    datatypes.JSONArray `json:"alias" ,type:"jsonb not null default '[]'::jsonb"`
}

func (Jump) TableName() string {
	return TableNameJumps
}

// IsPublic returns true if the jump has no owner
func (j *Jump) IsPublic() bool {
	return j.Owner == ""
}

// Equals checks whether the Jump ID matches the other
func (j *Jump) Equals(other *Jump) bool {
	return other.ID == j.ID
}

func (*Jump) IsPageable() {}

type JumpEvent struct {
	gorm.Model
	UserID string
	JumpID uint
	Date   int64
}

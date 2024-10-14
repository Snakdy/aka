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
	"gorm.io/gorm"
)

type Group struct {
	gorm.Model
	Name     string `json:"name" ,gorm:"unique"`
	Public   bool   `json:"public"` // visible to all
	Owner    string `json:"owner"`
	Users    string `json:"users"`
	External bool   `json:"external"`
}

func (*Group) IsPageable() {}

func (Group) TableName() string {
	return TableNameGroups
}

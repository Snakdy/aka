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

package datatypes

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

// JSONArray defined JSON data type, need to implements driver.Valuer, sql.Scanner interface
type JSONArray []string

// Value return json value, implement driver.Valuer interface
func (m JSONArray) Value() (driver.Value, error) {
	if m == nil {
		return nil, nil
	}
	ba, err := m.MarshalJSON()
	return string(ba), err
}

// Scan scan value into Jsonb, implements sql.Scanner interface
func (m *JSONArray) Scan(val interface{}) error {
	var ba []byte
	switch v := val.(type) {
	case []byte:
		ba = v
	case string:
		ba = []byte(v)
	default:
		return fmt.Errorf("failed to unmarshal JSONB value: %+v", val)
	}
	var t []string
	err := json.Unmarshal(ba, &t)
	*m = t
	return err
}

// MarshalJSON to output non base64 encoded []byte
func (m JSONArray) MarshalJSON() ([]byte, error) {
	if m == nil {
		return []byte("null"), nil
	}
	t := ([]string)(m)
	return json.Marshal(t)
}

// UnmarshalJSON to deserialize []byte
func (m *JSONArray) UnmarshalJSON(b []byte) error {
	var t []string
	err := json.Unmarshal(b, &t)
	*m = t
	return err
}

// GormDataType gorm common data type
func (m JSONArray) GormDataType() string {
	return "jsonarray"
}

// GormDBDataType gorm db data type
func (JSONArray) GormDBDataType(db *gorm.DB, _ *schema.Field) string {
	switch db.Dialector.Name() {
	case "sqlite":
		return "JSON"
	case "mysql":
		return "JSON"
	case "postgres":
		return "JSONB"
	}
	return ""
}

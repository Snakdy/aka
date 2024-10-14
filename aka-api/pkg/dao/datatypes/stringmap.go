package datatypes

import (
	"encoding/json"
	"errors"
	"io"
)

type JSONMap map[string]string

// UnmarshalGQL implements the graphql.Unmarshaler interface
func (m *JSONMap) UnmarshalGQL(v any) error {
	val, ok := v.(map[string]string)
	if !ok {
		return errors.New("JSONMap must be a JSON object")
	}
	*m = val
	return nil
}

// MarshalGQL implements the graphql.Marshaler interface
func (m JSONMap) MarshalGQL(w io.Writer) {
	if m == nil {
		_, _ = w.Write([]byte("{}"))
		return
	}
	t := (map[string]string)(m)
	_ = json.NewEncoder(w).Encode(t)
}

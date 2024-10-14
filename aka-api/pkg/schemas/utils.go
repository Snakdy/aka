package schemas

import "fmt"

func ResourceName[T any](resource Name, name T) string {
	return fmt.Sprintf("%s://%v", resource, name)
}

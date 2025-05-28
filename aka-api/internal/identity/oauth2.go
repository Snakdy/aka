package identity

import (
	"context"
	"github.com/go-logr/logr"
	"net/http"
	"strings"
)

type key int

const (
	UserContextKey key = iota
)

const (
	HeaderUser     = "X-Forwarded-User"
	HeaderGroups   = "X-Forwarded-Groups"
	HeaderEmail    = "X-Forwarded-Email"
	HeaderUsername = "X-Forwarded-Preferred-Username"
)

type OAuthUser struct {
	Subject  string   `json:"subject"`
	Groups   []string `json:"groups"`
	Email    string   `json:"email"`
	Username string   `json:"username"`
}

func GetContextUser(ctx context.Context) (*OAuthUser, bool) {
	log := logr.FromContextOrDiscard(ctx)
	log.V(5).Info("retrieving user from context", "key", UserContextKey)

	u, ok := ctx.Value(UserContextKey).(*OAuthUser)
	return u, ok
}

// Middleware extracts the OAuth2 users identity if one is available
func Middleware(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		log := logr.FromContextOrDiscard(ctx)
		user := r.Header.Get(HeaderUser)
		groups := r.Header.Get(HeaderGroups)
		email := r.Header.Get(HeaderEmail)
		username := r.Header.Get(HeaderUsername)

		log.V(5).Info("checking request headers for oauth identity", "user", user, "groups", groups, "email", email, "username", username)

		// only put the context value in if
		// we found a user
		if user != "" && email != "" {
			var groupList []string
			if groups != "" {
				groupList = strings.Split(groups, ",")
			}
			for i := range groupList {
				groupList[i] = strings.TrimSpace(groupList[i])
			}
			u := &OAuthUser{
				Subject:  user,
				Groups:   groupList,
				Email:    email,
				Username: username,
			}
			log.V(5).Info("injecting user into context", "user", u)
			ctx = context.WithValue(r.Context(), UserContextKey, u)
		}
		h.ServeHTTP(w, r.WithContext(ctx))
	})
}

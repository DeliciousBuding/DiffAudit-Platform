package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
)

// SESSION_COOKIE_NAME is the cookie holding the session token, matching
// SESSION_COOKIE_NAME in apps/web/src/lib/auth-config.ts.
const SESSION_COOKIE_NAME = "diffaudit_session"

// SESSION_COOKIE_MAX_AGE is the cookie lifetime in seconds (12 hours),
// matching SESSION_COOKIE_OPTIONS.maxAge in apps/web/src/lib/auth.ts.
const SESSION_COOKIE_MAX_AGE = int(SESSION_MAX_AGE_MS / 1000)

// userIDContextKey is an unexported key so handlers cannot fake the value.
type userIDContextKey struct{}

// RequireSession validates the diffaudit_session cookie against the store:
// the token must exist and not be expired at the current time. On success
// the user id is stored in the request context; otherwise the middleware
// answers 401 without calling the next handler.
func RequireSession(store Store) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			cookie, err := request.Cookie(SESSION_COOKIE_NAME)
			if err != nil {
				writeAuthError(writer, http.StatusUnauthorized, "authentication required")
				return
			}

			session, err := store.GetSession(request.Context(), cookie.Value, time.Now())
			if err != nil {
				writeAuthError(writer, http.StatusUnauthorized, "authentication required")
				return
			}

			ctx := context.WithValue(request.Context(), userIDContextKey{}, session.UserID)
			next.ServeHTTP(writer, request.WithContext(ctx))
		})
	}
}

// UserIDFromContext returns the authenticated user id put in the request
// context by RequireSession.
func UserIDFromContext(ctx context.Context) (string, bool) {
	userID, ok := ctx.Value(userIDContextKey{}).(string)
	return userID, ok
}

// SetSessionCookie writes the session cookie consumed by RequireSession.
// Attributes mirror SESSION_COOKIE_OPTIONS in apps/web/src/lib/auth.ts:
// HttpOnly, SameSite=Lax, Path=/, Max-Age=43200. Secure is intentionally not
// set here: as in the web app (secure: NODE_ENV === "production"), it must be
// enabled by the deployment layer when serving over HTTPS.
func SetSessionCookie(writer http.ResponseWriter, token string) {
	SetSessionCookieWithOptions(writer, token, false)
}

// SetSessionCookieWithOptions writes the session cookie with the Secure
// attribute controlled by the caller (mirrors secure: NODE_ENV ===
// "production" in the web app).
func SetSessionCookieWithOptions(writer http.ResponseWriter, token string, secure bool) {
	http.SetCookie(writer, &http.Cookie{
		Name:     SESSION_COOKIE_NAME,
		Value:    token,
		Path:     "/",
		MaxAge:   SESSION_COOKIE_MAX_AGE,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
		Secure:   secure,
	})
}

// ClearSessionCookie expires the session cookie on sign-out.
func ClearSessionCookie(writer http.ResponseWriter) {
	http.SetCookie(writer, &http.Cookie{
		Name:     SESSION_COOKIE_NAME,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

func writeAuthError(writer http.ResponseWriter, statusCode int, message string) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(map[string]any{"message": message})
}

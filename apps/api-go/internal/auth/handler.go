package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// Server hosts the /api/auth/* HTTP surface, mirroring the Next.js API
// routes it replaces. All response shapes (JSON fields, error codes and
// status codes) are kept identical to the legacy implementation so the SPA
// frontend needs no changes.
type Server struct {
	store          Store
	platformURL    string
	sharedUsername string
	sharedPassword string
	oauth          *OAuthProviderSet
	cookieSecure   bool
}

// Options wires the auth server to its dependencies. Empty credentials
// disable the corresponding provider, mirroring the legacy env checks.
type Options struct {
	Store          Store
	PlatformURL    string
	SharedUsername string
	SharedPassword string
	GitHubClientID string
	GitHubSecret   string
	GoogleClientID string
	GoogleSecret   string
	OAuthProxyURL  string
	CookieSecure   bool
}

// NewServer constructs the auth HTTP server.
func NewServer(opts Options) *Server {
	return &Server{
		store:          opts.Store,
		platformURL:    opts.PlatformURL,
		sharedUsername: opts.SharedUsername,
		sharedPassword: opts.SharedPassword,
		oauth:          newOAuthProviderSet(opts),
		cookieSecure:   opts.CookieSecure,
	}
}

// Routes registers every auth endpoint on a fresh mux.
func (s *Server) Routes() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/auth/register", s.handleRegister)
	mux.HandleFunc("POST /api/auth/login", s.handleLogin)
	mux.HandleFunc("GET /api/auth/me", s.handleMe)
	mux.HandleFunc("POST /api/auth/logout", s.handleLogout)
	mux.HandleFunc("POST /api/auth/password", s.handlePassword)
	mux.HandleFunc("POST /api/auth/email", s.handleEmail)
	mux.HandleFunc("POST /api/auth/email-verification", s.handleEmailVerification)
	mux.HandleFunc("GET /api/auth/verify-email", s.handleVerifyEmail)
	mux.HandleFunc("POST /api/auth/two-factor", s.handleTwoFactor)
	mux.HandleFunc("GET /api/auth/github", s.handleOAuthStart("github"))
	mux.HandleFunc("GET /api/auth/github/callback", s.handleOAuthCallback("github"))
	mux.HandleFunc("GET /api/auth/google", s.handleOAuthStart("google"))
	mux.HandleFunc("GET /api/auth/google/callback", s.handleOAuthCallback("google"))
	return mux
}

// demoMode mirrors isDemoModeEnabledServer in apps/web/src/lib/demo-mode.ts:
// forced by env, disabled by the platform-demo-mode cookie value "0", and
// otherwise enabled by default.
func (s *Server) demoMode(request *http.Request) bool {
	if cookie, err := request.Cookie("platform-demo-mode"); err == nil && cookie.Value == "0" {
		return false
	}
	return true
}

func (s *Server) currentProfile(request *http.Request) (*UserProfile, error) {
	cookie, err := request.Cookie(SESSION_COOKIE_NAME)
	if err != nil {
		return nil, nil
	}
	session, err := s.store.GetSession(request.Context(), cookie.Value, time.Now())
	if err != nil {
		return nil, nil
	}
	profile, err := s.store.GetUserProfile(request.Context(), session.UserID)
	if err != nil {
		return nil, err
	}
	return &profile, nil
}

func writeJSON(writer http.ResponseWriter, status int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(status)
	_ = json.NewEncoder(writer).Encode(payload)
}

func (s *Server) registerSession(writer http.ResponseWriter, ctx context.Context, store Store, userID string) error {
	session, err := store.CreateSession(ctx, userID)
	if err != nil {
		return err
	}
	SetSessionCookieWithOptions(writer, session.Token, s.cookieSecure)
	return nil
}

// handleRegister replaces POST /api/auth/register.
func (s *Server) handleRegister(writer http.ResponseWriter, request *http.Request) {
	var payload struct {
		Username string `json:"username"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil || payload.Username == "" || payload.Password == "" {
		writeAuthError(writer, http.StatusBadRequest, "Username and password are required.")
		return
	}
	if len(payload.Password) < 8 {
		writeAuthError(writer, http.StatusBadRequest, "Password must be at least 8 characters.")
		return
	}

	email := strings.TrimSpace(payload.Email)
	passwordHash, err := HashPassword(payload.Password)
	if err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "An unexpected error occurred.")
		return
	}

	var emailPtr *string
	if email != "" {
		email = strings.ToLower(email)
		emailPtr = &email
	}
	displayName := payload.Username
	user, err := s.store.CreateUser(request.Context(), CreateUserParams{
		Username:     payload.Username,
		DisplayName:  &displayName,
		Email:        nil,
		PendingEmail: emailPtr,
		PasswordHash: &passwordHash,
	})
	if err != nil {
		var constraintErr *constraintError
		if errors.As(err, &constraintErr) {
			writeAuthError(writer, http.StatusConflict, "Username or email already exists.")
			return
		}
		writeAuthError(writer, http.StatusInternalServerError, "An unexpected error occurred.")
		return
	}

	if err := s.registerSession(writer, request.Context(), s.store, user.ID); err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "An unexpected error occurred.")
		return
	}

	writeJSON(writer, http.StatusOK, map[string]any{
		"ok": true,
		"user": map[string]any{
			"id":       user.ID,
			"username": user.Username,
		},
	})
}

// handleLogin replaces POST /api/auth/login, including the legacy shared
// user bootstrap (DIFFAUDIT_SHARED_USERNAME / DIFFAUDIT_SHARED_PASSWORD).
func (s *Server) handleLogin(writer http.ResponseWriter, request *http.Request) {
	var payload struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil || payload.Username == "" || payload.Password == "" {
		writeAuthError(writer, http.StatusBadRequest, "Username and password are required.")
		return
	}

	if s.sharedUsername != "" || s.sharedPassword != "" {
		if _, err := s.store.EnsureLegacySharedUser(request.Context(), s.sharedUsername, s.sharedPassword); err != nil {
			writeAuthError(writer, http.StatusInternalServerError, "Invalid credentials.")
			return
		}
	}

	user, err := VerifyCredentials(request.Context(), s.store, payload.Username, payload.Password)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			writeAuthError(writer, http.StatusUnauthorized, "Invalid credentials.")
			return
		}
		writeAuthError(writer, http.StatusInternalServerError, "Invalid credentials.")
		return
	}

	if err := s.registerSession(writer, request.Context(), s.store, user.ID); err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "Invalid credentials.")
		return
	}

	avatarURL := user.AvatarURL
	writeJSON(writer, http.StatusOK, map[string]any{
		"ok": true,
		"user": map[string]any{
			"id":        user.ID,
			"username":  user.Username,
			"avatarUrl": avatarURL,
		},
	})
}

// handleMe replaces GET /api/auth/me. In demo mode an anonymous response is
// 200 with user:null; otherwise it is 401.
func (s *Server) handleMe(writer http.ResponseWriter, request *http.Request) {
	profile, err := s.currentProfile(request)
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"user": nil})
		return
	}
	if profile == nil {
		status := http.StatusOK
		if !s.demoMode(request) {
			status = http.StatusUnauthorized
		}
		writeJSON(writer, status, map[string]any{"user": nil})
		return
	}
	writeJSON(writer, http.StatusOK, map[string]any{"user": profileJSON(profile)})
}

func profileJSON(profile *UserProfile) map[string]any {
	return map[string]any{
		"id":               profile.ID,
		"username":         profile.Username,
		"displayName":      profile.DisplayName,
		"email":            profile.Email,
		"pendingEmail":     profile.PendingEmail,
		"emailVerified":    profile.EmailVerified,
		"avatarUrl":        profile.AvatarURL,
		"bio":              profile.Bio,
		"providers":        profile.Providers,
		"hasPassword":      profile.HasPassword,
		"twoFactorEnabled": profile.TwoFactorEnabled,
	}
}

// handleLogout replaces POST /api/auth/logout.
func (s *Server) handleLogout(writer http.ResponseWriter, request *http.Request) {
	if cookie, err := request.Cookie(SESSION_COOKIE_NAME); err == nil && cookie.Value != "" {
		_ = s.store.DeleteSession(request.Context(), cookie.Value)
	}
	ClearSessionCookie(writer)
	writeJSON(writer, http.StatusOK, map[string]any{"ok": true})
}

// handlePassword replaces POST /api/auth/password.
func (s *Server) handlePassword(writer http.ResponseWriter, request *http.Request) {
	profile, err := s.currentProfile(request)
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"code": "unauthorized"})
		return
	}
	if profile == nil {
		writeJSON(writer, http.StatusUnauthorized, map[string]any{"code": "unauthorized"})
		return
	}

	var payload struct {
		CurrentPassword string `json:"currentPassword"`
		Password        string `json:"password"`
		ConfirmPassword string `json:"confirmPassword"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"code": "password_required"})
		return
	}
	password := strings.TrimSpace(payload.Password)
	confirmPassword := strings.TrimSpace(payload.ConfirmPassword)

	if password == "" || confirmPassword == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"code": "password_required"})
		return
	}
	if len(password) < 8 {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"code": "password_too_short"})
		return
	}
	if password != confirmPassword {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"code": "password_mismatch"})
		return
	}
	if profile.HasPassword {
		currentPassword := payload.CurrentPassword
		if currentPassword == "" {
			writeJSON(writer, http.StatusBadRequest, map[string]any{"code": "current_password_required"})
			return
		}
		if user, err := s.store.GetUserByID(request.Context(), profile.ID); err != nil || user.PasswordHash == nil || !CheckPassword(*user.PasswordHash, currentPassword) {
			writeJSON(writer, http.StatusUnauthorized, map[string]any{"code": "current_password_incorrect"})
			return
		}
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"code": "unauthorized"})
		return
	}
	if err := s.store.SetPassword(request.Context(), profile.ID, passwordHash); err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"code": "unauthorized"})
		return
	}

	writeJSON(writer, http.StatusOK, map[string]any{"ok": true})
}

var emailPattern = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)

// handleEmail replaces POST /api/auth/email (set a pending email).
func (s *Server) handleEmail(writer http.ResponseWriter, request *http.Request) {
	profile, err := s.currentProfile(request)
	if err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "Unauthorized.")
		return
	}
	if profile == nil {
		writeAuthError(writer, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	var payload struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil || payload.Email == "" {
		writeAuthError(writer, http.StatusBadRequest, "Email is required.")
		return
	}

	email := strings.ToLower(strings.TrimSpace(payload.Email))
	if !emailPattern.MatchString(email) {
		writeAuthError(writer, http.StatusBadRequest, "Enter a valid email address.")
		return
	}
	claimed, err := s.store.EmailClaimedByOther(request.Context(), email, profile.ID)
	if err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "This email is already in use.")
		return
	}
	if claimed {
		writeAuthError(writer, http.StatusConflict, "This email is already in use.")
		return
	}

	if err := s.store.SetPendingEmail(request.Context(), profile.ID, email); err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "This email is already in use.")
		return
	}

	writeJSON(writer, http.StatusOK, map[string]any{"ok": true, "pendingEmail": email})
}

// handleEmailVerification replaces POST /api/auth/email-verification
// (create a verification request and return its URL).
func (s *Server) handleEmailVerification(writer http.ResponseWriter, request *http.Request) {
	profile, err := s.currentProfile(request)
	if err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "Unauthorized.")
		return
	}
	if profile == nil {
		writeAuthError(writer, http.StatusUnauthorized, "Unauthorized.")
		return
	}

	if profile.PendingEmail == nil || *profile.PendingEmail == "" {
		writeAuthError(writer, http.StatusBadRequest, "No pending email to verify.")
		return
	}

	token, err := SessionToken()
	if err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "No pending email to verify.")
		return
	}
	if _, err := s.store.CreateEmailVerificationToken(request.Context(), profile.ID, HashVerificationToken(token), *profile.PendingEmail); err != nil {
		writeAuthError(writer, http.StatusInternalServerError, "No pending email to verify.")
		return
	}

	base := strings.TrimRight(s.platformURL, "/")
	verificationURL := base + "/api/auth/verify-email?token=" + token
	writeJSON(writer, http.StatusOK, map[string]any{
		"ok":              true,
		"email":           *profile.PendingEmail,
		"verificationUrl": verificationURL,
	})
}

// handleVerifyEmail replaces GET /api/auth/verify-email (link redirect).
func (s *Server) handleVerifyEmail(writer http.ResponseWriter, request *http.Request) {
	token := request.URL.Query().Get("token")
	base := strings.TrimRight(s.platformURL, "/")
	if token == "" {
		http.Redirect(writer, request, base+"/workspace/account?emailVerified=missing", http.StatusFound)
		return
	}

	tokenHash := HashVerificationToken(token)
	record, err := s.store.GetEmailVerificationToken(request.Context(), tokenHash)
	if err != nil || record.ExpiresAt.Before(time.Now()) {
		http.Redirect(writer, request, base+"/workspace/account?emailVerified=error", http.StatusFound)
		return
	}

	user, err := s.store.GetUserByID(request.Context(), record.UserID)
	if err != nil || user.PendingEmail == nil || *user.PendingEmail != record.Email {
		http.Redirect(writer, request, base+"/workspace/account?emailVerified=error", http.StatusFound)
		return
	}

	if err := s.store.VerifyEmail(request.Context(), record.UserID, record.Email); err != nil {
		http.Redirect(writer, request, base+"/workspace/account?emailVerified=error", http.StatusFound)
		return
	}
	_ = s.store.DeleteTokensForUser(request.Context(), record.UserID)

	http.Redirect(writer, request, base+"/workspace/account?emailVerified=1", http.StatusFound)
}

// handleTwoFactor replaces POST /api/auth/two-factor. The legacy
// implementation only toggles the stored enabled flag (no TOTP challenge in
// the login flow), so this handler keeps that exact contract.
func (s *Server) handleTwoFactor(writer http.ResponseWriter, request *http.Request) {
	profile, err := s.currentProfile(request)
	if err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"code": "unauthorized"})
		return
	}
	if profile == nil {
		writeJSON(writer, http.StatusUnauthorized, map[string]any{"code": "unauthorized"})
		return
	}

	var payload struct {
		Enabled *bool `json:"enabled"`
	}
	if err := json.NewDecoder(request.Body).Decode(&payload); err != nil || payload.Enabled == nil {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"code": "enabled_required"})
		return
	}

	if err := s.store.SetTwoFactorEnabled(request.Context(), profile.ID, *payload.Enabled); err != nil {
		writeJSON(writer, http.StatusInternalServerError, map[string]any{"code": "unauthorized"})
		return
	}

	writeJSON(writer, http.StatusOK, map[string]any{"ok": true, "enabled": *payload.Enabled})
}

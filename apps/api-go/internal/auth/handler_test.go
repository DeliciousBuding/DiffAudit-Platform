package auth

import (
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"
)

func newTestServer(t *testing.T, mutate func(*Options)) (*Server, func()) {
	t.Helper()

	store, err := OpenStore(filepath.Join(t.TempDir(), "auth.db"))
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	if err := store.Migrate(context.Background()); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	opts := Options{
		Store:          store,
		PlatformURL:    "https://platform.example.com",
		SharedUsername: "",
		SharedPassword: "",
		GitHubClientID: "gh-client",
		GitHubSecret:   "gh-secret",
		GoogleClientID: "go-client",
		GoogleSecret:   "go-secret",
		OAuthProxyURL:  "",
		CookieSecure:   true,
	}
	if mutate != nil {
		mutate(&opts)
	}
	return NewServer(opts), func() { _ = store.Close() }
}

func performJSON(t *testing.T, handler http.Handler, method, path, body string, cookies []*http.Cookie) (*httptest.ResponseRecorder, map[string]any) {
	t.Helper()
	request := httptest.NewRequest(method, path, strings.NewReader(body))
	if body != "" {
		request.Header.Set("Content-Type", "application/json")
	}
	for _, cookie := range cookies {
		request.AddCookie(cookie)
	}
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)

	var payload map[string]any
	if recorder.Body.Len() > 0 {
		_ = json.Unmarshal(recorder.Body.Bytes(), &payload)
	}
	return recorder, payload
}

func sessionCookie(t *testing.T, recorder *httptest.ResponseRecorder) *http.Cookie {
	t.Helper()
	for _, line := range recorder.Header().Values("Set-Cookie") {
		header := http.Response{Header: http.Header{"Set-Cookie": []string{line}}}
		if cookie := (&header).Cookies()[0]; cookie.Name == SESSION_COOKIE_NAME {
			return cookie
		}
	}
	t.Fatalf("no session cookie in response: %v", recorder.Header().Values("Set-Cookie"))
	return nil
}

func TestRegisterLoginMeLogoutFlow(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	// Register
	recorder, payload := performJSON(t, handler, http.MethodPost, "/api/auth/register",
		`{"username":"alice","email":"alice@example.com","password":"password123"}`, nil)
	if recorder.Code != http.StatusOK || payload["ok"] != true {
		t.Fatalf("register: %d %v", recorder.Code, payload)
	}
	cookie := sessionCookie(t, recorder)

	// Register duplicate
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/register",
		`{"username":"alice","email":"other@example.com","password":"password123"}`, nil)
	if recorder.Code != http.StatusConflict {
		t.Fatalf("register duplicate: %d %v", recorder.Code, payload)
	}

	// Me with session
	recorder, payload = performJSON(t, handler, http.MethodGet, "/api/auth/me", "", []*http.Cookie{cookie})
	if recorder.Code != http.StatusOK {
		t.Fatalf("me: %d", recorder.Code)
	}
	user, _ := payload["user"].(map[string]any)
	if user == nil || user["username"] != "alice" || user["twoFactorEnabled"] != false {
		t.Fatalf("me payload: %v", payload)
	}

	// Logout
	recorder, _ = performJSON(t, handler, http.MethodPost, "/api/auth/logout", "", []*http.Cookie{cookie})
	if recorder.Code != http.StatusOK {
		t.Fatalf("logout: %d", recorder.Code)
	}

	// Me after logout → demo default: 200 user null; with cookie=0: 401
	recorder, payload = performJSON(t, handler, http.MethodGet, "/api/auth/me", "", []*http.Cookie{cookie, {Name: "platform-demo-mode", Value: "0"}})
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("me after logout (non-demo): %d %v", recorder.Code, payload)
	}

	// Login with wrong password
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/login",
		`{"username":"alice","password":"wrongpass"}`, nil)
	if recorder.Code != http.StatusUnauthorized || payload["message"] != "Invalid credentials." {
		t.Fatalf("login wrong: %d %v", recorder.Code, payload)
	}
	if cookieHeader := recorder.Header().Get("Set-Cookie"); cookieHeader != "" {
		t.Fatalf("login failure must not set cookie: %q", cookieHeader)
	}

	// Login success
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/login",
		`{"username":"alice","password":"password123"}`, nil)
	if recorder.Code != http.StatusOK || payload["ok"] != true {
		t.Fatalf("login: %d %v", recorder.Code, payload)
	}
}

func TestRegisterValidation(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	cases := []struct {
		body        string
		wantStatus  int
		wantMessage string
	}{
		{`{"username":"","password":"password123"}`, 400, "Username and password are required."},
		{`{"username":"bob"}`, 400, "Username and password are required."},
		{`{"username":"bob","password":"short"}`, 400, "Password must be at least 8 characters."},
	}
	for _, tc := range cases {
		recorder, payload := performJSON(t, handler, http.MethodPost, "/api/auth/register", tc.body, nil)
		if recorder.Code != tc.wantStatus || payload["message"] != tc.wantMessage {
			t.Fatalf("register %q: %d %v", tc.body, recorder.Code, payload)
		}
	}
}

func TestLegacySharedUserLogin(t *testing.T) {
	server, shutdown := newTestServer(t, func(opts *Options) {
		opts.SharedUsername = "demo-reviewer"
		opts.SharedPassword = "demo-secret-pass"
	})
	defer shutdown()
	handler := server.Routes()

	recorder, payload := performJSON(t, handler, http.MethodPost, "/api/auth/login",
		`{"username":"demo-reviewer","password":"demo-secret-pass"}`, nil)
	if recorder.Code != http.StatusOK || payload["ok"] != true {
		t.Fatalf("shared login: %d %v", recorder.Code, payload)
	}
	_ = sessionCookie(t, recorder)
}

func TestPasswordUpdateFlow(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	recorder, _ := performJSON(t, handler, http.MethodPost, "/api/auth/register",
		`{"username":"pwduser","password":"password123"}`, nil)
	cookie := sessionCookie(t, recorder)

	// Wrong current password
	recorder, payload := performJSON(t, handler, http.MethodPost, "/api/auth/password",
		`{"currentPassword":"wrong","password":"newpassword","confirmPassword":"newpassword"}`, []*http.Cookie{cookie})
	if recorder.Code != http.StatusUnauthorized || payload["code"] != "current_password_incorrect" {
		t.Fatalf("password wrong current: %d %v", recorder.Code, payload)
	}

	// Mismatch
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/password",
		`{"currentPassword":"password123","password":"newpassword1","confirmPassword":"newpassword2"}`, []*http.Cookie{cookie})
	if recorder.Code != http.StatusBadRequest || payload["code"] != "password_mismatch" {
		t.Fatalf("password mismatch: %d %v", recorder.Code, payload)
	}

	// Success
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/password",
		`{"currentPassword":"password123","password":"newpassword1","confirmPassword":"newpassword1"}`, []*http.Cookie{cookie})
	if recorder.Code != http.StatusOK || payload["ok"] != true {
		t.Fatalf("password update: %d %v", recorder.Code, payload)
	}

	// Login with the new password
	recorder, _ = performJSON(t, handler, http.MethodPost, "/api/auth/login",
		`{"username":"pwduser","password":"newpassword1"}`, nil)
	if recorder.Code != http.StatusOK {
		t.Fatalf("login new password: %d", recorder.Code)
	}
}

func TestEmailAndVerificationFlow(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	recorder, _ := performJSON(t, handler, http.MethodPost, "/api/auth/register",
		`{"username":"mailer","password":"password123"}`, nil)
	cookie := sessionCookie(t, recorder)

	// Invalid email
	recorder, payload := performJSON(t, handler, http.MethodPost, "/api/auth/email",
		`{"email":"not-an-email"}`, []*http.Cookie{cookie})
	if recorder.Code != http.StatusBadRequest || payload["message"] != "Enter a valid email address." {
		t.Fatalf("email invalid: %d %v", recorder.Code, payload)
	}

	// Set pending email
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/email",
		`{"email":"mailer@example.com"}`, []*http.Cookie{cookie})
	if recorder.Code != http.StatusOK || payload["pendingEmail"] != "mailer@example.com" {
		t.Fatalf("email set: %d %v", recorder.Code, payload)
	}

	// Create verification request
	recorder, payload = performJSON(t, handler, http.MethodPost, "/api/auth/email-verification", "", []*http.Cookie{cookie})
	if recorder.Code != http.StatusOK {
		t.Fatalf("verification request: %d %v", recorder.Code, payload)
	}
	verificationURL, _ := payload["verificationUrl"].(string)
	if !strings.Contains(verificationURL, "/api/auth/verify-email?token=") {
		t.Fatalf("verification url: %v", payload)
	}

	// Verify with the token (extract from URL)
	token := verificationURL[strings.LastIndex(verificationURL, "token=")+6:]
	recorder = httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/auth/verify-email?token="+token, nil)
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusFound || !strings.Contains(recorder.Header().Get("Location"), "emailVerified=1") {
		t.Fatalf("verify-email: %d %s", recorder.Code, recorder.Header().Get("Location"))
	}

	// Missing token redirects to missing
	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodGet, "/api/auth/verify-email", nil)
	handler.ServeHTTP(recorder, request)
	if !strings.Contains(recorder.Header().Get("Location"), "emailVerified=missing") {
		t.Fatalf("verify-email missing: %s", recorder.Header().Get("Location"))
	}
}

func TestTwoFactorToggle(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	recorder, _ := performJSON(t, handler, http.MethodPost, "/api/auth/register",
		`{"username":"tfuser","password":"password123"}`, nil)
	cookie := sessionCookie(t, recorder)

	recorder, payload := performJSON(t, handler, http.MethodPost, "/api/auth/two-factor",
		`{"enabled":true}`, []*http.Cookie{cookie})
	if recorder.Code != http.StatusOK || payload["enabled"] != true {
		t.Fatalf("two-factor enable: %d %v", recorder.Code, payload)
	}

	recorder, payload = performJSON(t, handler, http.MethodGet, "/api/auth/me", "", []*http.Cookie{cookie})
	user, _ := payload["user"].(map[string]any)
	if user["twoFactorEnabled"] != true {
		t.Fatalf("two-factor not reflected in profile: %v", payload)
	}
}

func TestOAuthStartFlows(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	// Configured github → 302 to provider with state cookie
	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/auth/github", nil)
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusFound {
		t.Fatalf("github start: %d", recorder.Code)
	}
	location := recorder.Header().Get("Location")
	if !strings.Contains(location, "github.com/login/oauth/authorize") {
		t.Fatalf("github location: %s", location)
	}
	found := false
	for _, line := range recorder.Header().Values("Set-Cookie") {
		if strings.Contains(line, "diffaudit_oauth_state") {
			found = true
		}
	}
	if !found {
		t.Fatalf("missing state cookie: %v", recorder.Header().Values("Set-Cookie"))
	}

	// Callback with mismatched state → oauth_state redirect
	recorder = httptest.NewRecorder()
	request = httptest.NewRequest(http.MethodGet, "/api/auth/github/callback?code=abc&state=wrong", nil)
	handler.ServeHTTP(recorder, request)
	if !strings.Contains(recorder.Header().Get("Location"), "error=oauth_state") {
		t.Fatalf("github callback bad state: %s", recorder.Header().Get("Location"))
	}
}

func TestOAuthNotConfigured(t *testing.T) {
	server, shutdown := newTestServer(t, func(opts *Options) {
		opts.GitHubClientID = ""
		opts.GitHubSecret = ""
	})
	defer shutdown()
	handler := server.Routes()

	recorder, payload := performJSON(t, handler, http.MethodGet, "/api/auth/github", "", nil)
	if recorder.Code != http.StatusInternalServerError || payload["message"] != "GitHub OAuth is not configured." {
		t.Fatalf("github unconfigured: %d %v", recorder.Code, payload)
	}
}

func TestSessionCookieAttributes(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	recorder, _ := performJSON(t, handler, http.MethodPost, "/api/auth/register",
		`{"username":"cookieuser","password":"password123"}`, nil)
	cookie := sessionCookie(t, recorder)

	if !cookie.HttpOnly || cookie.SameSite != http.SameSiteLaxMode || !cookie.Secure || cookie.Path != "/" {
		t.Fatalf("cookie attributes: %+v", cookie)
	}
	if cookie.MaxAge != SESSION_COOKIE_MAX_AGE {
		t.Fatalf("cookie maxage: %d want %d", cookie.MaxAge, SESSION_COOKIE_MAX_AGE)
	}
}

func TestDemoModeMe(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	// Anonymous in default demo mode → 200 {"user":null}
	recorder, payload := performJSON(t, handler, http.MethodGet, "/api/auth/me", "", nil)
	if recorder.Code != http.StatusOK || payload["user"] != nil {
		t.Fatalf("me anonymous demo: %d %v", recorder.Code, payload)
	}

	// Cookie 0 disables demo → 401
	recorder, payload = performJSON(t, handler, http.MethodGet, "/api/auth/me", "",
		[]*http.Cookie{{Name: "platform-demo-mode", Value: "0"}})
	if recorder.Code != http.StatusUnauthorized || payload["user"] != nil {
		t.Fatalf("me anonymous non-demo: %d %v", recorder.Code, payload)
	}
}

func TestVerifyEmailExpiredToken(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	handler := server.Routes()

	recorder := httptest.NewRecorder()
	request := httptest.NewRequest(http.MethodGet, "/api/auth/verify-email?token=bogus", nil)
	handler.ServeHTTP(recorder, request)
	if !strings.Contains(recorder.Header().Get("Location"), "emailVerified=error") {
		t.Fatalf("verify-email bogus: %s", recorder.Header().Get("Location"))
	}
}

func TestRoutesAreRegisteredOnMux(t *testing.T) {
	server, shutdown := newTestServer(t, nil)
	defer shutdown()
	mux := server.Routes()

	for _, entry := range []struct {
		method string
		path   string
		body   io.Reader
	}{
		{http.MethodPost, "/api/auth/register", strings.NewReader(`{}`)},
		{http.MethodPost, "/api/auth/login", strings.NewReader(`{}`)},
		{http.MethodGet, "/api/auth/me", nil},
		{http.MethodPost, "/api/auth/logout", nil},
		{http.MethodPost, "/api/auth/password", strings.NewReader(`{}`)},
		{http.MethodPost, "/api/auth/email", strings.NewReader(`{}`)},
		{http.MethodPost, "/api/auth/email-verification", nil},
		{http.MethodGet, "/api/auth/verify-email", nil},
		{http.MethodPost, "/api/auth/two-factor", strings.NewReader(`{}`)},
		{http.MethodGet, "/api/auth/github", nil},
		{http.MethodGet, "/api/auth/github/callback", nil},
		{http.MethodGet, "/api/auth/google", nil},
		{http.MethodGet, "/api/auth/google/callback", nil},
	} {
		request := httptest.NewRequest(entry.method, entry.path, entry.body)
		recorder := httptest.NewRecorder()
		mux.ServeHTTP(recorder, request)
		if recorder.Code == http.StatusNotFound {
			t.Fatalf("route not registered: %s %s", entry.method, entry.path)
		}
	}
}

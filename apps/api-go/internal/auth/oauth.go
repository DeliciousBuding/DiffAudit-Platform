package auth

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// oauthStateCookieTTL mirrors the 10-minute state cookie in the legacy Next
// routes (maxAge: 60 * 10).
const oauthStateCookieTTL = 10 * time.Minute

// oauthHTTPTimeout bounds all outbound provider calls.
const oauthHTTPTimeout = 15 * time.Second

// OAuthProviderSet holds the provider descriptors used by the OAuth entry
// and callback handlers. Both providers share the same state-cookie flow;
// the legacy implementation used distinct cookie names per provider.
type OAuthProviderSet struct {
	github *oauthProvider
	google *oauthProvider
	client *http.Client
}

type oauthProvider struct {
	name         string // "github" | "google"
	clientID     string
	clientSecret string
	authURL      string
	tokenURL     string
	userInfoURL  string
	scope        string
	stateCookie  string
	errorPrefix  string
}

type oauthStoredState struct {
	State      string `json:"state"`
	RedirectTo string `json:"redirectTo"`
	Mode       string `json:"mode"`
	UserID     string `json:"userId"`
}

// newOAuthProviderSet builds the provider set and the HTTP client used for
// provider calls. When OAuthProxyURL is set it is used as the outbound
// proxy, mirroring undici's ProxyAgent in apps/web/src/lib/oauth-fetch.ts.
func newOAuthProviderSet(opts Options) *OAuthProviderSet {
	client := &http.Client{Timeout: oauthHTTPTimeout}
	if proxyURL := strings.TrimSpace(opts.OAuthProxyURL); proxyURL != "" {
		parsed, err := url.Parse(proxyURL)
		if err == nil && (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != "" {
			client.Transport = &http.Transport{Proxy: http.ProxyURL(parsed)}
		}
	}

	return &OAuthProviderSet{
		github: &oauthProvider{
			name:         "github",
			clientID:     opts.GitHubClientID,
			clientSecret: opts.GitHubSecret,
			authURL:      "https://github.com/login/oauth/authorize",
			tokenURL:     "https://github.com/login/oauth/access_token",
			userInfoURL:  "https://api.github.com/user",
			scope:        "read:user user:email",
			stateCookie:  "diffaudit_oauth_state",
			errorPrefix:  "oauth_network_github",
		},
		google: &oauthProvider{
			name:         "google",
			clientID:     opts.GoogleClientID,
			clientSecret: opts.GoogleSecret,
			authURL:      "https://accounts.google.com/o/oauth2/v2/auth",
			tokenURL:     "https://oauth2.googleapis.com/token",
			userInfoURL:  "https://openidconnect.googleapis.com/v1/userinfo",
			scope:        "openid email profile",
			stateCookie:  "diffaudit_google_oauth_state",
			errorPrefix:  "oauth_network_google",
		},
		client: client,
	}
}

// resolvePlatformURL mirrors resolvePlatformUrl in apps/web/src/lib/auth.ts:
// the configured DIFFAUDIT_PLATFORM_URL takes precedence (when it is a valid
// http(s) origin), then forwarded headers, then the request origin.
func (s *Server) resolvePlatformURL(request *http.Request) string {
	if configured := validPlatformOrigin(s.platformURL); configured != "" {
		return configured
	}

	forwardedHost := request.Header.Get("x-forwarded-host")
	if comma := strings.Index(forwardedHost, ","); comma >= 0 {
		forwardedHost = forwardedHost[:comma]
	}
	forwardedProto := request.Header.Get("x-forwarded-proto")
	if comma := strings.Index(forwardedProto, ","); comma >= 0 {
		forwardedProto = forwardedProto[:comma]
	}

	host := strings.TrimSpace(forwardedHost)
	proto := strings.TrimSpace(forwardedProto)
	if host == "" {
		host = request.Host
	}
	if host != "" {
		if proto == "" {
			if request.URL != nil && request.URL.Scheme == "http" || request.URL != nil && request.URL.Scheme == "https" {
				proto = request.URL.Scheme
			} else {
				proto = "https"
			}
		}
		return proto + "://" + host
	}
	if request.URL != nil && request.URL.IsAbs() {
		return request.URL.Scheme + "://" + request.URL.Host
	}
	return "http://localhost:3000"
}

func validPlatformOrigin(value string) string {
	trimmed := strings.TrimSpace(value)
	if trimmed == "" {
		return ""
	}
	parsed, err := url.Parse(trimmed)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Hostname() == "0.0.0.0" {
		return ""
	}
	return parsed.Scheme + "://" + parsed.Host
}

// clearCookie expires the named cookie.
func clearCookie(writer http.ResponseWriter, name string) {
	http.SetCookie(writer, &http.Cookie{
		Name:     name,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	})
}

// providerDisplayName maps the provider identifier to the human-readable
// name used in the "not configured" message, matching the legacy copy
// ("GitHub OAuth is not configured." / "Google OAuth is not configured.").
func providerDisplayName(name string) string {
	if name == "github" {
		return "GitHub"
	}
	if name == "google" {
		return "Google"
	}
	return strings.Title(name)
}

// handleOAuthStart implements GET /api/auth/{provider} — validates config,
// issues the state cookie and redirects to the provider authorize endpoint.
func (s *Server) handleOAuthStart(providerName string) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		provider := s.oauth.get(providerName)
		if provider == nil || provider.clientID == "" || provider.clientSecret == "" {
			writeJSON(writer, http.StatusInternalServerError, map[string]any{
				"message": fmt.Sprintf("%s OAuth is not configured.", providerDisplayName(providerName)),
			})
			return
		}

		platformURL := s.resolvePlatformURL(request)
		query := request.URL.Query()
		intent := query.Get("intent")
		redirectTo := sanitizeRedirectPath(query.Get("redirectTo"), defaultRedirect(intent))
		mode := "login"
		if intent == "connect" {
			mode = "connect"
		}

		currentUser, _ := s.currentProfile(request)
		if intent == "connect" && currentUser == nil {
			http.Redirect(writer, request, platformURL+"/login?redirectTo="+url.QueryEscape(redirectTo), http.StatusFound)
			return
		}
		if intent == "connect" && currentUser != nil {
			mode = "connect"
		}

		stateBytes := make([]byte, 16)
		_, _ = rand.Read(stateBytes)
		state := hex.EncodeToString(stateBytes)

		payload := oauthStoredState{
			State:      state,
			RedirectTo: redirectTo,
			Mode:       mode,
		}
		if currentUser != nil {
			payload.UserID = currentUser.ID
		}
		encoded, _ := json.Marshal(payload)

		http.SetCookie(writer, &http.Cookie{
			Name:     provider.stateCookie,
			Value:    base64.RawURLEncoding.EncodeToString(encoded),
			Path:     "/",
			MaxAge:   int(oauthStateCookieTTL.Seconds()),
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})

		authorizeURL, _ := url.Parse(provider.authURL)
		params := authorizeURL.Query()
		params.Set("client_id", provider.clientID)
		params.Set("redirect_uri", platformURL+"/api/auth/"+provider.name+"/callback")
		params.Set("scope", provider.scope)
		params.Set("state", state)
		authorizeURL.RawQuery = params.Encode()

		http.Redirect(writer, request, authorizeURL.String(), http.StatusFound)
	}
}

// handleOAuthCallback implements GET /api/auth/{provider}/callback — verifies
// state, exchanges the code, fetches the profile and either links the
// account (connect mode) or signs the user in (login mode).
func (s *Server) handleOAuthCallback(providerName string) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		provider := s.oauth.get(providerName)
		platformURL := s.resolvePlatformURL(request)
		if provider == nil {
			http.Redirect(writer, request, platformURL+"/login?error=oauth_state", http.StatusFound)
			return
		}

		code := request.URL.Query().Get("code")
		returnedState := request.URL.Query().Get("state")

		storedState, stateErr := readStoredState(request, provider)
		clearCookie(writer, provider.stateCookie)
		if stateErr != nil || code == "" || returnedState == "" || !timingSafeStateEqual(returnedState, storedState.State) {
			http.Redirect(writer, request, platformURL+"/login?error=oauth_state", http.StatusFound)
			return
		}

		if provider.clientID == "" || provider.clientSecret == "" {
			http.Redirect(writer, request, platformURL+"/login?error=oauth_config", http.StatusFound)
			return
		}

		token, err := s.oauth.exchangeToken(request.Context(), provider, platformURL, code, returnedState)
		if err != nil {
			http.Redirect(writer, request, platformURL+"/login?error="+provider.errorPrefix, http.StatusFound)
			return
		}

		profile, err := s.oauth.fetchProfile(request.Context(), provider, token)
		if err != nil {
			http.Redirect(writer, request, platformURL+"/login?error=oauth_user", http.StatusFound)
			return
		}

		if storedState.Mode == "connect" && storedState.UserID != "" {
			currentUser, _ := s.currentProfile(request)
			if currentUser == nil || currentUser.ID != storedState.UserID {
				http.Redirect(writer, request, platformURL+"/login?error=session_mismatch", http.StatusFound)
				return
			}

			result, err := s.store.LinkOAuthAccount(request.Context(), storedState.UserID, provider.name, profile.ProviderAccountID, profile.OAuthProfile)
			if err != nil {
				status := "error"
				if errors.Is(err, ErrProviderInUse) {
					status = provider.name + "_in_use"
				} else if errors.Is(err, ErrProviderAlreadyConnected) {
					status = provider.name + "_already_connected"
				}
				http.Redirect(writer, request, buildRedirectWithProviderStatus(storedState.RedirectTo, status, platformURL), http.StatusFound)
				return
			}
			status := provider.name + "_connected"
			if result.Status == LinkStatusAlreadyLinked {
				status = provider.name + "_already_connected"
			}
			http.Redirect(writer, request, buildRedirectWithProviderStatus(storedState.RedirectTo, status, platformURL), http.StatusFound)
			return
		}

		appUser, err := s.store.FindOrCreateOAuthUser(request.Context(), provider.name, profile.ProviderAccountID, profile.OAuthProfile)
		if err != nil {
			http.Redirect(writer, request, platformURL+"/login?error=oauth_user", http.StatusFound)
			return
		}
		if err := s.registerSession(writer, request.Context(), s.store, appUser.ID); err != nil {
			http.Redirect(writer, request, platformURL+"/login?error=oauth_user", http.StatusFound)
			return
		}

		nextPath := sanitizeRedirectPath(storedState.RedirectTo, "/workspace")
		http.Redirect(writer, request, platformURL+nextPath, http.StatusFound)
	}
}

func (p *OAuthProviderSet) get(name string) *oauthProvider {
	switch name {
	case "github":
		return p.github
	case "google":
		return p.google
	default:
		return nil
	}
}

// exchangeToken performs the provider access-token exchange. GitHub uses a
// JSON body; Google uses form-encoded body — both accept the JSON-form
// response here since GitHub returns JSON with Accept: application/json.
func (p *OAuthProviderSet) exchangeToken(ctx context.Context, provider *oauthProvider, platformURL, code, state string) (string, error) {
	redirectURI := platformURL + "/api/auth/" + provider.name + "/callback"
	if provider.name == "github" {
		body, _ := json.Marshal(map[string]string{
			"client_id":     provider.clientID,
			"client_secret": provider.clientSecret,
			"code":          code,
			"redirect_uri":  redirectURI,
			"state":         state,
		})
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, provider.tokenURL, strings.NewReader(string(body)))
		if err != nil {
			return "", err
		}
		req.Header.Set("Accept", "application/json")
		req.Header.Set("Content-Type", "application/json")
		return p.doTokenRequest(req)
	}

	form := url.Values{}
	form.Set("client_id", provider.clientID)
	form.Set("client_secret", provider.clientSecret)
	form.Set("code", code)
	form.Set("redirect_uri", redirectURI)
	form.Set("state", state)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, provider.tokenURL, strings.NewReader(form.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	return p.doTokenRequest(req)
}

func (p *OAuthProviderSet) doTokenRequest(req *http.Request) (string, error) {
	resp, err := p.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)

	var payload struct {
		AccessToken string `json:"access_token"`
		Error       string `json:"error"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return "", fmt.Errorf("token payload: %w", err)
	}
	if payload.Error != "" || payload.AccessToken == "" {
		return "", fmt.Errorf("token exchange failed: %s", payload.Error)
	}
	return payload.AccessToken, nil
}

// fetchProfile resolves the provider profile: GitHub fetches /user and then
// /user/emails when the primary email is missing; Google fetches the OpenID
// userinfo endpoint.
func (p *OAuthProviderSet) fetchProfile(ctx context.Context, provider *oauthProvider, accessToken string) (oauthIdentity, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, provider.userInfoURL, nil)
	if err != nil {
		return oauthIdentity{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json, application/json")
	req.Header.Set("User-Agent", "DiffAudit-Platform")

	resp, err := p.client.Do(req)
	if err != nil {
		return oauthIdentity{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return oauthIdentity{}, fmt.Errorf("userinfo status %d", resp.StatusCode)
	}

	if provider.name == "github" {
		var payload struct {
			ID        int     `json:"id"`
			Login     string  `json:"login"`
			Name      *string `json:"name"`
			AvatarURL *string `json:"avatar_url"`
			Email     *string `json:"email"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
			return oauthIdentity{}, err
		}

		email, emailVerified := "", false
		if payload.Email != nil && *payload.Email != "" {
			email = *payload.Email
			emailVerified = true
		} else {
			fetchEmail, err := p.fetchGitHubEmails(ctx, accessToken)
			if err == nil {
				email, emailVerified = fetchEmail.email, fetchEmail.verified
			}
		}

		displayName := payload.Login
		if payload.Name != nil && *payload.Name != "" {
			displayName = *payload.Name
		}
		return oauthIdentity{
			ProviderAccountID: fmt.Sprintf("%d", payload.ID),
			OAuthProfile: OAuthProfile{
				Username:      payload.Login,
				DisplayName:   &displayName,
				Email:         optionalString(email),
				EmailVerified: emailVerified,
				AvatarURL:     payload.AvatarURL,
			},
		}, nil
	}

	var payload struct {
		Sub           string `json:"sub"`
		Name          string `json:"name"`
		Email         string `json:"email"`
		EmailVerified bool   `json:"email_verified"`
		Picture       string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return oauthIdentity{}, err
	}
	username := buildGoogleUsername(payload.Email, payload.Name, payload.Sub)
	displayName := payload.Name
	if displayName == "" {
		if payload.Email != "" {
			displayName = payload.Email
		} else {
			displayName = "Google user"
		}
	}
	return oauthIdentity{
		ProviderAccountID: payload.Sub,
		OAuthProfile: OAuthProfile{
			Username:      username,
			DisplayName:   &displayName,
			Email:         optionalString(payload.Email),
			EmailVerified: payload.EmailVerified,
			AvatarURL:     optionalString(payload.Picture),
		},
	}, nil
}

func (p *OAuthProviderSet) fetchGitHubEmails(ctx context.Context, accessToken string) (struct {
	email    string
	verified bool
}, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, "https://api.github.com/user/emails", nil)
	if err != nil {
		return struct {
			email    string
			verified bool
		}{}, err
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("User-Agent", "DiffAudit-Platform")

	resp, err := p.client.Do(req)
	if err != nil {
		return struct {
			email    string
			verified bool
		}{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return struct {
			email    string
			verified bool
		}{}, fmt.Errorf("emails status %d", resp.StatusCode)
	}

	var emails []struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return struct {
			email    string
			verified bool
		}{}, err
	}
	var preferred *struct {
		Email    string `json:"email"`
		Primary  bool   `json:"primary"`
		Verified bool   `json:"verified"`
	}
	for index := range emails {
		if emails[index].Primary {
			preferred = &emails[index]
			break
		}
	}
	if preferred == nil && len(emails) > 0 {
		preferred = &emails[0]
	}
	if preferred == nil {
		return struct {
			email    string
			verified bool
		}{}, fmt.Errorf("no email")
	}
	return struct {
		email    string
		verified bool
	}{preferred.Email, preferred.Verified}, nil
}

// oauthIdentity carries the provider detail plus the canonical profile.
type oauthIdentity struct {
	ProviderAccountID string
	OAuthProfile      OAuthProfile
}

func buildGoogleUsername(email, name, subject string) string {
	seed := ""
	if email != "" {
		seed = strings.Split(email, "@")[0]
	}
	if seed == "" {
		seed = name
	}
	if seed == "" {
		seed = "google-" + shortSubject(subject)
	}
	normalized := strings.ToLower(seed)
	var builder strings.Builder
	for _, r := range normalized {
		if (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			builder.WriteRune(r)
		} else {
			builder.WriteByte('-')
		}
	}
	out := strings.Trim(builder.String(), "-")
	if len(out) > 24 {
		out = out[:24]
	}
	if out == "" {
		out = "google-" + shortSubject(subject)
	}
	return out
}

func shortSubject(subject string) string {
	if len(subject) > 8 {
		return subject[:8]
	}
	return subject
}

// sanitizeRedirectPath mirrors sanitizeRedirectPath in lib/auth.ts.
func sanitizeRedirectPath(redirectPath, fallbackPath string) string {
	if redirectPath == "" {
		return fallbackPath
	}
	p := strings.TrimSpace(redirectPath)
	if !strings.HasPrefix(p, "/") || strings.HasPrefix(p, "//") {
		return fallbackPath
	}
	return p
}

func defaultRedirect(intent string) string {
	if intent == "connect" {
		return "/workspace/account"
	}
	return ""
}

// buildRedirectWithProviderStatus mirrors the providerLink query param flow.
func buildRedirectWithProviderStatus(redirectTo, providerLink, platformURL string) string {
	target := sanitizeRedirectPath(redirectTo, "/workspace/account")
	parsed, err := url.Parse(platformURL + target)
	if err != nil {
		return platformURL + "/workspace/account"
	}
	query := parsed.Query()
	query.Set("providerLink", providerLink)
	parsed.RawQuery = query.Encode()
	return parsed.String()
}

// readStoredState parses and clears the provider state cookie.
func readStoredState(request *http.Request, provider *oauthProvider) (oauthStoredState, error) {
	cookie, err := request.Cookie(provider.stateCookie)
	if err != nil {
		return oauthStoredState{}, err
	}
	raw, err := base64.RawURLEncoding.DecodeString(cookie.Value)
	if err != nil {
		return oauthStoredState{}, err
	}
	var state oauthStoredState
	if err := json.Unmarshal(raw, &state); err != nil {
		return oauthStoredState{}, err
	}
	return state, nil
}

func providerStateCookieName(provider *oauthProvider) string {
	return provider.stateCookie
}

// timingSafeStateEqual compares state strings in constant time, mirroring
// timingSafeStateEqual in apps/web/src/lib/timing-safe.ts.
func timingSafeStateEqual(a, b string) bool {
	aBytes := []byte(a)
	bBytes := []byte(b)
	if len(aBytes) != len(bBytes) || len(aBytes) > 256 {
		return false
	}
	return subtle.ConstantTimeCompare(aBytes, bBytes) == 1
}

func optionalString(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

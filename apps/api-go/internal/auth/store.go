package auth

import (
	"context"
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	_ "modernc.org/sqlite" // pure-Go SQLite driver: CGO_ENABLED=0 safe
)

// Sentinel errors returned by the store. Handlers map them to HTTP responses.
var (
	ErrNoUser                   = errors.New("user not found")
	ErrNoSession                = errors.New("session not found")
	ErrExpiredSession           = errors.New("session expired")
	ErrNoEmailVerificationToken = errors.New("email verification token not found")
	ErrNoOAuthAccount           = errors.New("oauth account not found")
	ErrNoTwoFactorSettings      = errors.New("two-factor settings not found")
	ErrProviderInUse            = errors.New("provider account is linked to another user")
	ErrProviderAlreadyConnected = errors.New("provider already connected for this user")
)

// User mirrors the users table. Nullable columns are pointers; times are
// materialized from unix second integers.
type User struct {
	ID            string
	Username      string
	DisplayName   *string
	Email         *string
	PendingEmail  *string
	EmailVerified bool
	PasswordHash  *string
	AvatarURL     *string
	Bio           *string
	CreatedAt     time.Time
}

// CreateUserParams carries the values for CreateUser. EmailVerified maps to
// the email_verified integer column; pointers leave nullable columns unset.
type CreateUserParams struct {
	Username      string
	DisplayName   *string
	Email         *string
	PendingEmail  *string
	EmailVerified bool
	PasswordHash  *string
	AvatarURL     *string
	Bio           *string
}

// Session mirrors the sessions table.
type Session struct {
	ID        string
	UserID    string
	Token     string
	ExpiresAt time.Time
	CreatedAt time.Time
}

// EmailVerificationToken mirrors the email_verification_tokens table.
type EmailVerificationToken struct {
	ID        string
	UserID    string
	TokenHash string
	Email     string
	ExpiresAt time.Time
	CreatedAt time.Time
}

// OAuthAccount mirrors the oauth_accounts table.
type OAuthAccount struct {
	ID                string
	UserID            string
	Provider          string
	ProviderAccountID string
	CreatedAt         time.Time
}

// OAuthProfile carries the denormalized profile fields OAuth providers
// expose, matching the OAuthProfile type in apps/web/src/lib/auth.ts.
type OAuthProfile struct {
	Username      string
	DisplayName   *string
	Email         *string
	EmailVerified bool
	AvatarURL     *string
}

// LinkOAuthAccountStatus is the outcome of LinkOAuthAccount.
type LinkOAuthAccountStatus string

const (
	// LinkStatusLinked means the account was created.
	LinkStatusLinked LinkOAuthAccountStatus = "linked"
	// LinkStatusAlreadyLinked means the account already exists for the user.
	LinkStatusAlreadyLinked LinkOAuthAccountStatus = "already_linked"
)

// LinkOAuthAccountResult mirrors the LinkOAuthAccountResult union in
// apps/web/src/lib/auth.ts for the successful cases.
type LinkOAuthAccountResult struct {
	UserID string
	Status LinkOAuthAccountStatus
}

// TwoFactorSettings mirrors the two_factor_settings table.
type TwoFactorSettings struct {
	UserID        string
	TotpSecret    *string
	RecoveryCodes *string
	Enabled       bool
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

// UserProfile is the aggregated profile returned by GetUserProfile,
// mirroring CurrentUserProfile in apps/web/src/lib/auth.ts.
type UserProfile struct {
	ID               string
	Username         string
	DisplayName      string
	Email            *string
	PendingEmail     *string
	EmailVerified    bool
	AvatarURL        *string
	Bio              *string
	Providers        []string
	HasPassword      bool
	TwoFactorEnabled bool
}

// Store is the auth data layer consumed by handlers. Column and constraint
// details live in schema.go; all timestamps are written to and read from
// SQLite as unix seconds.
type Store interface {
	// Users
	CreateUser(ctx context.Context, params CreateUserParams) (User, error)
	GetUserByID(ctx context.Context, userID string) (User, error)
	GetUserByLogin(ctx context.Context, login string) (User, error)
	GetUserByUsername(ctx context.Context, username string) (User, error)
	GetUserByVerifiedEmail(ctx context.Context, email string) (User, error)
	SetPassword(ctx context.Context, userID, passwordHash string) error
	SetPendingEmail(ctx context.Context, userID, email string) error
	EmailClaimedByOther(ctx context.Context, email, userID string) (bool, error)
	VerifyEmail(ctx context.Context, userID, email string) error
	SyncOAuthProfileToUser(ctx context.Context, provider, userID string, profile OAuthProfile) error
	GetUserProfile(ctx context.Context, userID string) (UserProfile, error)
	EnsureLegacySharedUser(ctx context.Context, username, password string) (*User, error)

	// Sessions
	CreateSession(ctx context.Context, userID string) (Session, error)
	GetSession(ctx context.Context, token string, now time.Time) (Session, error)
	DeleteSession(ctx context.Context, token string) error

	// Email verification tokens
	CreateEmailVerificationToken(ctx context.Context, userID, tokenHash, email string) (EmailVerificationToken, error)
	GetEmailVerificationToken(ctx context.Context, tokenHash string) (EmailVerificationToken, error)
	DeleteEmailVerificationToken(ctx context.Context, tokenHash string) error
	DeleteTokensForUser(ctx context.Context, userID string) error

	// OAuth accounts
	CreateOAuthAccount(ctx context.Context, userID, provider, providerAccountID string) (OAuthAccount, error)
	GetOAuthAccountByProvider(ctx context.Context, provider, providerAccountID string) (OAuthAccount, error)
	GetOAuthAccountForUser(ctx context.Context, userID, provider string) (OAuthAccount, error)
	ListOAuthProviders(ctx context.Context, userID string) ([]string, error)
	LinkOAuthAccount(ctx context.Context, userID, provider, providerAccountID string, profile OAuthProfile) (LinkOAuthAccountResult, error)
	FindOrCreateOAuthUser(ctx context.Context, provider, providerAccountID string, profile OAuthProfile) (User, error)

	// Two-factor settings
	GetTwoFactorSettings(ctx context.Context, userID string) (TwoFactorSettings, error)
	SetTwoFactorEnabled(ctx context.Context, userID string, enabled bool) error
}

// SQLiteStore implements Store on top of database/sql with the modernc.org
// sqlite driver (pure Go, CGO_ENABLED=0).
type SQLiteStore struct {
	db *sql.DB
}

// OpenStore connects to the SQLite database at path (a filename or a
// modernc.org/sqlite DSN). The connection pool is limited to one connection,
// mirroring the web app's single-writer better-sqlite3 access and avoiding
// SQLITE_BUSY for these small auth transactions.
func OpenStore(path string) (*SQLiteStore, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, fmt.Errorf("auth open store: %w", err)
	}
	db.SetMaxOpenConns(1)

	// The single connection keeps these pragmas in effect for every query.
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("auth enable foreign keys: %w", err)
	}
	if _, err := db.Exec("PRAGMA busy_timeout = 5000"); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("auth set busy timeout: %w", err)
	}

	return &SQLiteStore{db: db}, nil
}

// Close releases the underlying database connection.
func (s *SQLiteStore) Close() error {
	return s.db.Close()
}

// Migrate applies the latest schema (idempotent, safe on existing DBs).
func (s *SQLiteStore) Migrate(ctx context.Context) error {
	return Migrate(ctx, s.db)
}

// User queries

// constraintError marks a storage-level constraint failure (e.g. a UNIQUE
// violation). Handlers map it to HTTP 409, mirroring the legacy UNIQUE
// message check in the register route.
type constraintError struct {
	message string
}

func (e *constraintError) Error() string { return e.message }

// IsConstraintErr reports whether err is a storage constraint failure.
func IsConstraintErr(err error) bool {
	var target *constraintError
	return errors.As(err, &target)
}

// isUniqueConstraint detects SQLite's UNIQUE constraint failure message,
// which is stable across modernc.org/sqlite versions.
func isUniqueConstraint(err error) bool {
	return err != nil && strings.Contains(err.Error(), "UNIQUE constraint failed")
}

// CreateUser inserts a user with a fresh id and creation time.
func (s *SQLiteStore) CreateUser(ctx context.Context, params CreateUserParams) (User, error) {
	id, err := newUUID()
	if err != nil {
		return User{}, err
	}
	now := time.Now()

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO users (
			id, username, display_name, email, pending_email, email_verified,
			password_hash, avatar_url, bio, created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		id, params.Username, params.DisplayName, params.Email, params.PendingEmail,
		boolToInt(params.EmailVerified), params.PasswordHash, params.AvatarURL, params.Bio,
		unixSeconds(now),
	)
	if err != nil {
		if isUniqueConstraint(err) {
			return User{}, &constraintError{message: "unique constraint: " + err.Error()}
		}
		return User{}, fmt.Errorf("create user: %w", err)
	}

	return User{
		ID:            id,
		Username:      params.Username,
		DisplayName:   params.DisplayName,
		Email:         params.Email,
		PendingEmail:  params.PendingEmail,
		EmailVerified: params.EmailVerified,
		PasswordHash:  params.PasswordHash,
		AvatarURL:     params.AvatarURL,
		Bio:           params.Bio,
		CreatedAt:     now,
	}, nil
}

// GetUserByID returns a single user by primary key.
func (s *SQLiteStore) GetUserByID(ctx context.Context, userID string) (User, error) {
	return s.queryUser(ctx, `
		SELECT id, username, display_name, email, pending_email, email_verified,
			password_hash, avatar_url, bio, created_at
		FROM users WHERE id = ?`, userID)
}

// GetUserByLogin returns a user matching login by username or email, mirroring
// verifyCredentials in apps/web/src/lib/auth.ts (login trimmed, no
// case folding).
func (s *SQLiteStore) GetUserByLogin(ctx context.Context, login string) (User, error) {
	identifier := strings.TrimSpace(login)
	return s.queryUser(ctx, `
		SELECT id, username, display_name, email, pending_email, email_verified,
			password_hash, avatar_url, bio, created_at
		FROM users WHERE username = ? OR email = ? LIMIT 1`,
		identifier, identifier)
}

// GetUserByUsername returns a user by username.
func (s *SQLiteStore) GetUserByUsername(ctx context.Context, username string) (User, error) {
	return s.queryUser(ctx, `
		SELECT id, username, display_name, email, pending_email, email_verified,
			password_hash, avatar_url, bio, created_at
		FROM users WHERE username = ?`, username)
}

// GetUserByVerifiedEmail returns the user that has claimed and verified the
// given email, used to link OAuth accounts to existing accounts.
func (s *SQLiteStore) GetUserByVerifiedEmail(ctx context.Context, email string) (User, error) {
	return s.queryUser(ctx, `
		SELECT id, username, display_name, email, pending_email, email_verified,
			password_hash, avatar_url, bio, created_at
		FROM users WHERE email = ? AND email_verified = 1 LIMIT 1`, email)
}

func (s *SQLiteStore) queryUser(ctx context.Context, query string, args ...any) (User, error) {
	var user User
	var displayName, email, pendingEmail, passwordHash, avatarURL, bio sql.NullString
	var emailVerified, createdAt int64

	err := s.db.QueryRowContext(ctx, query, args...).Scan(
		&user.ID, &user.Username, &displayName, &email, &pendingEmail, &emailVerified,
		&passwordHash, &avatarURL, &bio, &createdAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return User{}, ErrNoUser
	}
	if err != nil {
		return User{}, fmt.Errorf("query user: %w", err)
	}

	user.DisplayName = nullStringPtr(displayName)
	user.Email = nullStringPtr(email)
	user.PendingEmail = nullStringPtr(pendingEmail)
	user.EmailVerified = emailVerified == 1
	user.PasswordHash = nullStringPtr(passwordHash)
	user.AvatarURL = nullStringPtr(avatarURL)
	user.Bio = nullStringPtr(bio)
	user.CreatedAt = timeFromUnixSeconds(createdAt)
	return user, nil
}

// SetPassword replaces the user's bcrypt password hash.
func (s *SQLiteStore) SetPassword(ctx context.Context, userID, passwordHash string) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE users SET password_hash = ? WHERE id = ?`, passwordHash, userID)
	if err != nil {
		return fmt.Errorf("set password: %w", err)
	}
	return nil
}

// SetPendingEmail stores the unverified email and drops any previous
// verification tokens, mirroring setPendingEmail in apps/web/src/lib/auth.ts.
func (s *SQLiteStore) SetPendingEmail(ctx context.Context, userID, email string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("set pending email: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`UPDATE users SET pending_email = ? WHERE id = ?`, email, userID); err != nil {
		return fmt.Errorf("set pending email: %w", err)
	}
	if _, err := tx.ExecContext(ctx,
		`DELETE FROM email_verification_tokens WHERE user_id = ?`, userID); err != nil {
		return fmt.Errorf("set pending email: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("set pending email: %w", err)
	}
	return nil
}

// EmailClaimedByOther reports whether another verified user owns the email.
func (s *SQLiteStore) EmailClaimedByOther(ctx context.Context, email, userID string) (bool, error) {
	var count int64
	err := s.db.QueryRowContext(ctx, `
		SELECT COUNT(*) FROM users
		WHERE email = ? AND email_verified = 1 AND id != ?`, email, userID).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("email claimed check: %w", err)
	}
	return count > 0, nil
}

// VerifyEmail claims the email for the user and clears pending verification
// state, mirroring the final steps of verifyEmailToken.
func (s *SQLiteStore) VerifyEmail(ctx context.Context, userID, email string) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return fmt.Errorf("verify email: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx, `
		UPDATE users SET email = ?, pending_email = NULL, email_verified = 1
		WHERE id = ?`, email, userID); err != nil {
		return fmt.Errorf("verify email: %w", err)
	}
	if _, err := tx.ExecContext(ctx,
		`DELETE FROM email_verification_tokens WHERE user_id = ?`, userID); err != nil {
		return fmt.Errorf("verify email: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return fmt.Errorf("verify email: %w", err)
	}
	return nil
}

// SyncOAuthProfileToUser applies OAuth profile fields to the user following
// the same rules as syncOAuthProfileToUser in apps/web/src/lib/auth.ts:
// verified emails may become the account email, github usernames may be
// adopted when free, and avatar/display name updates are provider-driven.
func (s *SQLiteStore) SyncOAuthProfileToUser(ctx context.Context, provider, userID string, profile OAuthProfile) error {
	current, err := s.GetUserByID(ctx, userID)
	if err != nil {
		return err
	}

	nextEmail := current.Email
	nextPendingEmail := current.PendingEmail
	nextEmailVerified := current.EmailVerified

	if profile.EmailVerified && profile.Email != nil {
		if current.Email == nil || *current.Email == *profile.Email ||
			(current.PendingEmail != nil && *current.PendingEmail == *profile.Email) {
			nextEmail = profile.Email
			nextPendingEmail = nil
			nextEmailVerified = true
		}
	} else if current.Email == nil && current.PendingEmail == nil && profile.Email != nil {
		nextPendingEmail = profile.Email
	}

	hasGithub := provider == "github"
	if !hasGithub {
		if _, err := s.GetOAuthAccountForUser(ctx, userID, "github"); err == nil {
			hasGithub = true
		} else if !errors.Is(err, ErrNoOAuthAccount) {
			return err
		}
	}

	canUseProviderUsername := false
	if provider == "github" {
		usernameOwner, err := s.GetUserByUsername(ctx, profile.Username)
		switch {
		case err == nil && usernameOwner.ID == userID:
			canUseProviderUsername = true
		case errors.Is(err, ErrNoUser):
			canUseProviderUsername = true
		case err != nil:
			return err
		}
	}

	nextUsername := current.Username
	if canUseProviderUsername {
		nextUsername = profile.Username
	}
	nextDisplayName := resolveOAuthDisplayName(provider, current.DisplayName, profile)
	nextAvatarURL := current.AvatarURL
	if provider == "github" || !hasGithub {
		nextAvatarURL = profile.AvatarURL
		if nextAvatarURL == nil {
			nextAvatarURL = current.AvatarURL
		}
	}

	_, err = s.db.ExecContext(ctx, `
		UPDATE users SET username = ?, display_name = ?, email = ?, pending_email = ?,
			email_verified = ?, avatar_url = ?
		WHERE id = ?`,
		nextUsername, nextDisplayName, nextEmail, nextPendingEmail,
		boolToInt(nextEmailVerified), nextAvatarURL, userID,
	)
	if err != nil {
		return fmt.Errorf("sync oauth profile: %w", err)
	}
	return nil
}

func resolveOAuthDisplayName(provider string, currentDisplayName *string, profile OAuthProfile) *string {
	if provider == "github" {
		if profile.DisplayName != nil {
			return profile.DisplayName
		}
		return &profile.Username
	}
	if currentDisplayName != nil {
		return currentDisplayName
	}
	if profile.DisplayName != nil {
		return profile.DisplayName
	}
	return &profile.Username
}

// GetUserProfile aggregates the user's profile for authenticated contexts,
// matching getCurrentUserProfile in apps/web/src/lib/auth.ts.
func (s *SQLiteStore) GetUserProfile(ctx context.Context, userID string) (UserProfile, error) {
	user, err := s.GetUserByID(ctx, userID)
	if err != nil {
		return UserProfile{}, err
	}

	providers, err := s.ListOAuthProviders(ctx, userID)
	if err != nil {
		return UserProfile{}, err
	}

	displayName := user.Username
	if user.DisplayName != nil {
		displayName = *user.DisplayName
	}

	profile := UserProfile{
		ID:               user.ID,
		Username:         user.Username,
		DisplayName:      displayName,
		Email:            user.Email,
		PendingEmail:     user.PendingEmail,
		EmailVerified:    user.EmailVerified,
		AvatarURL:        user.AvatarURL,
		Bio:              user.Bio,
		Providers:        providers,
		HasPassword:      user.PasswordHash != nil,
		TwoFactorEnabled: false,
	}

	if twoFactor, err := s.GetTwoFactorSettings(ctx, userID); err == nil {
		profile.TwoFactorEnabled = twoFactor.Enabled
	} else if !errors.Is(err, ErrNoTwoFactorSettings) {
		return UserProfile{}, err
	}

	return profile, nil
}

// EnsureLegacySharedUser bootstraps or repairs the shared account configured
// via DIFFAUDIT_SHARED_USERNAME/DIFFAUDIT_SHARED_PASSWORD, replicating
// ensureLegacySharedUser in apps/web/src/lib/auth.ts:
//   - missing username or password: no-op (nil, nil)
//   - unknown username: create the user with a fresh bcrypt hash
//   - known username whose hash does not match: overwrite the hash
//
// The returned user is nil alongside a nil error when no shared user is
// configured.
func (s *SQLiteStore) EnsureLegacySharedUser(ctx context.Context, username, password string) (*User, error) {
	username = strings.TrimSpace(username)
	if username == "" || password == "" {
		return nil, nil
	}

	existing, err := s.GetUserByUsername(ctx, username)
	if errors.Is(err, ErrNoUser) {
		passwordHash, hashErr := HashPassword(password)
		if hashErr != nil {
			return nil, hashErr
		}
		displayName := username
		user, createErr := s.CreateUser(ctx, CreateUserParams{
			Username:     username,
			DisplayName:  &displayName,
			PasswordHash: &passwordHash,
		})
		if createErr != nil {
			return nil, createErr
		}
		return &user, nil
	}
	if err != nil {
		return nil, err
	}

	if existing.PasswordHash != nil && CheckPassword(*existing.PasswordHash, password) {
		return &existing, nil
	}

	passwordHash, err := HashPassword(password)
	if err != nil {
		return nil, err
	}
	if err := s.SetPassword(ctx, existing.ID, passwordHash); err != nil {
		return nil, err
	}
	existing.PasswordHash = &passwordHash
	return &existing, nil
}

// Session queries

// CreateSession inserts a session for the user with a fresh token and a 12h
// expiry, mirroring createSession in apps/web/src/lib/auth.ts.
func (s *SQLiteStore) CreateSession(ctx context.Context, userID string) (Session, error) {
	id, err := newUUID()
	if err != nil {
		return Session{}, err
	}
	token, err := SessionToken()
	if err != nil {
		return Session{}, err
	}
	now := time.Now()
	expiresAt := now.Add(SessionMaxAge)

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO sessions (id, user_id, token, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?)`,
		id, userID, token, unixSeconds(expiresAt), unixSeconds(now),
	)
	if err != nil {
		return Session{}, fmt.Errorf("create session: %w", err)
	}

	return Session{
		ID:        id,
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}, nil
}

// GetSession returns the session for the token if it exists and is not
// expired at now. Expired sessions are deleted and reported as
// ErrExpiredSession, mirroring validateSession in apps/web/src/lib/auth.ts.
func (s *SQLiteStore) GetSession(ctx context.Context, token string, now time.Time) (Session, error) {
	var session Session
	var expiresAt, createdAt int64

	err := s.db.QueryRowContext(ctx, `
		SELECT id, user_id, token, expires_at, created_at
		FROM sessions WHERE token = ?`, token,
	).Scan(&session.ID, &session.UserID, &session.Token, &expiresAt, &createdAt)
	if errors.Is(err, sql.ErrNoRows) {
		return Session{}, ErrNoSession
	}
	if err != nil {
		return Session{}, fmt.Errorf("query session: %w", err)
	}

	session.ExpiresAt = timeFromUnixSeconds(expiresAt)
	session.CreatedAt = timeFromUnixSeconds(createdAt)

	if session.ExpiresAt.Before(now) {
		_, _ = s.db.ExecContext(ctx, `DELETE FROM sessions WHERE token = ?`, token)
		return Session{}, ErrExpiredSession
	}
	return session, nil
}

// DeleteSession removes the session with the given token.
func (s *SQLiteStore) DeleteSession(ctx context.Context, token string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM sessions WHERE token = ?`, token)
	if err != nil {
		return fmt.Errorf("delete session: %w", err)
	}
	return nil
}

// Email verification queries

// CreateEmailVerificationToken replaces any existing tokens for the user and
// inserts a new one with a 30 minute expiry, mirroring
// createEmailVerificationRequest in apps/web/src/lib/auth.ts. tokenHash is
// the sha256 hex digest of the raw token.
func (s *SQLiteStore) CreateEmailVerificationToken(ctx context.Context, userID, tokenHash, email string) (EmailVerificationToken, error) {
	id, err := newUUID()
	if err != nil {
		return EmailVerificationToken{}, err
	}
	now := time.Now()
	expiresAt := now.Add(EmailVerificationTTL)

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return EmailVerificationToken{}, fmt.Errorf("create email verification token: %w", err)
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`DELETE FROM email_verification_tokens WHERE user_id = ?`, userID); err != nil {
		return EmailVerificationToken{}, fmt.Errorf("create email verification token: %w", err)
	}
	if _, err := tx.ExecContext(ctx, `
		INSERT INTO email_verification_tokens (id, user_id, token_hash, email, expires_at, created_at)
		VALUES (?, ?, ?, ?, ?, ?)`,
		id, userID, tokenHash, email, unixSeconds(expiresAt), unixSeconds(now),
	); err != nil {
		return EmailVerificationToken{}, fmt.Errorf("create email verification token: %w", err)
	}

	if err := tx.Commit(); err != nil {
		return EmailVerificationToken{}, fmt.Errorf("create email verification token: %w", err)
	}

	return EmailVerificationToken{
		ID:        id,
		UserID:    userID,
		TokenHash: tokenHash,
		Email:     email,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}, nil
}

// GetEmailVerificationToken returns the token record by its sha256 hash.
func (s *SQLiteStore) GetEmailVerificationToken(ctx context.Context, tokenHash string) (EmailVerificationToken, error) {
	var token EmailVerificationToken
	var expiresAt, createdAt int64

	err := s.db.QueryRowContext(ctx, `
		SELECT id, user_id, token_hash, email, expires_at, created_at
		FROM email_verification_tokens WHERE token_hash = ?`, tokenHash,
	).Scan(&token.ID, &token.UserID, &token.TokenHash, &token.Email, &expiresAt, &createdAt)
	if errors.Is(err, sql.ErrNoRows) {
		return EmailVerificationToken{}, ErrNoEmailVerificationToken
	}
	if err != nil {
		return EmailVerificationToken{}, fmt.Errorf("query email verification token: %w", err)
	}

	token.ExpiresAt = timeFromUnixSeconds(expiresAt)
	token.CreatedAt = timeFromUnixSeconds(createdAt)
	return token, nil
}

// DeleteEmailVerificationToken removes a single token record by hash.
func (s *SQLiteStore) DeleteEmailVerificationToken(ctx context.Context, tokenHash string) error {
	_, err := s.db.ExecContext(ctx,
		`DELETE FROM email_verification_tokens WHERE token_hash = ?`, tokenHash)
	if err != nil {
		return fmt.Errorf("delete email verification token: %w", err)
	}
	return nil
}

// DeleteTokensForUser removes all verification tokens for the user.
func (s *SQLiteStore) DeleteTokensForUser(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(ctx,
		`DELETE FROM email_verification_tokens WHERE user_id = ?`, userID)
	if err != nil {
		return fmt.Errorf("delete tokens for user: %w", err)
	}
	return nil
}

// OAuth queries

// CreateOAuthAccount inserts an oauth account link for the user.
func (s *SQLiteStore) CreateOAuthAccount(ctx context.Context, userID, provider, providerAccountID string) (OAuthAccount, error) {
	id, err := newUUID()
	if err != nil {
		return OAuthAccount{}, err
	}
	now := time.Now()

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO oauth_accounts (id, user_id, provider, provider_account_id, created_at)
		VALUES (?, ?, ?, ?, ?)`,
		id, userID, provider, providerAccountID, unixSeconds(now),
	)
	if err != nil {
		return OAuthAccount{}, fmt.Errorf("create oauth account: %w", err)
	}

	return OAuthAccount{
		ID:                id,
		UserID:            userID,
		Provider:          provider,
		ProviderAccountID: providerAccountID,
		CreatedAt:         now,
	}, nil
}

// GetOAuthAccountByProvider returns the account linked to the provider +
// providerAccountId pair.
func (s *SQLiteStore) GetOAuthAccountByProvider(ctx context.Context, provider, providerAccountID string) (OAuthAccount, error) {
	return s.queryOAuthAccount(ctx, `
		SELECT id, user_id, provider, provider_account_id, created_at
		FROM oauth_accounts WHERE provider = ? AND provider_account_id = ?`,
		provider, providerAccountID)
}

// GetOAuthAccountForUser returns the account the user has for the provider.
func (s *SQLiteStore) GetOAuthAccountForUser(ctx context.Context, userID, provider string) (OAuthAccount, error) {
	return s.queryOAuthAccount(ctx, `
		SELECT id, user_id, provider, provider_account_id, created_at
		FROM oauth_accounts WHERE user_id = ? AND provider = ?`,
		userID, provider)
}

func (s *SQLiteStore) queryOAuthAccount(ctx context.Context, query string, args ...any) (OAuthAccount, error) {
	var account OAuthAccount
	var createdAt int64

	err := s.db.QueryRowContext(ctx, query, args...).Scan(
		&account.ID, &account.UserID, &account.Provider, &account.ProviderAccountID, &createdAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return OAuthAccount{}, ErrNoOAuthAccount
	}
	if err != nil {
		return OAuthAccount{}, fmt.Errorf("query oauth account: %w", err)
	}

	account.CreatedAt = timeFromUnixSeconds(createdAt)
	return account, nil
}

// ListOAuthProviders returns the user's provider names sorted alphabetically,
// matching getCurrentUserProfile in apps/web/src/lib/auth.ts.
func (s *SQLiteStore) ListOAuthProviders(ctx context.Context, userID string) ([]string, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT provider FROM oauth_accounts WHERE user_id = ? ORDER BY provider`, userID)
	if err != nil {
		return nil, fmt.Errorf("list oauth providers: %w", err)
	}
	defer rows.Close()

	providers := []string{}
	for rows.Next() {
		var provider string
		if err := rows.Scan(&provider); err != nil {
			return nil, fmt.Errorf("list oauth providers: %w", err)
		}
		providers = append(providers, provider)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("list oauth providers: %w", err)
	}
	return providers, nil
}

// LinkOAuthAccount links a provider account to the user, mirroring
// linkOAuthAccount in apps/web/src/lib/auth.ts. Conflicts surface as
// ErrProviderInUse (the account belongs to another user) or
// ErrProviderAlreadyConnected (the user already has this provider).
func (s *SQLiteStore) LinkOAuthAccount(ctx context.Context, userID, provider, providerAccountID string, profile OAuthProfile) (LinkOAuthAccountResult, error) {
	existing, err := s.GetOAuthAccountByProvider(ctx, provider, providerAccountID)
	if err == nil {
		if existing.UserID != userID {
			return LinkOAuthAccountResult{}, ErrProviderInUse
		}
		if err := s.SyncOAuthProfileToUser(ctx, provider, userID, profile); err != nil {
			return LinkOAuthAccountResult{}, err
		}
		return LinkOAuthAccountResult{UserID: userID, Status: LinkStatusAlreadyLinked}, nil
	}
	if !errors.Is(err, ErrNoOAuthAccount) {
		return LinkOAuthAccountResult{}, err
	}

	if _, err := s.GetOAuthAccountForUser(ctx, userID, provider); err == nil {
		return LinkOAuthAccountResult{}, ErrProviderAlreadyConnected
	} else if !errors.Is(err, ErrNoOAuthAccount) {
		return LinkOAuthAccountResult{}, err
	}

	if _, err := s.CreateOAuthAccount(ctx, userID, provider, providerAccountID); err != nil {
		return LinkOAuthAccountResult{}, err
	}

	if err := s.SyncOAuthProfileToUser(ctx, provider, userID, profile); err != nil {
		return LinkOAuthAccountResult{}, err
	}
	return LinkOAuthAccountResult{UserID: userID, Status: LinkStatusLinked}, nil
}

// FindOrCreateOAuthUser resolves the OAuth identity to a user, mirroring
// findOrCreateOAuthUser in apps/web/src/lib/auth.ts: reuse an existing
// account link, then match by verified email, then create a fresh user with
// a collision-proof username.
func (s *SQLiteStore) FindOrCreateOAuthUser(ctx context.Context, provider, providerAccountID string, profile OAuthProfile) (User, error) {
	existing, err := s.GetOAuthAccountByProvider(ctx, provider, providerAccountID)
	if err == nil {
		if err := s.SyncOAuthProfileToUser(ctx, provider, existing.UserID, profile); err != nil {
			return User{}, err
		}
		return s.GetUserByID(ctx, existing.UserID)
	}
	if !errors.Is(err, ErrNoOAuthAccount) {
		return User{}, err
	}

	if profile.Email != nil && profile.EmailVerified {
		if matched, err := s.GetUserByVerifiedEmail(ctx, *profile.Email); err == nil {
			if _, err := s.CreateOAuthAccount(ctx, matched.ID, provider, providerAccountID); err != nil {
				return User{}, err
			}
			if err := s.SyncOAuthProfileToUser(ctx, provider, matched.ID, profile); err != nil {
				return User{}, err
			}
			return s.GetUserByID(ctx, matched.ID)
		} else if !errors.Is(err, ErrNoUser) {
			return User{}, err
		}
	}

	username, err := s.availableOAuthUsername(ctx, profile.Username)
	if err != nil {
		return User{}, err
	}

	displayName := username
	if profile.DisplayName != nil {
		displayName = *profile.DisplayName
	}
	var email, pendingEmail *string
	emailVerified := profile.EmailVerified
	if profile.Email != nil && profile.EmailVerified {
		email = profile.Email
	} else {
		pendingEmail = profile.Email
	}

	user, err := s.CreateUser(ctx, CreateUserParams{
		Username:      username,
		DisplayName:   &displayName,
		Email:         email,
		PendingEmail:  pendingEmail,
		EmailVerified: emailVerified,
		AvatarURL:     profile.AvatarURL,
	})
	if err != nil {
		return User{}, err
	}

	if _, err := s.CreateOAuthAccount(ctx, user.ID, provider, providerAccountID); err != nil {
		return User{}, err
	}
	return user, nil
}

// availableOAuthUsername returns the profile username or a suffixed variant
// when it is taken, matching the randomBytes(3).toString("hex") suffix in
// apps/web/src/lib/auth.ts.
func (s *SQLiteStore) availableOAuthUsername(ctx context.Context, username string) (string, error) {
	_, err := s.GetUserByUsername(ctx, username)
	if err == nil {
		return s.withSuffixedUsername(ctx, username)
	}
	if !errors.Is(err, ErrNoUser) {
		return "", err
	}
	return username, nil
}

func (s *SQLiteStore) withSuffixedUsername(ctx context.Context, username string) (string, error) {
	suffixBytes := make([]byte, 3)
	if _, err := rand.Read(suffixBytes); err != nil {
		return "", fmt.Errorf("username suffix: %w", err)
	}
	suffix := fmt.Sprintf("%x", suffixBytes)
	candidate := username + "-" + suffix
	if _, err := s.GetUserByUsername(ctx, candidate); err == nil {
		return s.withSuffixedUsername(ctx, username)
	} else if !errors.Is(err, ErrNoUser) {
		return "", err
	}
	return candidate, nil
}

// Two-factor queries

// GetTwoFactorSettings returns the user's two-factor settings row.
func (s *SQLiteStore) GetTwoFactorSettings(ctx context.Context, userID string) (TwoFactorSettings, error) {
	var settings TwoFactorSettings
	var totpSecret, recoveryCodes sql.NullString
	var enabled, createdAt, updatedAt int64

	err := s.db.QueryRowContext(ctx, `
		SELECT user_id, totp_secret, recovery_codes, enabled, created_at, updated_at
		FROM two_factor_settings WHERE user_id = ?`, userID,
	).Scan(&settings.UserID, &totpSecret, &recoveryCodes, &enabled, &createdAt, &updatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return TwoFactorSettings{}, ErrNoTwoFactorSettings
	}
	if err != nil {
		return TwoFactorSettings{}, fmt.Errorf("query two-factor settings: %w", err)
	}

	settings.TotpSecret = nullStringPtr(totpSecret)
	settings.RecoveryCodes = nullStringPtr(recoveryCodes)
	settings.Enabled = enabled == 1
	settings.CreatedAt = timeFromUnixSeconds(createdAt)
	settings.UpdatedAt = timeFromUnixSeconds(updatedAt)
	return settings, nil
}

// SetTwoFactorEnabled toggles the user's two-factor flag, creating the
// settings row on first use, mirroring setTwoFactorEnabled in
// apps/web/src/lib/auth.ts.
func (s *SQLiteStore) SetTwoFactorEnabled(ctx context.Context, userID string, enabled bool) error {
	now := time.Now()

	result, err := s.db.ExecContext(ctx, `
		UPDATE two_factor_settings SET enabled = ?, updated_at = ?
		WHERE user_id = ?`, boolToInt(enabled), unixSeconds(now), userID)
	if err != nil {
		return fmt.Errorf("set two-factor enabled: %w", err)
	}

	affected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("set two-factor enabled: %w", err)
	}
	if affected > 0 {
		return nil
	}

	_, err = s.db.ExecContext(ctx, `
		INSERT INTO two_factor_settings (user_id, totp_secret, recovery_codes, enabled, created_at, updated_at)
		VALUES (?, NULL, NULL, ?, ?, ?)`,
		userID, boolToInt(enabled), unixSeconds(now), unixSeconds(now),
	)
	if err != nil {
		return fmt.Errorf("set two-factor enabled: %w", err)
	}
	return nil
}

// Helpers

func unixSeconds(t time.Time) int64 {
	return t.Unix()
}

func timeFromUnixSeconds(value int64) time.Time {
	return time.Unix(value, 0)
}

func boolToInt(value bool) int64 {
	if value {
		return 1
	}
	return 0
}

func nullStringPtr(value sql.NullString) *string {
	if !value.Valid {
		return nil
	}
	converted := value.String
	return &converted
}

// newUUID returns a random RFC 4122 version 4 UUID, the equivalent of
// crypto.randomUUID() used for record ids in apps/web/src/lib/auth.ts.
func newUUID() (string, error) {
	var bytes [16]byte
	if _, err := rand.Read(bytes[:]); err != nil {
		return "", fmt.Errorf("uuid: %w", err)
	}
	bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
	bytes[8] = (bytes[8] & 0x3f) | 0x80 // RFC 4122 variant
	return fmt.Sprintf("%x-%x-%x-%x-%x",
		bytes[0:4], bytes[4:6], bytes[6:8], bytes[8:10], bytes[10:16]), nil
}

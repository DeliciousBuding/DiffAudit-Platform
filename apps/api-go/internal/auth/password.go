package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// Session lifetime constants mirror apps/web/src/lib/auth.ts
// (SESSION_MAX_AGE_MS = 12h) and SESSION_COOKIE_OPTIONS.
const (
	// SESSION_MAX_AGE_MS is the session lifetime in milliseconds, kept for
	// parity with the TypeScript constant of the same name.
	SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000
	// SessionMaxAge is the idiomatic time.Duration form of SESSION_MAX_AGE_MS.
	SessionMaxAge = 12 * time.Hour
	// EmailVerificationTTL is the lifetime of email verification requests
	// (30 minutes in apps/web/src/lib/auth.ts).
	EmailVerificationTTL = 30 * time.Minute
)

// ErrInvalidCredentials is returned by VerifyCredentials for unknown logins
// or wrong passwords, without distinguishing the two.
var ErrInvalidCredentials = errors.New("invalid credentials")

// HashPassword hashes a password with bcrypt at the default cost (10), the
// same cost the web app uses with bcryptjs.
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("bcrypt hash: %w", err)
	}
	return string(hash), nil
}

// CheckPassword reports whether the password matches the bcrypt hash.
func CheckPassword(hash, password string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password)) == nil
}

// VerifyCredentials looks up a user by login (username or email) and verifies
// the password. It mirrors verifyCredentials in apps/web/src/lib/auth.ts:
// the login is trimmed, and both unknown users and wrong passwords yield
// ErrInvalidCredentials.
func VerifyCredentials(ctx context.Context, store Store, login, password string) (User, error) {
	user, err := store.GetUserByLogin(ctx, strings.TrimSpace(login))
	if err != nil {
		if errors.Is(err, ErrNoUser) {
			return User{}, ErrInvalidCredentials
		}
		return User{}, err
	}
	if user.PasswordHash == nil || !CheckPassword(*user.PasswordHash, password) {
		return User{}, ErrInvalidCredentials
	}
	return user, nil
}

// SessionToken generates an opaque session token: 32 random bytes encoded
// with unpadded base64url, matching crypto.randomBytes(32).toString("base64url")
// in apps/web/src/lib/auth.ts.
func SessionToken() (string, error) {
	randomBytes := make([]byte, 32)
	if _, err := rand.Read(randomBytes); err != nil {
		return "", fmt.Errorf("session token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(randomBytes), nil
}

// HashVerificationToken returns the lowercase sha256 hex digest of a
// verification token, as stored in email_verification_tokens.token_hash
// (hashVerificationToken in apps/web/src/lib/auth.ts).
func HashVerificationToken(token string) string {
	digest := sha256.Sum256([]byte(token))
	return hex.EncodeToString(digest[:])
}

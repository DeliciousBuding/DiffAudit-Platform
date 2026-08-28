// Package auth provides the Go data layer backing DiffAudit authentication:
// a SQLite schema compatible with the web app's drizzle schema, a store for
// users/sessions/oauth/verification records, password and token primitives,
// and request middleware for session checks.
package auth

import (
	"context"
	"database/sql"
	"fmt"
)

// Column names and constraints mirror apps/web/src/lib/db/schema.ts and the
// CREATE TABLE statements in apps/web/src/lib/db/index.ts (the runtime source
// of truth for existing databases). Timestamp columns are INTEGERs holding
// unix epoch seconds: the pinned drizzle-orm 0.45.2 serializes integer columns
// with mode "timestamp" as Math.floor(ms/1000).

const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  email TEXT UNIQUE,
  pending_email TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  password_hash TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at INTEGER NOT NULL
);`

const createSessionsTable = `
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);`

const createOAuthAccountsTable = `
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(provider, provider_account_id),
  UNIQUE(user_id, provider)
);`

const createEmailVerificationTokensTable = `
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  token_hash TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);`

const createPasskeysTable = `
CREATE TABLE IF NOT EXISTS passkeys (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL,
  transports TEXT,
  device_type TEXT,
  backed_up INTEGER NOT NULL DEFAULT 0,
  name TEXT,
  created_at INTEGER NOT NULL,
  last_used_at INTEGER
);`

const createTwoFactorSettingsTable = `
CREATE TABLE IF NOT EXISTS two_factor_settings (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  totp_secret TEXT,
  recovery_codes TEXT,
  enabled INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);`

// Migrate creates the auth tables when they do not exist yet. It is safe to
// run repeatedly; existing databases keep their current structure just like
// the web app's INIT_SQL bootstrap.
func Migrate(ctx context.Context, db *sql.DB) error {
	statements := []string{
		createUsersTable,
		createSessionsTable,
		createOAuthAccountsTable,
		createEmailVerificationTokensTable,
		createPasskeysTable,
		createTwoFactorSettingsTable,
	}
	for _, statement := range statements {
		if _, err := db.ExecContext(ctx, statement); err != nil {
			return fmt.Errorf("auth schema migrate: %w", err)
		}
	}
	return nil
}

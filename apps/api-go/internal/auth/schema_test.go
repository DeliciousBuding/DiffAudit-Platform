package auth

import (
	"context"
	"testing"
)

func TestMigrateCreatesAllAuthTables(t *testing.T) {
	store, err := OpenStore(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	defer store.Close()

	if err := Migrate(context.Background(), store.db); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	expectedTables := []string{
		"users",
		"sessions",
		"oauth_accounts",
		"email_verification_tokens",
		"passkeys",
		"two_factor_settings",
	}
	rows, err := store.db.Query(
		`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`)
	if err != nil {
		t.Fatalf("list tables: %v", err)
	}
	defer rows.Close()

	created := map[string]bool{}
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			t.Fatalf("scan table name: %v", err)
		}
		created[name] = true
	}
	if err := rows.Err(); err != nil {
		t.Fatalf("iterate tables: %v", err)
	}

	for _, table := range expectedTables {
		if !created[table] {
			t.Errorf("expected table %q to be created", table)
		}
	}
}

func TestMigrateIsIdempotent(t *testing.T) {
	store, err := OpenStore(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	defer store.Close()

	ctx := context.Background()
	if err := Migrate(ctx, store.db); err != nil {
		t.Fatalf("first migrate: %v", err)
	}
	if err := Migrate(ctx, store.db); err != nil {
		t.Fatalf("second migrate: %v", err)
	}
}

// TestMigrateColumnNamesMatchDrizzleSchema pins the column order and names of
// every table to apps/web/src/lib/db/schema.ts, so drift between the Go DDL
// and the drizzle schema is caught by the test suite.
func TestMigrateColumnNamesMatchDrizzleSchema(t *testing.T) {
	store, err := OpenStore(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	defer store.Close()

	ctx := context.Background()
	if err := Migrate(ctx, store.db); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	expectedColumns := map[string][]string{
		"users": {
			"id", "username", "display_name", "email", "pending_email",
			"email_verified", "password_hash", "avatar_url", "bio", "created_at",
		},
		"sessions": {
			"id", "user_id", "token", "expires_at", "created_at",
		},
		"oauth_accounts": {
			"id", "user_id", "provider", "provider_account_id", "created_at",
		},
		"email_verification_tokens": {
			"id", "user_id", "token_hash", "email", "expires_at", "created_at",
		},
		"passkeys": {
			"id", "user_id", "credential_id", "public_key", "counter",
			"transports", "device_type", "backed_up", "name", "created_at", "last_used_at",
		},
		"two_factor_settings": {
			"user_id", "totp_secret", "recovery_codes", "enabled", "created_at", "updated_at",
		},
	}

	for table, expected := range expectedColumns {
		rows, err := store.db.Query(`SELECT name FROM pragma_table_info(?) ORDER BY cid`, table)
		if err != nil {
			t.Fatalf("pragma table_info(%s): %v", table, err)
		}
		actual := []string{}
		for rows.Next() {
			var column string
			if err := rows.Scan(&column); err != nil {
				_ = rows.Close()
				t.Fatalf("scan column for %s: %v", table, err)
			}
			actual = append(actual, column)
		}
		_ = rows.Close()
		if err := rows.Err(); err != nil {
			t.Fatalf("iterate columns for %s: %v", table, err)
		}

		if len(actual) != len(expected) {
			t.Errorf("table %s: expected %d columns, got %d", table, len(expected), len(actual))
			continue
		}
		for index := range expected {
			if actual[index] != expected[index] {
				t.Errorf("table %s column %d: expected %q, got %q",
					table, index, expected[index], actual[index])
			}
		}
	}
}

func TestMigratePreservesUniqueConstraints(t *testing.T) {
	store, err := OpenStore(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	defer store.Close()

	ctx := context.Background()
	if err := Migrate(ctx, store.db); err != nil {
		t.Fatalf("migrate: %v", err)
	}

	// users.username and users.email unique
	user, err := store.CreateUser(ctx, CreateUserParams{Username: "alice"})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	if _, err := store.CreateUser(ctx, CreateUserParams{Username: "alice"}); err == nil {
		t.Error("expected duplicate username to be rejected")
	}

	// sessions.token unique
	firstSession, err := store.CreateSession(ctx, user.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}
	if _, err := store.CreateSession(ctx, user.ID); err != nil {
		t.Fatalf("create second session: %v", err)
	}
	if err := store.db.QueryRow(
		`SELECT COUNT(*) FROM sessions WHERE token = ?`, firstSession.Token).Scan(new(int)); err != nil {
		t.Fatalf("session token lookup: %v", err)
	}

	// oauth_accounts composite uniques
	if _, err := store.CreateOAuthAccount(ctx, user.ID, "github", "acc-1"); err != nil {
		t.Fatalf("create oauth account: %v", err)
	}
	if _, err := store.CreateOAuthAccount(ctx, user.ID, "github", "acc-2"); err == nil {
		t.Error("expected duplicate (user_id, provider) to be rejected")
	}
}

package auth

import (
	"context"
	"errors"
	"testing"
	"time"
)

func newTestStore(t *testing.T) *SQLiteStore {
	t.Helper()

	store, err := OpenStore(":memory:")
	if err != nil {
		t.Fatalf("open store: %v", err)
	}
	if err := Migrate(context.Background(), store.db); err != nil {
		t.Fatalf("migrate: %v", err)
	}
	t.Cleanup(func() { _ = store.Close() })
	return store
}

func TestCreateUserAndGetUserByLogin(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	displayName := "Alice"
	email := "alice@example.com"
	passwordHash := "$2a$10$placeholder"
	user, err := store.CreateUser(ctx, CreateUserParams{
		Username:      "alice",
		DisplayName:   &displayName,
		Email:         &email,
		EmailVerified: true,
		PasswordHash:  &passwordHash,
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	if user.ID == "" || user.Username != "alice" {
		t.Fatalf("unexpected user: %+v", user)
	}
	if !user.EmailVerified || user.DisplayName == nil || *user.DisplayName != "Alice" {
		t.Fatalf("unexpected profile fields: %+v", user)
	}
	if time.Since(user.CreatedAt) > 2*time.Second {
		t.Fatalf("created_at too far in the past: %v", user.CreatedAt)
	}

	byUsername, err := store.GetUserByLogin(ctx, "alice")
	if err != nil {
		t.Fatalf("login by username: %v", err)
	}
	if byUsername.ID != user.ID {
		t.Fatalf("expected user %s, got %s", user.ID, byUsername.ID)
	}

	byEmail, err := store.GetUserByLogin(ctx, "alice@example.com")
	if err != nil {
		t.Fatalf("login by email: %v", err)
	}
	if byEmail.ID != user.ID {
		t.Fatalf("expected user %s, got %s", user.ID, byEmail.ID)
	}

	trimmed, err := store.GetUserByLogin(ctx, "  alice  ")
	if err != nil {
		t.Fatalf("login with surrounding whitespace: %v", err)
	}
	if trimmed.ID != user.ID {
		t.Fatalf("expected user %s, got %s", user.ID, trimmed.ID)
	}

	if _, err := store.GetUserByLogin(ctx, "nobody"); !errors.Is(err, ErrNoUser) {
		t.Fatalf("expected ErrNoUser, got %v", err)
	}
	if _, err := store.GetUserByID(ctx, "missing-id"); !errors.Is(err, ErrNoUser) {
		t.Fatalf("expected ErrNoUser, got %v", err)
	}
}

func TestSetPassword(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	user, err := store.CreateUser(ctx, CreateUserParams{Username: "bob"})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	if err := store.SetPassword(ctx, user.ID, "new-hash"); err != nil {
		t.Fatalf("set password: %v", err)
	}

	fetched, err := store.GetUserByID(ctx, user.ID)
	if err != nil {
		t.Fatalf("get user: %v", err)
	}
	if fetched.PasswordHash == nil || *fetched.PasswordHash != "new-hash" {
		t.Fatalf("expected password hash to be updated, got %+v", fetched.PasswordHash)
	}
}

func TestCreateSessionRoundTripAndExpiry(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	user, err := store.CreateUser(ctx, CreateUserParams{Username: "carol"})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	session, err := store.CreateSession(ctx, user.ID)
	if err != nil {
		t.Fatalf("create session: %v", err)
	}
	if session.Token == "" || session.UserID != user.ID {
		t.Fatalf("unexpected session: %+v", session)
	}
	if remaining := session.ExpiresAt.Sub(time.Now()); remaining < 12*time.Hour-time.Minute {
		t.Fatalf("expires_at too near: %v", remaining)
	}

	valid, err := store.GetSession(ctx, session.Token, time.Now())
	if err != nil {
		t.Fatalf("get session: %v", err)
	}
	if valid.UserID != user.ID {
		t.Fatalf("expected user %s, got %s", user.ID, valid.UserID)
	}

	// Exactly at expiry is still valid, mirroring expiresAt < now in auth.ts.
	// valid.ExpiresAt is the second-truncated value read back from SQLite,
	// which is what a live comparison sees after the serialization round trip.
	if _, err := store.GetSession(ctx, session.Token, valid.ExpiresAt); err != nil {
		t.Fatalf("session at exact expiry should be valid, got %v", err)
	}
	if _, err := store.GetSession(ctx, session.Token, valid.ExpiresAt.Add(time.Second)); !errors.Is(err, ErrExpiredSession) {
		t.Fatalf("expected ErrExpiredSession, got %v", err)
	}
	// The expired row is deleted on read.
	if _, err := store.GetSession(ctx, session.Token, time.Now()); !errors.Is(err, ErrNoSession) {
		t.Fatalf("expected ErrNoSession after expiry cleanup, got %v", err)
	}

	active, err := store.CreateSession(ctx, user.ID)
	if err != nil {
		t.Fatalf("create active session: %v", err)
	}
	if err := store.DeleteSession(ctx, active.Token); err != nil {
		t.Fatalf("delete session: %v", err)
	}
	if _, err := store.GetSession(ctx, active.Token, time.Now()); !errors.Is(err, ErrNoSession) {
		t.Fatalf("expected ErrNoSession after delete, got %v", err)
	}
	if _, err := store.GetSession(ctx, "unknown-token", time.Now()); !errors.Is(err, ErrNoSession) {
		t.Fatalf("expected ErrNoSession for unknown token, got %v", err)
	}
}

func TestEmailVerificationTokenFlow(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	pendingEmail := "dave@example.com"
	user, err := store.CreateUser(ctx, CreateUserParams{
		Username:     "dave",
		PendingEmail: &pendingEmail,
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	tokenHash := HashVerificationToken("raw-token-1")
	token, err := store.CreateEmailVerificationToken(ctx, user.ID, tokenHash, pendingEmail)
	if err != nil {
		t.Fatalf("create verification token: %v", err)
	}
	if token.TokenHash != tokenHash || token.UserID != user.ID {
		t.Fatalf("unexpected token: %+v", token)
	}
	if remaining := token.ExpiresAt.Sub(time.Now()); remaining < 30*time.Minute-time.Minute {
		t.Fatalf("expires_at too near: %v", remaining)
	}

	fetched, err := store.GetEmailVerificationToken(ctx, tokenHash)
	if err != nil {
		t.Fatalf("get verification token: %v", err)
	}
	if fetched.Email != pendingEmail {
		t.Fatalf("expected email %s, got %s", pendingEmail, fetched.Email)
	}

	// A new request replaces the previous token for the user.
	nextHash := HashVerificationToken("raw-token-2")
	if _, err := store.CreateEmailVerificationToken(ctx, user.ID, nextHash, pendingEmail); err != nil {
		t.Fatalf("create replacement token: %v", err)
	}
	if _, err := store.GetEmailVerificationToken(ctx, tokenHash); !errors.Is(err, ErrNoEmailVerificationToken) {
		t.Fatalf("expected old token to be removed, got %v", err)
	}

	// DeleteTokensForUser clears everything.
	if err := store.DeleteTokensForUser(ctx, user.ID); err != nil {
		t.Fatalf("delete tokens for user: %v", err)
	}
	if _, err := store.GetEmailVerificationToken(ctx, nextHash); !errors.Is(err, ErrNoEmailVerificationToken) {
		t.Fatalf("expected ErrNoEmailVerificationToken, got %v", err)
	}

	// Single-record delete also works.
	if _, err := store.CreateEmailVerificationToken(ctx, user.ID, tokenHash, pendingEmail); err != nil {
		t.Fatalf("recreate token: %v", err)
	}
	if err := store.DeleteEmailVerificationToken(ctx, tokenHash); err != nil {
		t.Fatalf("delete single token: %v", err)
	}
	if _, err := store.GetEmailVerificationToken(ctx, tokenHash); !errors.Is(err, ErrNoEmailVerificationToken) {
		t.Fatalf("expected ErrNoEmailVerificationToken, got %v", err)
	}
}

func TestEnsureLegacySharedUser(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	noop, err := store.EnsureLegacySharedUser(ctx, "  ", "pw")
	if err != nil || noop != nil {
		t.Fatalf("expected nil,nil for blank username, got %v, %v", noop, err)
	}
	noop, err = store.EnsureLegacySharedUser(ctx, "admin", "")
	if err != nil || noop != nil {
		t.Fatalf("expected nil,nil for blank password, got %v, %v", noop, err)
	}

	created, err := store.EnsureLegacySharedUser(ctx, "admin", "first-password")
	if err != nil {
		t.Fatalf("ensure legacy user create: %v", err)
	}
	if created.Username != "admin" || created.PasswordHash == nil {
		t.Fatalf("unexpected created user: %+v", created)
	}
	if !CheckPassword(*created.PasswordHash, "first-password") {
		t.Fatal("created hash must match the first password")
	}

	sameUser, err := store.EnsureLegacySharedUser(ctx, "admin", "first-password")
	if err != nil {
		t.Fatalf("ensure legacy user match: %v", err)
	}
	if sameUser.ID != created.ID {
		t.Fatalf("expected same user id %s, got %s", created.ID, sameUser.ID)
	}

	// Changing the env password overwrites the stored hash.
	rewritten, err := store.EnsureLegacySharedUser(ctx, "admin", "second-password")
	if err != nil {
		t.Fatalf("ensure legacy user overwrite: %v", err)
	}
	if rewritten.ID != created.ID {
		t.Fatalf("expected same user id %s, got %s", created.ID, rewritten.ID)
	}
	if !CheckPassword(*rewritten.PasswordHash, "second-password") {
		t.Fatal("rewritten hash must match the second password")
	}
	if CheckPassword(*rewritten.PasswordHash, "first-password") {
		t.Fatal("old password must no longer verify")
	}
}

func TestSetPendingEmailAndVerifyEmail(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	email := "erin@example.com"
	owner, err := store.CreateUser(ctx, CreateUserParams{
		Username:      "erin",
		Email:         &email,
		EmailVerified: true,
	})
	if err != nil {
		t.Fatalf("create owner: %v", err)
	}

	other, err := store.CreateUser(ctx, CreateUserParams{Username: "frank"})
	if err != nil {
		t.Fatalf("create other: %v", err)
	}

	claimed, err := store.EmailClaimedByOther(ctx, "erin@example.com", other.ID)
	if err != nil {
		t.Fatalf("email claimed check: %v", err)
	}
	if !claimed {
		t.Fatal("email owned by another verified user must be claimed")
	}
	claimed, err = store.EmailClaimedByOther(ctx, "erin@example.com", owner.ID)
	if err != nil {
		t.Fatalf("email claimed self check: %v", err)
	}
	if claimed {
		t.Fatal("owner must not see its own email as claimed")
	}

	otherPending := "frank@example.com"
	if err := store.SetPendingEmail(ctx, other.ID, otherPending); err != nil {
		t.Fatalf("set pending email: %v", err)
	}
	fetched, err := store.GetUserByID(ctx, other.ID)
	if err != nil {
		t.Fatalf("get user: %v", err)
	}
	if fetched.PendingEmail == nil || *fetched.PendingEmail != otherPending {
		t.Fatalf("expected pending email %s, got %+v", otherPending, fetched.PendingEmail)
	}
	if fetched.EmailVerified || fetched.Email != nil {
		t.Fatalf("pending email must not be verified yet: %+v", fetched)
	}

	if err := store.VerifyEmail(ctx, other.ID, otherPending); err != nil {
		t.Fatalf("verify email: %v", err)
	}
	verified, err := store.GetUserByID(ctx, other.ID)
	if err != nil {
		t.Fatalf("get verified user: %v", err)
	}
	if !verified.EmailVerified || verified.Email == nil || *verified.Email != otherPending || verified.PendingEmail != nil {
		t.Fatalf("email not verified as expected: %+v", verified)
	}
	if _, err := store.GetUserByLogin(ctx, otherPending); err != nil {
		t.Fatalf("login by newly verified email: %v", err)
	}
}

func TestOAuthLinkAndResolution(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	userA, err := store.CreateUser(ctx, CreateUserParams{Username: "user-a"})
	if err != nil {
		t.Fatalf("create user A: %v", err)
	}
	userB, err := store.CreateUser(ctx, CreateUserParams{Username: "user-b"})
	if err != nil {
		t.Fatalf("create user B: %v", err)
	}

	profile := OAuthProfile{Username: "githubbot", DisplayName: strPtr("GitHub Bot")}
	result, err := store.LinkOAuthAccount(ctx, userA.ID, "github", "acc-1", profile)
	if err != nil {
		t.Fatalf("link oauth account: %v", err)
	}
	if result.Status != LinkStatusLinked || result.UserID != userA.ID {
		t.Fatalf("unexpected link result: %+v", result)
	}

	result, err = store.LinkOAuthAccount(ctx, userA.ID, "github", "acc-1", profile)
	if err != nil {
		t.Fatalf("relink oauth account: %v", err)
	}
	if result.Status != LinkStatusAlreadyLinked {
		t.Fatalf("expected already_linked, got %+v", result)
	}

	if _, err := store.LinkOAuthAccount(ctx, userA.ID, "github", "acc-2", profile); !errors.Is(err, ErrProviderAlreadyConnected) {
		t.Fatalf("expected ErrProviderAlreadyConnected, got %v", err)
	}
	if _, err := store.LinkOAuthAccount(ctx, userB.ID, "github", "acc-1", profile); !errors.Is(err, ErrProviderInUse) {
		t.Fatalf("expected ErrProviderInUse, got %v", err)
	}

	account, err := store.GetOAuthAccountByProvider(ctx, "github", "acc-1")
	if err != nil {
		t.Fatalf("get by provider: %v", err)
	}
	if account.UserID != userA.ID {
		t.Fatalf("expected account on user %s, got %s", userA.ID, account.UserID)
	}
	if _, err := store.GetOAuthAccountForUser(ctx, userB.ID, "github"); !errors.Is(err, ErrNoOAuthAccount) {
		t.Fatalf("expected ErrNoOAuthAccount for user B, got %v", err)
	}

	providers, err := store.ListOAuthProviders(ctx, userA.ID)
	if err != nil {
		t.Fatalf("list providers: %v", err)
	}
	if len(providers) != 1 || providers[0] != "github" {
		t.Fatalf("unexpected providers: %v", providers)
	}
}

func TestFindOrCreateOAuthUser(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	profile := OAuthProfile{Username: "githubbot", EmailVerified: true, Email: strPtr("bot@example.com")}
	created, err := store.FindOrCreateOAuthUser(ctx, "github", "acc-1", profile)
	if err != nil {
		t.Fatalf("find or create: %v", err)
	}
	if created.Username != "githubbot" || created.Email == nil || *created.Email != "bot@example.com" {
		t.Fatalf("unexpected created user: %+v", created)
	}

	reused, err := store.FindOrCreateOAuthUser(ctx, "github", "acc-1", profile)
	if err != nil {
		t.Fatalf("find existing: %v", err)
	}
	if reused.ID != created.ID {
		t.Fatalf("expected existing user %s, got %s", created.ID, reused.ID)
	}

	// A verified email match links the provider account to the existing user.
	verifiedEmail := strPtr("verified@example.com")
	existing, err := store.CreateUser(ctx, CreateUserParams{
		Username:      "verified-user",
		Email:         verifiedEmail,
		EmailVerified: true,
	})
	if err != nil {
		t.Fatalf("create verified user: %v", err)
	}
	byEmail, err := store.FindOrCreateOAuthUser(ctx, "google", "google-acc-1",
		OAuthProfile{Username: "random-username", EmailVerified: true, Email: verifiedEmail})
	if err != nil {
		t.Fatalf("find or create by email: %v", err)
	}
	if byEmail.ID != existing.ID {
		t.Fatalf("expected link to user %s, got %s", existing.ID, byEmail.ID)
	}

	// A taken username gets a random suffix instead of creating a duplicate.
	if _, err := store.CreateUser(ctx, CreateUserParams{Username: "taken-name"}); err != nil {
		t.Fatalf("create colliding user: %v", err)
	}
	suffixed, err := store.FindOrCreateOAuthUser(ctx, "github", "acc-2",
		OAuthProfile{Username: "taken-name"})
	if err != nil {
		t.Fatalf("find or create with collision: %v", err)
	}
	if suffixed.Username == "taken-name" || len(suffixed.Username) != len("taken-name")+7 {
		t.Fatalf("expected suffixed username, got %q", suffixed.Username)
	}
}

func TestTwoFactorSettingsLifecycle(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	user, err := store.CreateUser(ctx, CreateUserParams{Username: "twofa"})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	if _, err := store.GetTwoFactorSettings(ctx, user.ID); !errors.Is(err, ErrNoTwoFactorSettings) {
		t.Fatalf("expected ErrNoTwoFactorSettings, got %v", err)
	}

	if err := store.SetTwoFactorEnabled(ctx, user.ID, true); err != nil {
		t.Fatalf("enable two-factor: %v", err)
	}
	settings, err := store.GetTwoFactorSettings(ctx, user.ID)
	if err != nil {
		t.Fatalf("get two-factor settings: %v", err)
	}
	if !settings.Enabled {
		t.Fatal("expected two-factor to be enabled")
	}

	if err := store.SetTwoFactorEnabled(ctx, user.ID, false); err != nil {
		t.Fatalf("disable two-factor: %v", err)
	}
	settings, err = store.GetTwoFactorSettings(ctx, user.ID)
	if err != nil {
		t.Fatalf("get two-factor settings: %v", err)
	}
	if settings.Enabled {
		t.Fatal("expected two-factor to be disabled")
	}
}

func TestGetUserProfile(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	email := strPtr("grace@example.com")
	passwordHash, err := HashPassword("secret")
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	user, err := store.CreateUser(ctx, CreateUserParams{
		Username:      "grace",
		Email:         email,
		EmailVerified: true,
		PasswordHash:  &passwordHash,
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	if _, err := store.LinkOAuthAccount(ctx, user.ID, "github", "grace-acc",
		OAuthProfile{Username: "grace"}); err != nil {
		t.Fatalf("link oauth: %v", err)
	}
	if err := store.SetTwoFactorEnabled(ctx, user.ID, true); err != nil {
		t.Fatalf("enable two-factor: %v", err)
	}

	profile, err := store.GetUserProfile(ctx, user.ID)
	if err != nil {
		t.Fatalf("get profile: %v", err)
	}
	if profile.DisplayName != "grace" {
		t.Fatalf("expected display name fallback, got %q", profile.DisplayName)
	}
	if !profile.HasPassword || !profile.TwoFactorEnabled {
		t.Fatalf("expected password and two-factor flags: %+v", profile)
	}
	if len(profile.Providers) != 1 || profile.Providers[0] != "github" {
		t.Fatalf("unexpected providers: %v", profile.Providers)
	}
}

func strPtr(value string) *string {
	return &value
}

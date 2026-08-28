package auth

import (
	"context"
	"errors"
	"regexp"
	"testing"
)

func TestHashAndCheckPassword(t *testing.T) {
	hash, err := HashPassword("s3cret-password")
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	if hash == "s3cret-password" {
		t.Fatal("hash must not equal the plaintext")
	}
	if !CheckPassword(hash, "s3cret-password") {
		t.Fatal("correct password must verify")
	}
	if CheckPassword(hash, "wrong-password") {
		t.Fatal("wrong password must not verify")
	}
	if CheckPassword(hash, "") {
		t.Fatal("empty password must not verify a real hash")
	}
	if CheckPassword("not-a-bcrypt-hash", "anything") {
		t.Fatal("malformed hash must not verify")
	}
}

func TestSessionToken(t *testing.T) {
	token, err := SessionToken()
	if err != nil {
		t.Fatalf("session token: %v", err)
	}
	// 32 random bytes in unpadded base64url -> 43 chars.
	if len(token) != 43 {
		t.Fatalf("expected 43-char token, got %d: %q", len(token), token)
	}
	urlSafePattern := regexp.MustCompile(`^[A-Za-z0-9_-]+$`)
	if !urlSafePattern.MatchString(token) {
		t.Fatalf("token is not base64url safe: %q", token)
	}

	other, err := SessionToken()
	if err != nil {
		t.Fatalf("second session token: %v", err)
	}
	if token == other {
		t.Fatal("two tokens must differ")
	}
}

func TestHashVerificationToken(t *testing.T) {
	// SHA-256 test vector: sha256("abc").
	expected := "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
	if got := HashVerificationToken("abc"); got != expected {
		t.Fatalf("expected %s, got %s", expected, got)
	}
	if len(HashVerificationToken("anything")) != 64 {
		t.Fatal("sha256 hex digest must be 64 characters")
	}
}

func TestVerifyCredentials(t *testing.T) {
	store := newTestStore(t)
	ctx := context.Background()

	email := "charlie@example.com"
	passwordHash, err := HashPassword("correct-horse")
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	user, err := store.CreateUser(ctx, CreateUserParams{
		Username:      "charlie",
		Email:         &email,
		EmailVerified: true,
		PasswordHash:  &passwordHash,
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}

	verified, err := VerifyCredentials(ctx, store, "charlie", "correct-horse")
	if err != nil {
		t.Fatalf("verify by username: %v", err)
	}
	if verified.ID != user.ID {
		t.Fatalf("expected user %s, got %s", user.ID, verified.ID)
	}

	verified, err = VerifyCredentials(ctx, store, "charlie@example.com", "correct-horse")
	if err != nil {
		t.Fatalf("verify by email: %v", err)
	}
	if verified.ID != user.ID {
		t.Fatalf("expected user %s, got %s", user.ID, verified.ID)
	}

	if _, err := VerifyCredentials(ctx, store, "charlie", "wrong-horse"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials for wrong password, got %v", err)
	}
	if _, err := VerifyCredentials(ctx, store, "unknown-user", "correct-horse"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials for unknown user, got %v", err)
	}

	// A user without a password hash cannot authenticate.
	noPassword, err := store.CreateUser(ctx, CreateUserParams{Username: "nopass"})
	if err != nil {
		t.Fatalf("create no-password user: %v", err)
	}
	if _, err := VerifyCredentials(ctx, store, noPassword.Username, "anything"); !errors.Is(err, ErrInvalidCredentials) {
		t.Fatalf("expected ErrInvalidCredentials for user without hash, got %v", err)
	}
}

package proxy

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCORSMiddlewareSetsHeadersOnNormalRequest(t *testing.T) {
	cfg := CORSConfig{
		AllowedOrigins: []string{"http://localhost:3000"},
		Methods:        []string{"GET", "POST", "DELETE", "OPTIONS"},
		Headers:        []string{"Content-Type", "Authorization", "X-Request-ID"},
	}

	called := false
	nextHandler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		called = true
		writer.WriteHeader(http.StatusOK)
	})

	handler := CORSMiddleware(cfg)(nextHandler)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !called {
		t.Fatal("next handler was not called")
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Fatalf("expected Allow-Origin to be http://localhost:3000, got %s", recorder.Header().Get("Access-Control-Allow-Origin"))
	}
	if recorder.Header().Get("Vary") != "Origin" {
		t.Fatalf("expected Vary: Origin, got %s", recorder.Header().Get("Vary"))
	}
	if recorder.Header().Get("Access-Control-Allow-Methods") != "GET, POST, DELETE, OPTIONS" {
		t.Fatalf("unexpected Allow-Methods: %s", recorder.Header().Get("Access-Control-Allow-Methods"))
	}
	if recorder.Header().Get("Access-Control-Allow-Headers") != "Content-Type, Authorization, X-Request-ID" {
		t.Fatalf("unexpected Allow-Headers: %s", recorder.Header().Get("Access-Control-Allow-Headers"))
	}
	if recorder.Header().Get("Access-Control-Max-Age") != "86400" {
		t.Fatalf("unexpected Max-Age: %s", recorder.Header().Get("Access-Control-Max-Age"))
	}
}

func TestCORSMiddlewareHandlesOptionsPreflight(t *testing.T) {
	cfg := CORSConfig{
		AllowedOrigins: []string{"http://localhost:3000"},
		Methods:        []string{"GET", "POST", "DELETE", "OPTIONS"},
		Headers:        []string{"Content-Type", "Authorization", "X-Request-ID"},
	}

	nextHandler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatal("next handler must not be called for OPTIONS preflight")
	})

	handler := CORSMiddleware(cfg)(nextHandler)

	request := httptest.NewRequest(http.MethodOptions, "/api/v1/audit/jobs", nil)
	request.Header.Set("Origin", "http://localhost:3000")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", recorder.Code)
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "http://localhost:3000" {
		t.Fatalf("expected Allow-Origin to be http://localhost:3000, got %s", recorder.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestCORSMiddlewareDoesNotReflectUnconfiguredOrigins(t *testing.T) {
	cfg := CORSConfig{
		AllowedOrigins: []string{},
		Methods:        []string{"GET", "POST", "DELETE", "OPTIONS"},
		Headers:        []string{"Content-Type", "Authorization", "X-Request-ID"},
	}

	nextHandler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writer.WriteHeader(http.StatusOK)
	})

	handler := CORSMiddleware(cfg)(nextHandler)

	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	request.Header.Set("Origin", "https://untrusted.example")
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("expected no Allow-Origin header for unconfigured CORS, got %s", recorder.Header().Get("Access-Control-Allow-Origin"))
	}
	if recorder.Header().Get("Access-Control-Allow-Methods") != "" {
		t.Fatalf("expected no Allow-Methods header for unconfigured CORS, got %s", recorder.Header().Get("Access-Control-Allow-Methods"))
	}
	if recorder.Header().Get("Access-Control-Allow-Headers") != "" {
		t.Fatalf("expected no Allow-Headers header for unconfigured CORS, got %s", recorder.Header().Get("Access-Control-Allow-Headers"))
	}
}

func TestCORSMiddlewareNoOriginHeader(t *testing.T) {
	cfg := CORSConfig{
		AllowedOrigins: []string{"http://trusted.com"},
		Methods:        []string{"GET"},
		Headers:        []string{"Content-Type"},
	}

	called := false
	nextHandler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		called = true
		writer.WriteHeader(http.StatusOK)
	})

	handler := CORSMiddleware(cfg)(nextHandler)

	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	handler.ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if !called {
		t.Fatal("next handler was not called even without Origin header")
	}
	if recorder.Header().Get("Access-Control-Allow-Origin") != "" {
		t.Fatalf("expected no Allow-Origin header when no Origin sent, got %s", recorder.Header().Get("Access-Control-Allow-Origin"))
	}
}

func TestIsAllowedOriginEmptyList(t *testing.T) {
	cfg := CORSConfig{AllowedOrigins: []string{}}

	// Empty origin is never allowed
	if cfg.isAllowedOrigin("") {
		t.Fatal("expected empty origin to be disallowed")
	}

	// Empty AllowedOrigins list disables browser cross-origin access.
	if cfg.isAllowedOrigin("http://any-origin.example.com") {
		t.Fatal("expected origin to be disallowed when list is empty")
	}
	if cfg.isAllowedOrigin("https://other.example.com:8443") {
		t.Fatal("expected origin to be disallowed when list is empty")
	}
}

func TestIsAllowedOriginSpecificList(t *testing.T) {
	cfg := CORSConfig{
		AllowedOrigins: []string{"http://trusted.com", "https://app.example.com"},
	}

	// Empty origin is never allowed
	if cfg.isAllowedOrigin("") {
		t.Fatal("expected empty origin to be disallowed")
	}

	// Exact match required
	if !cfg.isAllowedOrigin("http://trusted.com") {
		t.Fatal("expected trusted origin to be allowed")
	}
	if !cfg.isAllowedOrigin("https://app.example.com") {
		t.Fatal("expected app origin to be allowed")
	}

	// Non-matching origins are rejected
	if cfg.isAllowedOrigin("http://untrusted.com") {
		t.Fatal("expected untrusted origin to be disallowed")
	}
	if cfg.isAllowedOrigin("http://trusted.com:8080") {
		t.Fatal("expected port-mismatch origin to be disallowed (exact match)")
	}
}

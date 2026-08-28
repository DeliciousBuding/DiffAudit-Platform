package main

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// TestCombineWithAuthRoutesByPrefix guards against the handler-loop bug where
// the combined handler captured the outer variable that later middleware
// reassignments updated, causing infinite recursion on API requests.
func TestCombineWithAuthRoutesByPrefix(t *testing.T) {
	apiCalls := 0
	authCalls := 0

	apiHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		apiCalls++
		_, _ = w.Write([]byte("api"))
	})
	authHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		authCalls++
		_, _ = w.Write([]byte("auth"))
	})

	combined := combineWithAuth(apiHandler, authHandler)

	recorder := httptest.NewRecorder()
	combined.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/auth/me", nil))
	if recorder.Body.String() != "auth" || recorder.Code != http.StatusOK {
		t.Fatalf("auth path: %d %q", recorder.Code, recorder.Body.String())
	}

	recorder = httptest.NewRecorder()
	combined.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/catalog", nil))
	if recorder.Body.String() != "api" || recorder.Code != http.StatusOK {
		t.Fatalf("api path: %d %q", recorder.Code, recorder.Body.String())
	}

	// A forwarded request must not re-enter the combined handler: simulate
	// middleware wrapping that would previously delegate back to the
	// reassigned outer variable.
	recorder = httptest.NewRecorder()
	http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		combined.ServeHTTP(w, r)
	}).ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/v1/models", nil))
	if recorder.Body.String() != "api" {
		t.Fatalf("forwarded api path: %d %q", recorder.Code, recorder.Body.String())
	}

	if authCalls != 1 || apiCalls != 2 {
		t.Fatalf("unexpected call counts: auth=%d api=%d", authCalls, apiCalls)
	}
}

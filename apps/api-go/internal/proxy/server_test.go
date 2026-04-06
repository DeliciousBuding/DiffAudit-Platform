package proxy

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealthEndpoint(t *testing.T) {
	server := NewServer(Config{
		ResearchAPIBaseURL: "http://127.0.0.1:8765",
	})

	request := httptest.NewRequest(http.MethodGet, "/health", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["status"] != "ok" {
		t.Fatalf("expected status ok, got %v", payload["status"])
	}
}

func TestModelsEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/models" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, []map[string]any{
			{"key": "sd15-ddim"},
			{"key": "kandinsky-v22"},
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/models", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload []map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if len(payload) != 2 {
		t.Fatalf("expected 2 models, got %d", len(payload))
	}
}

func TestBestReconEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/experiments/recon/best" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, map[string]any{
			"workspace": "D:/Code/DiffAudit/Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
			"metrics": map[string]any{
				"auc": 0.866,
			},
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/experiments/recon/best", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["workspace"] == nil {
		t.Fatalf("expected workspace payload")
	}
}

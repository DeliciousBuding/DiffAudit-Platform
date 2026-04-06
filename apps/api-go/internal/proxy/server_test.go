package proxy

import (
	"bytes"
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
			"workspace": "../Project/experiments/recon-runtime-mainline-ddim-public-50-step10",
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

func TestJobsListEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/audit/jobs" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, []map[string]any{
			{"job_id": "job_1", "status": "queued"},
			{"job_id": "job_2", "status": "completed"},
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
}

func TestCreateJobEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.Method != http.MethodPost {
			t.Fatalf("expected POST, got %s", request.Method)
		}
		if request.URL.Path != "/api/v1/audit/jobs" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		var payload map[string]any
		if err := json.NewDecoder(request.Body).Decode(&payload); err != nil {
			t.Fatalf("decode failed: %v", err)
		}
		if payload["workspace_name"] != "api-job-001" {
			t.Fatalf("unexpected payload %v", payload)
		}
		writeJSON(writer, http.StatusAccepted, map[string]any{
			"job_id":         "job_123",
			"status":         "queued",
			"workspace_name": "api-job-001",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	body, _ := json.Marshal(map[string]any{
		"job_type":       "recon_artifact_mainline",
		"workspace_name": "api-job-001",
		"artifact_dir":   "experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", recorder.Code)
	}
}

func TestGetJobEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/audit/jobs/job_123" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, map[string]any{
			"job_id": "job_123",
			"status": "running",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs/job_123", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
}

func TestConflictStatusIsPassedThrough(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		writeJSON(writer, http.StatusConflict, map[string]any{
			"detail": "workspace already has an active job",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	body, _ := json.Marshal(map[string]any{
		"job_type":       "recon_artifact_mainline",
		"workspace_name": "api-job-001",
		"artifact_dir":   "experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d", recorder.Code)
	}
}

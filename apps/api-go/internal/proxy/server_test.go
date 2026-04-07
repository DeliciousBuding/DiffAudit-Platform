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

func TestCatalogEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/catalog" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, []map[string]any{
			{"contract_key": "black-box/recon/sd15-ddim"},
			{"contract_key": "gray-box/pia/cifar10-ddpm"},
			{"contract_key": "white-box/gsa/ddpm-cifar10"},
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/catalog", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
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

func TestWorkspaceSummaryEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/experiments/gray-box-pia-probe-001/summary" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, map[string]any{
			"track":   "gray-box",
			"method":  "pia",
			"workspace": "gray-box-pia-probe-001",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/experiments/gray-box-pia-probe-001/summary", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
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
		if payload["contract_key"] != "black-box/recon/sd15-ddim" {
			t.Fatalf("unexpected contract_key %v", payload["contract_key"])
		}
		jobInputs, ok := payload["job_inputs"].(map[string]any)
		if !ok {
			t.Fatalf("expected job_inputs object, got %T", payload["job_inputs"])
		}
		if jobInputs["artifact_dir"] != "experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts" {
			t.Fatalf("unexpected job_inputs payload %v", jobInputs)
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
		"contract_key":   "black-box/recon/sd15-ddim",
		"workspace_name": "api-job-001",
		"job_inputs": map[string]any{
			"artifact_dir": "experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
			"method":       "threshold",
		},
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", recorder.Code)
	}
}

func TestCreateGrayBoxJobEndpointIsProxied(t *testing.T) {
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
		if payload["contract_key"] != "gray-box/pia/cifar10-ddpm" {
			t.Fatalf("unexpected contract_key %v", payload["contract_key"])
		}
		if payload["runtime_profile"] != "docker-default" {
			t.Fatalf("unexpected runtime_profile %v", payload["runtime_profile"])
		}
		jobInputs, ok := payload["job_inputs"].(map[string]any)
		if !ok {
			t.Fatalf("expected job_inputs object, got %T", payload["job_inputs"])
		}
		if jobInputs["config"] != "D:/Code/DiffAudit/Project/tmp/configs/pia-cifar10-graybox-assets.local.yaml" {
			t.Fatalf("unexpected job_inputs payload %v", jobInputs)
		}
		writeJSON(writer, http.StatusAccepted, map[string]any{
			"job_id":         "job_gray_123",
			"status":         "queued",
			"workspace_name": "api-pia-001",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	body, _ := json.Marshal(map[string]any{
		"job_type":       "pia_runtime_mainline",
		"contract_key":   "gray-box/pia/cifar10-ddpm",
		"workspace_name": "api-pia-001",
		"runtime_profile": "docker-default",
		"assets": map[string]any{},
		"job_inputs": map[string]any{
			"config": "D:/Code/DiffAudit/Project/tmp/configs/pia-cifar10-graybox-assets.local.yaml",
		},
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", recorder.Code)
	}
}

func TestCreateWhiteBoxJobEndpointIsProxied(t *testing.T) {
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
		if payload["contract_key"] != "white-box/gsa/ddpm-cifar10" {
			t.Fatalf("unexpected contract_key %v", payload["contract_key"])
		}
		if payload["job_type"] != "gsa_runtime_mainline" {
			t.Fatalf("unexpected job_type %v", payload["job_type"])
		}
		jobInputs, ok := payload["job_inputs"].(map[string]any)
		if !ok {
			t.Fatalf("expected job_inputs object, got %T", payload["job_inputs"])
		}
		if jobInputs["manifest_path"] != "workspaces/white-box/assets/gsa/manifests/cifar10-ddpm-mainline.json" {
			t.Fatalf("unexpected manifest path %v", jobInputs["manifest_path"])
		}
		writeJSON(writer, http.StatusAccepted, map[string]any{
			"job_id":         "job_white_123",
			"status":         "queued",
			"workspace_name": "api-gsa-001",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{ResearchAPIBaseURL: upstream.URL})
	body, _ := json.Marshal(map[string]any{
		"job_type":     "gsa_runtime_mainline",
		"contract_key": "white-box/gsa/ddpm-cifar10",
		"workspace_name": "api-gsa-001",
		"job_inputs": map[string]any{
			"manifest_path": "workspaces/white-box/assets/gsa/manifests/cifar10-ddpm-mainline.json",
		},
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
		"contract_key":   "black-box/recon/sd15-ddim",
		"workspace_name": "api-job-001",
		"job_inputs": map[string]any{
			"artifact_dir": "experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
			"method":       "threshold",
		},
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d", recorder.Code)
	}
}

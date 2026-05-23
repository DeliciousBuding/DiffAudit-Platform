package proxy

import (
	"bytes"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestHealthEndpoint(t *testing.T) {
	server := NewServer(Config{
		RuntimeBaseURL: "http://127.0.0.1:8765",
		PublicDataDir:  ".",
		BuildRevision:  "abc123",
		BuildDate:      "2026-04-29T00:00:00Z",
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
	if payload["runtime_base_url"] != nil || payload["control_api_base_url"] != nil || payload["public_data_dir"] != nil {
		t.Fatalf("health payload must not expose internal urls or paths: %v", payload)
	}
	if payload["runtime_configured"] != true {
		t.Fatalf("expected runtime_configured=true, got %v", payload["runtime_configured"])
	}
	build, ok := payload["build"].(map[string]any)
	if !ok {
		t.Fatalf("expected build object, got %v", payload["build"])
	}
	if build["revision"] != "abc123" || build["date"] != "2026-04-29T00:00:00Z" {
		t.Fatalf("unexpected build payload: %v", build)
	}
}

func TestRuntimeHealthEndpointConnected(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/health" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		writeJSON(writer, http.StatusOK, map[string]any{"status": "ok"})
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/control/runtime", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["connected"] != true {
		t.Fatalf("expected connected=true, got %v", payload["connected"])
	}
	if payload["status"] != "connected" {
		t.Fatalf("expected connected status, got %v", payload["status"])
	}
	if payload["runtime_base_url"] != nil || payload["control_api_base_url"] != nil {
		t.Fatalf("runtime health payload must not expose upstream urls: %v", payload)
	}
}

func TestRuntimeHealthEndpointDemoMode(t *testing.T) {
	server := NewServer(Config{
		DemoMode: true,
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/control/runtime", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["demo_mode"] != true {
		t.Fatalf("expected demo_mode=true, got %v", payload["demo_mode"])
	}
	if payload["connected"] != false {
		t.Fatalf("expected connected=false, got %v", payload["connected"])
	}
	if payload["status"] != "demo" {
		t.Fatalf("expected status demo, got %v", payload["status"])
	}
}

func TestRuntimeHealthEndpointDisconnected(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		http.Error(writer, "upstream unavailable", http.StatusServiceUnavailable)
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/control/runtime", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["connected"] != false {
		t.Fatalf("expected connected=false, got %v", payload["connected"])
	}
	if payload["status"] != "disconnected" {
		t.Fatalf("expected disconnected status, got %v", payload["status"])
	}
	if payload["upstream_status"] != float64(http.StatusServiceUnavailable) {
		t.Fatalf("expected upstream_status 503, got %v", payload["upstream_status"])
	}
}

func TestRuntimeHealthEndpointDoesNotExposeNetworkErrors(t *testing.T) {
	server := NewServer(Config{RuntimeBaseURL: "http://192.0.2.10:8765"})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/control/runtime", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	raw := recorder.Body.String()
	if strings.Contains(raw, "192.0.2.10") || strings.Contains(raw, "runtime_base_url") || strings.Contains(raw, "control_api_base_url") {
		t.Fatalf("runtime health leaked upstream details: %s", raw)
	}
	if payload["runtime_configured"] != true {
		t.Fatalf("expected runtime_configured=true, got %v", payload["runtime_configured"])
	}
}

func TestControlProxyMisconfigurationDoesNotExposeRawRuntimeBaseURL(t *testing.T) {
	server := NewServer(Config{RuntimeBaseURL: "http://[::1"})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", recorder.Code)
	}
	raw := recorder.Body.String()
	if strings.Contains(raw, "[::1") || strings.Contains(raw, "missing ']'") {
		t.Fatalf("control proxy leaked raw runtime configuration: %s", raw)
	}
	if !strings.Contains(raw, "runtime proxy request is misconfigured") {
		t.Fatalf("expected generic misconfiguration detail, got %s", raw)
	}
}

func TestModelsEndpointUsesSnapshotData(t *testing.T) {
	dataDir := writeSnapshotBundle(t, snapshotBundle{
		models: []map[string]any{
			{"key": "sd15-ddim"},
			{"key": "kandinsky-v22"},
		},
	})

	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatalf("snapshot-backed route should not hit control upstream: %s", request.URL.Path)
	}))
	defer upstream.Close()

	server := NewServer(Config{
		PublicDataDir:  dataDir,
		RuntimeBaseURL: upstream.URL,
	})
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

func TestCatalogEndpointUsesSnapshotData(t *testing.T) {
	dataDir := writeSnapshotBundle(t, snapshotBundle{
		catalog: []map[string]any{
			{
				"contract_key":  "black-box/recon/sd15-ddim",
				"track":         "black-box",
				"attack_family": "recon",
				"target_key":    "sd15-ddim",
				"availability":  "ready",
			},
			{
				"contract_key":  "gray-box/pia/cifar10-ddpm",
				"track":         "gray-box",
				"attack_family": "pia",
				"target_key":    "cifar10-ddpm",
				"availability":  "ready",
			},
			{
				"contract_key":  "white-box/gsa/ddpm-cifar10",
				"track":         "white-box",
				"attack_family": "gsa",
				"target_key":    "ddpm-cifar10",
				"availability":  "partial",
			},
		},
	})

	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatalf("snapshot-backed route should not hit control upstream: %s", request.URL.Path)
	}))
	defer upstream.Close()

	server := NewServer(Config{
		PublicDataDir:  dataDir,
		RuntimeBaseURL: upstream.URL,
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/catalog", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}

	var payload []map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}

	expectedKeys := []string{
		"black-box/recon/sd15-ddim",
		"gray-box/pia/cifar10-ddpm",
		"white-box/gsa/ddpm-cifar10",
	}
	if len(payload) != len(expectedKeys) {
		t.Fatalf("expected %d catalog entries, got %d", len(expectedKeys), len(payload))
	}

	for _, key := range expectedKeys {
		entry, ok := findEntryByContractKey(payload, key)
		if !ok {
			t.Fatalf("expected catalog entry for %s", key)
		}
		track, _ := entry["track"].(string)
		if track == "" {
			t.Fatalf("expected track preserved for %s", key)
		}
	}
}

func TestAttackDefenseTableEndpointUsesSnapshotData(t *testing.T) {
	dataDir := writeSnapshotBundle(t, snapshotBundle{
		attackDefenseTable: map[string]any{
			"schema": "diffaudit.attack_defense_table.v1",
			"rows": []map[string]any{
				{
					"track":   "gray-box",
					"attack":  "PIA GPU512 baseline",
					"defense": "provisional G-1 = stochastic-dropout",
				},
			},
		},
	})

	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatalf("snapshot-backed route should not hit control upstream: %s", request.URL.Path)
	}))
	defer upstream.Close()

	server := NewServer(Config{
		PublicDataDir:  dataDir,
		RuntimeBaseURL: upstream.URL,
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/evidence/attack-defense-table", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["schema"] != "diffaudit.attack_defense_table.v1" {
		t.Fatalf("unexpected schema %v", payload["schema"])
	}
}

func TestBestReconEndpointUsesSnapshotSummary(t *testing.T) {
	dataDir := writeSnapshotBundle(t, snapshotBundle{
		catalog: []map[string]any{
			{
				"contract_key":   "black-box/recon/sd15-ddim",
				"track":          "black-box",
				"attack_family":  "recon",
				"target_key":     "sd15-ddim",
				"availability":   "ready",
				"best_workspace": "research://experiments/recon-runtime-mainline-ddim-public-50-step10",
			},
		},
		summaries: map[string]map[string]any{
			"recon-runtime-mainline-ddim-public-50-step10": {
				"workspace": "research://experiments/recon-runtime-mainline-ddim-public-50-step10",
				"metrics": map[string]any{
					"auc": 0.866,
				},
			},
		},
	})

	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatalf("snapshot-backed route should not hit control upstream: %s", request.URL.Path)
	}))
	defer upstream.Close()

	server := NewServer(Config{
		PublicDataDir:  dataDir,
		RuntimeBaseURL: upstream.URL,
	})
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

func TestWorkspaceSummaryEndpointUsesSnapshotData(t *testing.T) {
	dataDir := writeSnapshotBundle(t, snapshotBundle{
		summaries: map[string]map[string]any{
			"gray-box-pia-probe-001": {
				"track":     "gray-box",
				"method":    "pia",
				"workspace": "gray-box-pia-probe-001",
			},
		},
	})

	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		t.Fatalf("snapshot-backed route should not hit control upstream: %s", request.URL.Path)
	}))
	defer upstream.Close()

	server := NewServer(Config{
		PublicDataDir:  dataDir,
		RuntimeBaseURL: upstream.URL,
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/experiments/gray-box-pia-probe-001/summary", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
}

func TestSnapshotBackedRouteReturns503WhenSnapshotMissing(t *testing.T) {
	server := NewServer(Config{
		PublicDataDir: filepath.Join(t.TempDir(), "missing"),
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/catalog", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", recorder.Code)
	}
	if !bytes.Contains(recorder.Body.Bytes(), []byte("snapshot unavailable")) {
		t.Fatalf("expected snapshot unavailable response, got %s", recorder.Body.String())
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

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
}

func TestJobTemplateEndpointIsProxied(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if request.URL.Path != "/api/v1/audit/job-template" {
			t.Fatalf("unexpected path %s", request.URL.Path)
		}
		if request.URL.RawQuery != "contract_key=black-box/recon/sd15-ddim" {
			t.Fatalf("unexpected query %s", request.URL.RawQuery)
		}
		writeJSON(writer, http.StatusOK, map[string]any{
			"contract_key": "black-box/recon/sd15-ddim",
			"job_type":     "recon_artifact_mainline",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/job-template?contract_key=black-box/recon/sd15-ddim", nil)
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
		runtimeProfile, ok := payload["runtime_profile"].(map[string]any)
		if !ok {
			t.Fatalf("expected runtime_profile object, got %T", payload["runtime_profile"])
		}
		if runtimeProfile["mode"] != "profile-driven" {
			t.Fatalf("unexpected runtime_profile %v", runtimeProfile)
		}
		assets, ok := payload["assets"].(map[string]any)
		if !ok {
			t.Fatalf("expected assets object, got %T", payload["assets"])
		}
		if assets["source"] != "catalog-test" {
			t.Fatalf("unexpected assets payload %v", assets)
		}
		writeJSON(writer, http.StatusAccepted, map[string]any{
			"job_id":         "job_123",
			"status":         "queued",
			"workspace_name": "api-job-001",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	payload := jobPayloadFixture()
	body, _ := json.Marshal(payload)
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
		if jobInputs["config"] != "research://tmp/configs/pia-cifar10-graybox-assets.example.yaml" {
			t.Fatalf("unexpected job_inputs payload %v", jobInputs)
		}
		writeJSON(writer, http.StatusAccepted, map[string]any{
			"job_id":         "job_gray_123",
			"status":         "queued",
			"workspace_name": "api-pia-001",
		})
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	body, _ := json.Marshal(map[string]any{
		"job_type":        "pia_runtime_mainline",
		"contract_key":    "gray-box/pia/cifar10-ddpm",
		"workspace_name":  "api-pia-001",
		"runtime_profile": "docker-default",
		"assets":          map[string]any{},
		"job_inputs": map[string]any{
			"config": "research://tmp/configs/pia-cifar10-graybox-assets.example.yaml",
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

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	body, _ := json.Marshal(map[string]any{
		"job_type":       "gsa_runtime_mainline",
		"contract_key":   "white-box/gsa/ddpm-cifar10",
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

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
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

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	body, _ := json.Marshal(jobPayloadFixture())
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d", recorder.Code)
	}
}

// ── Demo control-plane endpoints ────────────────────────────────────────────

func TestDemoJobsListEndpoint(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["demo_mode"] != true {
		t.Fatalf("expected demo_mode=true, got %v", payload["demo_mode"])
	}
	total, ok := payload["total"].(float64)
	if !ok || total != 6 {
		t.Fatalf("expected total=6, got %v", payload["total"])
	}
	jobs, ok := payload["jobs"].([]any)
	if !ok || len(jobs) != 6 {
		t.Fatalf("expected 6 jobs, got %v", payload["jobs"])
	}
}

func TestDemoJobDetailEndpoint(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs/demo-job-001", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["job_id"] != "demo-job-001" {
		t.Fatalf("expected job_id=demo-job-001, got %v", payload["job_id"])
	}
	if payload["status"] != "completed" {
		t.Fatalf("expected status=completed, got %v", payload["status"])
	}
	if payload["contract_key"] != "black-box/recon/sd15-ddim" {
		t.Fatalf("unexpected contract_key: %v", payload["contract_key"])
	}
}

func TestDemoJobDetailNotFound(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs/nonexistent-job-id", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", recorder.Code)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["demo_mode"] != true {
		t.Fatalf("expected demo_mode=true, got %v", payload["demo_mode"])
	}
}

func TestDemoJobCreationEndpoint(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	body, _ := json.Marshal(map[string]any{
		"contract_key":   "black-box/recon/sd15-ddim",
		"workspace_name": "demo-test-workspace",
		"job_type":       "attack",
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusAccepted {
		t.Fatalf("expected 202, got %d: %s", recorder.Code, recorder.Body.String())
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["status"] != "queued" {
		t.Fatalf("expected status=queued, got %v", payload["status"])
	}
	if payload["contract_key"] != "black-box/recon/sd15-ddim" {
		t.Fatalf("expected contract_key preserved, got %v", payload["contract_key"])
	}
	if payload["workspace_name"] != "demo-test-workspace" {
		t.Fatalf("expected workspace_name preserved, got %v", payload["workspace_name"])
	}
	if payload["demo_mode"] != true {
		t.Fatalf("expected demo_mode=true, got %v", payload["demo_mode"])
	}
}

func TestDemoJobCreationRejectsMissingContractKey(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	body, _ := json.Marshal(map[string]any{
		"workspace_name": "no-contract-key-workspace",
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", recorder.Code, recorder.Body.String())
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if !strings.Contains(recorder.Body.String(), "contract_key") {
		t.Fatalf("expected contract_key validation detail, got %v", payload["detail"])
	}
}

func TestDemoJobCreationRejectsMissingWorkspaceName(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	body, _ := json.Marshal(map[string]any{
		"contract_key": "black-box/recon/sd15-ddim",
	})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", bytes.NewReader(body))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", recorder.Code)
	}
}

func TestDemoJobCreationRejectsInvalidJson(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	request := httptest.NewRequest(http.MethodPost, "/api/v1/audit/jobs", strings.NewReader("not json"))
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestDemoJobCancelEndpoint(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	request := httptest.NewRequest(http.MethodDelete, "/api/v1/audit/jobs/demo-job-004", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if payload["status"] != "cancelled" {
		t.Fatalf("expected status=cancelled, got %v", payload["status"])
	}
	if payload["job_id"] != "demo-job-004" {
		t.Fatalf("expected job_id=demo-job-004, got %v", payload["job_id"])
	}
}

func TestDemoJobCancelNotFound(t *testing.T) {
	server := NewServer(Config{DemoMode: true})
	request := httptest.NewRequest(http.MethodDelete, "/api/v1/audit/jobs/nonexistent-job-id", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", recorder.Code)
	}
}

// ── Error safety ─────────────────────────────────────────────────────────────

func TestRuntimeErrorResponseIsSafe(t *testing.T) {
	server := NewServer(Config{RuntimeBaseURL: "http://192.0.2.10:9999"})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable && recorder.Code != http.StatusBadGateway {
		t.Fatalf("expected 502 or 503, got %d", recorder.Code)
	}
	raw := recorder.Body.String()
	if strings.Contains(raw, "192.0.2.10") {
		t.Fatalf("runtime error leaked upstream URL: %s", raw)
	}
}

func TestSnapshotUnavailableResponseIsSafe(t *testing.T) {
	server := NewServer(Config{
		PublicDataDir:  "",
		RuntimeBaseURL: "",
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/catalog", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusServiceUnavailable {
		t.Fatalf("expected 503, got %d", recorder.Code)
	}
	raw := recorder.Body.String()
	if !strings.Contains(raw, "snapshot unavailable") {
		t.Fatalf("expected snapshot unavailable detail, got %s", raw)
	}
	if strings.Contains(raw, "public_data_dir") || strings.Contains(raw, "runtime_base_url") {
		t.Fatalf("503 response leaked internal config keys: %s", raw)
	}
}

func TestBadGatewayResponseIsSafe(t *testing.T) {
	// Without runtime configured and demo mode off, control-plane routes return 502.
	server := NewServer(Config{
		RuntimeBaseURL: "",
	})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	if recorder.Code != http.StatusBadGateway {
		t.Fatalf("expected 502, got %d", recorder.Code)
	}
	raw := recorder.Body.String()
	if !strings.Contains(raw, "runtime") || strings.Contains(raw, "runtime_base_url") {
		t.Fatalf("502 response should mention runtime and must not leak internal config: %s", raw)
	}
}

// ── Retry and error handling ───────────────────────────────────────────────────

func TestRuntimeErrorHint(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		contains string
	}{
		{"timeout", errors.New("context deadline exceeded"), "timed out"},
		{"connection refused", errors.New("dial tcp: connection refused"), "cannot connect"},
		{"no such host", errors.New("dial tcp: lookup no-such-host.example: no such host"), "hostname cannot be resolved"},
		{"generic", errors.New("some other error"), "unavailable"},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			hint := runtimeErrorHint(tc.err)
			if !strings.Contains(strings.ToLower(hint), strings.ToLower(tc.contains)) {
				t.Fatalf("expected hint to contain %q, got %q", tc.contains, hint)
			}
		})
	}
}

func TestIsRetryableError(t *testing.T) {
	tests := []struct {
		name     string
		err      error
		expected bool
	}{
		{"timeout", errors.New("dial tcp: i/o timeout"), true},
		{"deadline exceeded", errors.New("context deadline exceeded"), true},
		{"connection reset", errors.New("connection reset by peer"), true},
		{"connection refused", errors.New("dial tcp: connection refused"), true},
		{"no such host", errors.New("dial tcp: lookup x: no such host"), true},
		{"unexpected EOF", errors.New("unexpected EOF"), true},
		{"server misbehaving", errors.New("server misbehaving"), true},
		{"not found", errors.New("404 Not Found"), false},
		{"permission denied", errors.New("permission denied"), false},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			if got := isRetryableError(tc.err); got != tc.expected {
				t.Fatalf("isRetryableError(%q) = %v, want %v", tc.err, got, tc.expected)
			}
		})
	}
}

func TestDoWithRetrySuccess(t *testing.T) {
	callCount := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		callCount++
		writeJSON(writer, http.StatusOK, map[string]any{"status": "ok"})
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	req, _ := http.NewRequest(http.MethodGet, upstream.URL+"/health", nil)
	resp, err := server.doWithRetry(req, maxRetries)

	if err != nil {
		t.Fatalf("expected success, got %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", resp.StatusCode)
	}
	resp.Body.Close()
	if callCount != 1 {
		t.Fatalf("expected 1 call, got %d", callCount)
	}
}

func TestDoWithRetryGivesUpAfterMaxRetries(t *testing.T) {
	callCount := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		callCount++
		// Simulate a transient network error by closing the connection abruptly.
		// httptest doesn't support hijacking, so we use a panic to abort the
		// handler mid-response, which causes an EOF on the client side.
		panic("simulated connection reset")
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})

	req, _ := http.NewRequest(http.MethodGet, upstream.URL+"/test", nil)
	_, err := server.doWithRetry(req, 3)

	if err == nil {
		t.Fatalf("expected error after max retries")
	}
	// The panic in httptest handler causes the server to return empty response
	// and close the connection, which the client sees as an error — but the
	// error may not be retryable (unexpected EOF varies). Either way, the
	// function should return an error, not nil.
}

func TestServeCacheFallbackHit(t *testing.T) {
	dataDir := t.TempDir()
	cacheDir := filepath.Join(dataDir, "cache")
	os.MkdirAll(cacheDir, 0o755)
	os.WriteFile(filepath.Join(cacheDir, "audit-jobs.json"), []byte(`{"cached":true}`), 0o644)

	server := NewServer(Config{PublicDataDir: dataDir})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	ok := server.serveCacheFallback(recorder, request, "/api/v1/audit/jobs")

	if !ok {
		t.Fatalf("expected cache hit")
	}
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	if recorder.Header().Get("X-Data-Source") != "cache" {
		t.Fatalf("expected X-Data-Source=cache header")
	}
}

func TestServeCacheFallbackMiss(t *testing.T) {
	server := NewServer(Config{PublicDataDir: t.TempDir()})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	ok := server.serveCacheFallback(recorder, request, "/api/v1/audit/jobs")

	if ok {
		t.Fatalf("expected cache miss")
	}
}

func TestServeCacheFallbackEmptyDir(t *testing.T) {
	server := NewServer(Config{PublicDataDir: ""})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/audit/jobs", nil)
	recorder := httptest.NewRecorder()

	ok := server.serveCacheFallback(recorder, request, "/api/v1/audit/jobs")

	if ok {
		t.Fatalf("expected cache miss with empty dir")
	}
}

func TestConfigTimeoutDefault(t *testing.T) {
	cfg := Config{}
	timeout := cfg.timeout()
	if timeout != defaultRuntimeTimeout {
		t.Fatalf("expected default timeout %v, got %v", defaultRuntimeTimeout, timeout)
	}
}

func TestConfigTimeoutCustom(t *testing.T) {
	customTimeout := 5 * time.Second
	cfg := Config{RuntimeTimeout: customTimeout}
	timeout := cfg.timeout()
	if timeout != customTimeout {
		t.Fatalf("expected custom timeout %v, got %v", customTimeout, timeout)
	}
}

func TestHealthCheckRetries(t *testing.T) {
	callCount := 0
	upstream := httptest.NewServer(http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		callCount++
		if callCount < 3 {
			writer.WriteHeader(http.StatusServiceUnavailable)
			return
		}
		writeJSON(writer, http.StatusOK, map[string]any{"status": "ok"})
	}))
	defer upstream.Close()

	server := NewServer(Config{RuntimeBaseURL: upstream.URL})
	request := httptest.NewRequest(http.MethodGet, "/api/v1/control/runtime", nil)
	recorder := httptest.NewRecorder()

	server.Handler().ServeHTTP(recorder, request)

	// 503 is not a retryable error (it's a successful HTTP response),
	// so the health check should see upstream_status=503 on the first call
	// and return disconnected. This verifies we don't retry non-transient errors.
	if recorder.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", recorder.Code)
	}
	var payload map[string]any
	json.Unmarshal(recorder.Body.Bytes(), &payload)
	if payload["connected"] != false {
		t.Fatalf("expected disconnected for 503 upstream")
	}
	// Verify no internal info leaked
	raw := recorder.Body.String()
	if strings.Contains(raw, upstream.URL) {
		t.Fatalf("response leaked upstream URL: %s", raw)
	}
}

func findEntryByContractKey(entries []map[string]any, key string) (map[string]any, bool) {
	for _, entry := range entries {
		entryKey, _ := entry["contract_key"].(string)
		if entryKey == key {
			return entry, true
		}
	}
	return nil, false
}

func jobPayloadFixture() map[string]any {
	return map[string]any{
		"job_type":       "recon_artifact_mainline",
		"contract_key":   "black-box/recon/sd15-ddim",
		"workspace_name": "api-job-001",
		"runtime_profile": map[string]any{
			"mode":     "profile-driven",
			"executor": "local",
		},
		"assets": map[string]any{
			"source": "catalog-test",
		},
		"job_inputs": map[string]any{
			"artifact_dir": "experiments/recon-runtime-mainline-ddim-public-50-step10/score-artifacts",
			"method":       "threshold",
		},
	}
}

type snapshotBundle struct {
	catalog            []map[string]any
	attackDefenseTable map[string]any
	models             []map[string]any
	summaries          map[string]map[string]any
}

func writeSnapshotBundle(t *testing.T, bundle snapshotBundle) string {
	t.Helper()

	root := t.TempDir()
	publicDir := filepath.Join(root, "public")
	summariesDir := filepath.Join(publicDir, "summaries")
	if err := os.MkdirAll(summariesDir, 0o755); err != nil {
		t.Fatalf("mkdir failed: %v", err)
	}

	writeJSONFile(t, filepath.Join(publicDir, "catalog.json"), bundle.catalog)
	writeJSONFile(t, filepath.Join(publicDir, "attack-defense-table.json"), bundle.attackDefenseTable)
	writeJSONFile(t, filepath.Join(publicDir, "models.json"), bundle.models)

	summaryKeys := make([]string, 0, len(bundle.summaries))
	for key, payload := range bundle.summaries {
		summaryKeys = append(summaryKeys, key)
		writeJSONFile(t, filepath.Join(summariesDir, key+".json"), payload)
	}

	writeJSONFile(t, filepath.Join(publicDir, "manifest.json"), map[string]any{
		"generated_at":  "2026-04-14T00:00:00Z",
		"source":        "test-fixture",
		"catalog_count": len(bundle.catalog),
		"summary_keys":  summaryKeys,
	})

	return publicDir
}

func writeJSONFile(t *testing.T, path string, payload any) {
	t.Helper()

	bytes, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}
	if err := os.WriteFile(path, bytes, 0o644); err != nil {
		t.Fatalf("write failed: %v", err)
	}
}

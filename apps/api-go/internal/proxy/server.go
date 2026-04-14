package proxy

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"
)

const (
	defaultRuntimeTimeout = 15000 * time.Millisecond
	maxRetries            = 3
	retryDelay            = 1 * time.Second
)

type Config struct {
	PublicDataDir  string
	RuntimeBaseURL string
	DemoMode       bool
	CORS           CORSConfig
}

type Server struct {
	config   Config
	mux      *http.ServeMux
	client   *http.Client
	cacheDir string // snapshot cache for 5.1.3
}

func NewServer(config Config) *Server {
	mux := http.NewServeMux()
	server := &Server{
		config:   config,
		mux:      mux,
		client: &http.Client{
			Timeout: defaultRuntimeTimeout,
		},
		cacheDir: config.PublicDataDir,
	}
	mux.HandleFunc("GET /health", server.handleHealth)
	mux.HandleFunc("GET /api/v1/control/runtime", server.handleRuntimeHealth)
	mux.HandleFunc("GET /api/v1/catalog", server.handleSnapshotFile("catalog.json"))
	mux.HandleFunc("GET /api/v1/evidence/attack-defense-table", server.handleSnapshotFile("attack-defense-table.json"))
	mux.HandleFunc("GET /api/v1/models", server.handleSnapshotFile("models.json"))
	mux.HandleFunc("GET /api/v1/experiments/recon/best", server.handleBestReconSummary)
	mux.HandleFunc("GET /api/v1/experiments/{workspace}/summary", server.handleWorkspaceSummary)
	mux.HandleFunc("GET /api/v1/audit/job-template", server.handleControlGet)
	mux.HandleFunc("GET /api/v1/audit/jobs", server.handleControlGet)
	mux.HandleFunc("POST /api/v1/audit/jobs", server.handleControlPost)
	mux.HandleFunc("GET /api/v1/audit/jobs/{jobID}", server.handleControlGet)
	mux.HandleFunc("DELETE /api/v1/audit/jobs/{jobID}", server.handleControlDelete)
	return server
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

func (s *Server) GetConfig() Config {
	return s.config
}

func (s *Server) handleHealth(writer http.ResponseWriter, _ *http.Request) {
	manifestAvailable := s.snapshotExists("manifest.json")

	writeJSON(writer, http.StatusOK, map[string]any{
		"status":               "ok",
		"public_data_dir":      s.config.PublicDataDir,
		"snapshot_available":   manifestAvailable,
		"runtime_base_url":     s.config.RuntimeBaseURL,
		"control_api_base_url": s.config.RuntimeBaseURL,
		"demo_mode":            s.config.DemoMode,
	})
}

func (s *Server) handleRuntimeHealth(writer http.ResponseWriter, _ *http.Request) {
	payload := map[string]any{
		"status":               "disconnected",
		"connected":            false,
		"runtime_base_url":     s.config.RuntimeBaseURL,
		"control_api_base_url": s.config.RuntimeBaseURL,
	}

	if s.config.RuntimeBaseURL == "" {
		payload["detail"] = "runtime base url is not configured"
		writeJSON(writer, http.StatusOK, payload)
		return
	}

	upstreamURL, err := url.JoinPath(s.config.RuntimeBaseURL, "/health")
	if err != nil {
		payload["detail"] = err.Error()
		writeJSON(writer, http.StatusOK, payload)
		return
	}

	upstreamRequest, err := http.NewRequest(http.MethodGet, upstreamURL, nil)
	if err != nil {
		payload["detail"] = err.Error()
		writeJSON(writer, http.StatusOK, payload)
		return
	}

	response, err := s.doWithRetry(upstreamRequest, 1)
	if err != nil {
		payload["detail"] = err.Error()
		writeJSON(writer, http.StatusOK, payload)
		return
	}
	defer response.Body.Close()

	payload["upstream_status"] = response.StatusCode
	if response.StatusCode >= http.StatusOK && response.StatusCode < http.StatusMultipleChoices {
		payload["status"] = "connected"
		payload["connected"] = true
	} else {
		payload["detail"] = "runtime health check failed"
	}

	writeJSON(writer, http.StatusOK, payload)
}

func (s *Server) handleSnapshotFile(name string) http.HandlerFunc {
	return func(writer http.ResponseWriter, request *http.Request) {
		snapshotPath := filepath.Join(s.config.PublicDataDir, name)
		s.serveSnapshot(writer, snapshotPath)
	}
}

func (s *Server) handleWorkspaceSummary(writer http.ResponseWriter, request *http.Request) {
	workspace := normalizeWorkspaceKey(request.PathValue("workspace"))
	if workspace == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"detail": "workspace is required"})
		return
	}

	snapshotPath := filepath.Join(s.config.PublicDataDir, "summaries", workspace+".json")
	s.serveSnapshot(writer, snapshotPath)
}

func (s *Server) handleBestReconSummary(writer http.ResponseWriter, _ *http.Request) {
	type catalogEntry struct {
		ContractKey   string `json:"contract_key"`
		Track         string `json:"track"`
		AttackFamily  string `json:"attack_family"`
		Availability  string `json:"availability"`
		BestWorkspace string `json:"best_workspace"`
	}

	bytes, err := s.readSnapshotFile(filepath.Join(s.config.PublicDataDir, "catalog.json"))
	if err != nil {
		s.writeSnapshotError(writer, err)
		return
	}

	var catalog []catalogEntry
	if err := json.Unmarshal(bytes, &catalog); err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": "catalog snapshot is invalid"})
		return
	}

	for _, entry := range catalog {
		if entry.ContractKey != "black-box/recon/sd15-ddim" {
			continue
		}

		workspace := normalizeWorkspaceKey(entry.BestWorkspace)
		if workspace == "" {
			break
		}

		s.serveSnapshot(writer, filepath.Join(s.config.PublicDataDir, "summaries", workspace+".json"))
		return
	}

	writeJSON(writer, http.StatusServiceUnavailable, map[string]any{"detail": "snapshot unavailable: recon best summary"})
}

func (s *Server) handleControlGet(writer http.ResponseWriter, request *http.Request) {
	if s.config.DemoMode {
		s.handleDemoControlGet(writer, request)
		return
	}
	s.forwardControl(writer, request, nil)
}

func (s *Server) handleControlPost(writer http.ResponseWriter, request *http.Request) {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}

	// In demo mode, simulate job creation without calling runtime
	if s.config.DemoMode && request.URL.Path == "/api/v1/audit/jobs" {
		s.handleDemoJobCreation(writer, body)
		return
	}

	s.forwardControl(writer, request, body)
}

func (s *Server) handleDemoControlGet(writer http.ResponseWriter, request *http.Request) {
	path := request.URL.Path

	switch {
	// GET /api/v1/audit/job-template
	case path == "/api/v1/audit/job-template" || strings.HasSuffix(path, "/job-template"):
		writeJSON(writer, http.StatusOK, map[string]any{
			"contract_key": "black-box/recon/sd15-ddim",
			"job_type":     "attack",
			"parameters": map[string]any{
				"num_steps":      50,
				"guidance_scale": 7.5,
			},
			"demo_mode": true,
		})

	// GET /api/v1/audit/jobs/{jobID}
	case strings.Contains(path, "/jobs/") && !strings.HasSuffix(path, "/jobs"):
		jobID := request.PathValue("jobID")
		if jobID == "" {
			// Fallback: extract from path
			parts := strings.Split(strings.TrimSuffix(path, "/"), "/")
			jobID = parts[len(parts)-1]
		}
		writeJSON(writer, http.StatusOK, map[string]any{
			"job_id":       jobID,
			"status":       "completed",
			"demo_mode":    true,
			"result":       "Demo mode: job result placeholder",
		})

	// GET /api/v1/audit/jobs
	default:
		writeJSON(writer, http.StatusOK, map[string]any{
			"jobs":      []any{},
			"total":     0,
			"demo_mode": true,
		})
	}
}

func (s *Server) serveSnapshot(writer http.ResponseWriter, path string) {
	bytes, err := s.readSnapshotFile(path)
	if err != nil {
		s.writeSnapshotError(writer, err)
		return
	}

	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(http.StatusOK)
	_, _ = writer.Write(bytes)
}

func (s *Server) readSnapshotFile(path string) ([]byte, error) {
	if s.config.PublicDataDir == "" {
		return nil, errSnapshotUnavailable
	}

	bytes, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return nil, errSnapshotUnavailable
		}
		return nil, err
	}

	return bytes, nil
}

func (s *Server) writeSnapshotError(writer http.ResponseWriter, err error) {
	if errors.Is(err, errSnapshotUnavailable) {
		writeJSON(writer, http.StatusServiceUnavailable, map[string]any{"detail": "snapshot unavailable"})
		return
	}

	writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
}

func (s *Server) snapshotExists(name string) bool {
	if s.config.PublicDataDir == "" {
		return false
	}

	_, err := os.Stat(filepath.Join(s.config.PublicDataDir, name))
	return err == nil
}

func (s *Server) handleControlDelete(writer http.ResponseWriter, request *http.Request) {
	if s.config.DemoMode {
		writeJSON(writer, http.StatusOK, map[string]any{
			"status":    "cancelled",
			"demo_mode": true,
			"message":   "Demo mode: job cancellation not available",
		})
		return
	}
	s.forwardControlWithMethod(writer, request, http.MethodDelete)
}

func (s *Server) forwardControl(writer http.ResponseWriter, request *http.Request, body []byte) {
	if s.config.RuntimeBaseURL == "" {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": "runtime base url is not configured"})
		return
	}

	upstreamPath := request.URL.Path
	if jobID := request.PathValue("jobID"); jobID != "" {
		upstreamPath = strings.TrimSuffix(request.URL.Path, request.PathValue("jobID")) + jobID
	}
	upstreamURL, err := url.JoinPath(s.config.RuntimeBaseURL, upstreamPath)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	if query := request.URL.RawQuery; query != "" {
		upstreamURL = upstreamURL + "?" + query
	}
	upstreamRequest, err := http.NewRequest(request.Method, upstreamURL, strings.NewReader(string(body)))
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	if contentType := request.Header.Get("Content-Type"); contentType != "" {
		upstreamRequest.Header.Set("Content-Type", contentType)
	}
	response, err := s.doWithRetry(upstreamRequest, maxRetries)
	if err != nil {
		// 5.1.3: Runtime unavailable → serve cached snapshot if available
		if s.serveCacheFallback(writer, request, upstreamPath) {
			return
		}
		s.writeRuntimeError(writer, err)
		return
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(response.StatusCode)
	_, _ = writer.Write(responseBody)
}

func (s *Server) forwardControlWithMethod(writer http.ResponseWriter, request *http.Request, method string) {
	if s.config.RuntimeBaseURL == "" {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": "runtime base url is not configured"})
		return
	}

	upstreamPath := request.URL.Path
	upstreamURL, err := url.JoinPath(s.config.RuntimeBaseURL, upstreamPath)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	if query := request.URL.RawQuery; query != "" {
		upstreamURL = upstreamURL + "?" + query
	}
	upstreamRequest, err := http.NewRequest(method, upstreamURL, nil)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	if contentType := request.Header.Get("Content-Type"); contentType != "" {
		upstreamRequest.Header.Set("Content-Type", contentType)
	}
	response, err := s.client.Do(upstreamRequest)
	if err != nil {
		s.writeRuntimeError(writer, err)
		return
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(response.Body)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(response.StatusCode)
	_, _ = writer.Write(responseBody)
}

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}

var errSnapshotUnavailable = errors.New("snapshot unavailable")

func (s *Server) doWithRetry(request *http.Request, maxAttempts int) (*http.Response, error) {
	var lastErr error
	for attempt := 1; attempt <= maxAttempts; attempt++ {
		response, err := s.client.Do(request)
		if err == nil {
			return response, nil
		}
		lastErr = err

		// Only retry on transient network errors, not for successful responses or client errors.
		// Retry is safe for GET (idempotent) and for transient failures (timeout, connection reset).
		isRetryable := isRetryableError(err)
		if !isRetryable || attempt >= maxAttempts {
			break
		}
		time.Sleep(retryDelay)
	}
	return nil, lastErr
}

// isRetryableError returns true for transient network errors that are safe to retry.
func isRetryableError(err error) bool {
	errStr := err.Error()
	return strings.Contains(errStr, "timeout") ||
		strings.Contains(errStr, "deadline exceeded") ||
		strings.Contains(errStr, "connection reset") ||
		strings.Contains(errStr, "connection refused") ||
		strings.Contains(errStr, "no such host") ||
		strings.Contains(errStr, "server misbehaving") ||
		strings.Contains(errStr, "unexpected EOF")
}

func normalizeWorkspaceKey(value string) string {
	if value == "" {
		return ""
	}

	normalized := strings.ReplaceAll(value, "\\", "/")
	normalized = strings.Trim(normalized, "/")
	if normalized == "" {
		return ""
	}

	parts := strings.Split(normalized, "/")
	return parts[len(parts)-1]
}

func (s *Server) handleDemoJobCreation(writer http.ResponseWriter, body []byte) {
	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		writeJSON(writer, http.StatusBadRequest, map[string]any{"detail": "invalid request body"})
		return
	}

	contractKey, _ := payload["contract_key"].(string)
	workspaceName, _ := payload["workspace_name"].(string)
	jobType, _ := payload["job_type"].(string)

	if contractKey == "" || workspaceName == "" {
		writeJSON(writer, http.StatusBadRequest, map[string]any{
			"detail": "contract_key and workspace_name are required",
		})
		return
	}

	// Generate a demo job ID
	jobID := "demo-job-" + time.Now().Format("20060102-150405")

	writeJSON(writer, http.StatusAccepted, map[string]any{
		"job_id":         jobID,
		"status":         "queued",
		"workspace_name": workspaceName,
		"contract_key":   contractKey,
		"job_type":       jobType,
		"demo_mode":      true,
		"message":        "Demo mode: job created successfully (not executed)",
	})
}

func (s *Server) writeRuntimeError(writer http.ResponseWriter, err error) {
	errorMessage := err.Error()
	statusCode := http.StatusServiceUnavailable
	hint := "Runtime server is unavailable. Please check if the runtime server is running."

	// Check for timeout errors
	if strings.Contains(errorMessage, "timeout") || strings.Contains(errorMessage, "deadline exceeded") {
		hint = "Runtime server request timed out. The server may be overloaded or unreachable."
	} else if strings.Contains(errorMessage, "connection refused") {
		hint = "Cannot connect to runtime server. Please verify the runtime server is running and accessible."
	} else if strings.Contains(errorMessage, "no such host") {
		hint = "Runtime server hostname cannot be resolved. Please check the runtime base URL configuration."
	}

	writeJSON(writer, statusCode, map[string]any{
		"detail":           errorMessage,
		"runtime_base_url": s.config.RuntimeBaseURL,
		"hint":             hint,
		"demo_mode_tip":    "Consider enabling demo mode (DIFFAUDIT_DEMO_MODE=true) to use snapshot data without runtime server",
	})
}

// serveCacheFallback serves cached snapshot data when the runtime is unavailable.
// Maps request paths to snapshot filenames and serves the cached copy.
func (s *Server) serveCacheFallback(writer http.ResponseWriter, request *http.Request, path string) bool {
	if s.cacheDir == "" {
		return false
	}

	// Map API paths to cached snapshot files
	var snapshotFile string
	switch {
	case strings.HasSuffix(path, "/audit/jobs") || path == "/api/v1/audit/jobs":
		snapshotFile = "audit-jobs.json"
	case strings.HasPrefix(path, "/api/v1/audit/jobs/"):
		jobID := request.PathValue("jobID")
		if jobID != "" {
			snapshotFile = "jobs/" + jobID + ".json"
		}
	case path == "/api/v1/audit/job-template":
		snapshotFile = "audit-job-template.json"
	default:
		// Try to match by path suffix
		parts := strings.Split(strings.TrimPrefix(path, "/api/v1/"), "/")
		if len(parts) >= 2 {
			snapshotFile = strings.Join(parts, "-") + ".json"
		}
	}

	if snapshotFile == "" {
		return false
	}

	cachePath := filepath.Join(s.cacheDir, "cache", snapshotFile)
	bytes, err := os.ReadFile(cachePath)
	if err != nil {
		return false
	}

	// Serve the cached data with a warning header
	writer.Header().Set("Content-Type", "application/json")
	writer.Header().Set("X-Data-Source", "cache")
	writer.WriteHeader(http.StatusOK)
	_, _ = writer.Write(bytes)
	return true
}

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

	_ "github.com/swaggo/files"
)

// @title DiffAudit Platform API
// @version 1.0
// @description API documentation for DiffAudit Platform
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.example.com/support
// @contact.email support@example.com

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8780
// @BasePath /api/v1
// @schemes http https

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

// NewServer creates a new proxy server.
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
	
	// Health check
	// @Summary Health check
	// @Description Check the health of the server
	// @Tags health
	// @Accept json
	// @Produce json
	// @Success 200 {object} map[string]any
	// @Router /health [get]
	mux.HandleFunc("GET /health", server.handleHealth)
	
	// Runtime health check
	// @Summary Runtime health check
	// @Description Check the health of the runtime server
	// @Tags health
	// @Accept json
	// @Produce json
	// @Success 200 {object} map[string]any
	// @Router /control/runtime [get]
	mux.HandleFunc("GET /api/v1/control/runtime", server.handleRuntimeHealth)
	
	// Catalog
	// @Summary Get catalog
	// @Description Get the catalog of available audit capabilities
	// @Tags catalog
	// @Accept json
	// @Produce json
	// @Success 200 {array} catalogEntry
	// @Router /catalog [get]
	mux.HandleFunc("GET /api/v1/catalog", server.handleSnapshotFile("catalog.json"))
	
	// Attack defense table
	// @Summary Get attack defense table
	// @Description Get the attack defense table
	// @Tags evidence
	// @Accept json
	// @Produce json
	// @Success 200 {object} map[string]any
	// @Router /evidence/attack-defense-table [get]
	mux.HandleFunc("GET /api/v1/evidence/attack-defense-table", server.handleSnapshotFile("attack-defense-table.json"))
	
	// Models
	// @Summary Get models
	// @Description Get the list of available models
	// @Tags models
	// @Accept json
	// @Produce json
	// @Success 200 {array} map[string]any
	// @Router /models [get]
	mux.HandleFunc("GET /api/v1/models", server.handleSnapshotFile("models.json"))
	
	// Best recon summary
	// @Summary Get best recon summary
	// @Description Get the best recon summary
	// @Tags experiments
	// @Accept json
	// @Produce json
	// @Success 200 {object} map[string]any
	// @Router /experiments/recon/best [get]
	mux.HandleFunc("GET /api/v1/experiments/recon/best", server.handleBestReconSummary)
	
	// Workspace summary
	// @Summary Get workspace summary
	// @Description Get the summary for a specific workspace
	// @Tags experiments
	// @Accept json
	// @Produce json
	// @Param workspace path string true "Workspace name"
	// @Success 200 {object} map[string]any
	// @Router /experiments/{workspace}/summary [get]
	mux.HandleFunc("GET /api/v1/experiments/{workspace}/summary", server.handleWorkspaceSummary)
	
	// Job template
	// @Summary Get job template
	// @Description Get the job template for creating audit jobs
	// @Tags audit
	// @Accept json
	// @Produce json
	// @Success 200 {object} map[string]any
	// @Router /audit/job-template [get]
	mux.HandleFunc("GET /api/v1/audit/job-template", server.handleControlGet)
	
	// Get jobs
	// @Summary Get jobs
	// @Description Get the list of audit jobs
	// @Tags audit
	// @Accept json
	// @Produce json
	// @Success 200 {object} map[string]any
	// @Router /audit/jobs [get]
	mux.HandleFunc("GET /api/v1/audit/jobs", server.handleControlGet)
	
	// Create job
	// @Summary Create job
	// @Description Create a new audit job
	// @Tags audit
	// @Accept json
	// @Produce json
	// @Param job body map[string]any true "Job parameters"
	// @Success 201 {object} map[string]any
	// @Router /audit/jobs [post]
	mux.HandleFunc("POST /api/v1/audit/jobs", server.handleControlPost)
	
	// Get job
	// @Summary Get job
	// @Description Get the details of a specific audit job
	// @Tags audit
	// @Accept json
	// @Produce json
	// @Param jobID path string true "Job ID"
	// @Success 200 {object} map[string]any
	// @Router /audit/jobs/{jobID} [get]
	mux.HandleFunc("GET /api/v1/audit/jobs/{jobID}", server.handleControlGet)
	
	// Delete job
	// @Summary Delete job
	// @Description Delete a specific audit job
	// @Tags audit
	// @Accept json
	// @Produce json
	// @Param jobID path string true "Job ID"
	// @Success 200 {object} map[string]any
	// @Router /audit/jobs/{jobID} [delete]
	mux.HandleFunc("DELETE /api/v1/audit/jobs/{jobID}", server.handleControlDelete)
	
	// Swagger UI
	swaggerHandler := http.StripPrefix("/swagger/", http.FileServer(http.Dir("./swagger")))
	mux.Handle("GET /swagger/", swaggerHandler)
	
	return server
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

func (s *Server) GetConfig() Config {
	return s.config
}

// @Summary Get health status
// @Description Check the health status of the platform API
// @Tags health
// @Accept json
// @Produce json
// @Success 200 {object} map[string]any
// @Router /health [get]
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

// @Summary Get runtime health
// @Description Check the health status of the runtime server
// @Tags health
// @Accept json
// @Produce json
// @Success 200 {object} map[string]any
// @Router /control/runtime [get]
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

// @Summary Get workspace summary
// @Description Get the summary for a specific workspace
// @Tags experiments
// @Accept json
// @Produce json
// @Param workspace path string true "Workspace name"
// @Success 200 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 503 {object} ErrorResponse
// @Router /experiments/{workspace}/summary [get]
func (s *Server) handleWorkspaceSummary(writer http.ResponseWriter, request *http.Request) {
	workspace := normalizeWorkspaceKey(request.PathValue("workspace"))
	if workspace == "" {
		writeError(writer, http.StatusBadRequest, "workspace is required", "missing_workspace", "Please provide a valid workspace name")
		return
	}

	snapshotPath := filepath.Join(s.config.PublicDataDir, "summaries", workspace+".json")
	s.serveSnapshot(writer, snapshotPath)
}

// @Summary Get best recon summary
// @Description Get the best recon summary for black-box/recon/sd15-ddim
// @Tags experiments
// @Accept json
// @Produce json
// @Success 200 {object} map[string]any
// @Failure 503 {object} ErrorResponse
// @Router /experiments/recon/best [get]
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
		writeError(writer, http.StatusBadGateway, "catalog snapshot is invalid", "invalid_snapshot", "The catalog snapshot file is invalid or corrupted")
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

	writeError(writer, http.StatusServiceUnavailable, "snapshot unavailable: recon best summary", "snapshot_unavailable", "The best recon summary snapshot is not available")
}

// @Summary Get audit job template
// @Description Get the job template for creating audit jobs
// @Tags audit
// @Accept json
// @Produce json
// @Success 200 {object} map[string]any
// @Failure 502 {object} ErrorResponse
// @Router /audit/job-template [get]
//
// @Summary Get audit jobs
// @Description Get the list of audit jobs
// @Tags audit
// @Accept json
// @Produce json
// @Success 200 {object} map[string]any
// @Failure 502 {object} ErrorResponse
// @Router /audit/jobs [get]
//
// @Summary Get audit job details
// @Description Get the details of a specific audit job
// @Tags audit
// @Accept json
// @Produce json
// @Param jobID path string true "Job ID"
// @Success 200 {object} map[string]any
// @Failure 502 {object} ErrorResponse
// @Router /audit/jobs/{jobID} [get]
func (s *Server) handleControlGet(writer http.ResponseWriter, request *http.Request) {
	if s.config.DemoMode {
		s.handleDemoControlGet(writer, request)
		return
	}
	s.forwardControl(writer, request, nil)
}

// @Summary Create audit job
// @Description Create a new audit job
// @Tags audit
// @Accept json
// @Produce json
// @Param job body map[string]any true "Job parameters"
// @Success 201 {object} map[string]any
// @Failure 400 {object} ErrorResponse
// @Failure 502 {object} ErrorResponse
// @Router /audit/jobs [post]
func (s *Server) handleControlPost(writer http.ResponseWriter, request *http.Request) {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		writeError(writer, http.StatusBadGateway, err.Error(), "invalid_request", "Failed to read request body")
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

// @Summary Serve snapshot file
// @Description Serve a snapshot file from the public data directory
// @Tags snapshot
// @Accept json
// @Produce json
// @Success 200 {object} map[string]any
// @Failure 503 {object} ErrorResponse
// @Router /snapshot/{path} [get]
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
		writeJSON(writer, http.StatusServiceUnavailable, ErrorResponse{
			Detail: "snapshot unavailable",
			Code:   "snapshot_unavailable",
			Hint:   "The requested snapshot file is not available. Please check if the public data directory is properly configured.",
		})
		return
	}

	writeJSON(writer, http.StatusBadGateway, ErrorResponse{
		Detail: err.Error(),
		Code:   "snapshot_read_error",
		Hint:   "Failed to read snapshot file. Please check the file permissions and try again.",
	})
}

func (s *Server) snapshotExists(name string) bool {
	if s.config.PublicDataDir == "" {
		return false
	}

	_, err := os.Stat(filepath.Join(s.config.PublicDataDir, name))
	return err == nil
}

// @Summary Delete audit job
// @Description Delete a specific audit job
// @Tags audit
// @Accept json
// @Produce json
// @Param jobID path string true "Job ID"
// @Success 200 {object} map[string]any
// @Failure 502 {object} ErrorResponse
// @Router /audit/jobs/{jobID} [delete]
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
		writeError(writer, http.StatusBadGateway, "runtime base url is not configured", "runtime_url_not_configured", "Please set DIFFAUDIT_RUNTIME_BASE_URL environment variable")
		return
	}

	upstreamPath := request.URL.Path
	if jobID := request.PathValue("jobID"); jobID != "" {
		upstreamPath = strings.TrimSuffix(request.URL.Path, request.PathValue("jobID")) + jobID
	}
	upstreamURL, err := url.JoinPath(s.config.RuntimeBaseURL, upstreamPath)
	if err != nil {
		writeError(writer, http.StatusBadGateway, err.Error(), "invalid_url", "Failed to construct upstream URL")
		return
	}
	if query := request.URL.RawQuery; query != "" {
		upstreamURL = upstreamURL + "?" + query
	}
	upstreamRequest, err := http.NewRequest(request.Method, upstreamURL, strings.NewReader(string(body)))
	if err != nil {
		writeError(writer, http.StatusBadGateway, err.Error(), "invalid_request", "Failed to create upstream request")
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
		writeError(writer, http.StatusBadGateway, err.Error(), "read_error", "Failed to read response body")
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(response.StatusCode)
	_, _ = writer.Write(responseBody)
}

func (s *Server) forwardControlWithMethod(writer http.ResponseWriter, request *http.Request, method string) {
	if s.config.RuntimeBaseURL == "" {
		writeError(writer, http.StatusBadGateway, "runtime base url is not configured", "runtime_url_not_configured", "Please set DIFFAUDIT_RUNTIME_BASE_URL environment variable")
		return
	}

	upstreamPath := request.URL.Path
	upstreamURL, err := url.JoinPath(s.config.RuntimeBaseURL, upstreamPath)
	if err != nil {
		writeError(writer, http.StatusBadGateway, err.Error(), "invalid_url", "Failed to construct upstream URL")
		return
	}
	if query := request.URL.RawQuery; query != "" {
		upstreamURL = upstreamURL + "?" + query
	}
	upstreamRequest, err := http.NewRequest(method, upstreamURL, nil)
	if err != nil {
		writeError(writer, http.StatusBadGateway, err.Error(), "invalid_request", "Failed to create upstream request")
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
		writeError(writer, http.StatusBadGateway, err.Error(), "read_error", "Failed to read response body")
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(response.StatusCode)
	_, _ = writer.Write(responseBody)
}

// ErrorResponse represents a standardized error response
type ErrorResponse struct {
	Detail        string `json:"detail"`
	Code          string `json:"code,omitempty"`
	Hint          string `json:"hint,omitempty"`
	RuntimeBaseURL string `json:"runtime_base_url,omitempty"`
	DemoModeTip   string `json:"demo_mode_tip,omitempty"`
}

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}

// writeError writes a standardized error response
func writeError(writer http.ResponseWriter, statusCode int, detail string, code string, hint string) {
	writeJSON(writer, statusCode, ErrorResponse{
		Detail: detail,
		Code:   code,
		Hint:   hint,
	})
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
		writeError(writer, http.StatusBadRequest, "invalid request body", "invalid_request", "Please provide a valid JSON request body")
		return
	}

	contractKey, _ := payload["contract_key"].(string)
	workspaceName, _ := payload["workspace_name"].(string)
	jobType, _ := payload["job_type"].(string)

	if contractKey == "" || workspaceName == "" {
		writeError(writer, http.StatusBadRequest, "contract_key and workspace_name are required", "missing_required_fields", "Please provide both contract_key and workspace_name in the request body")
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
	code := "runtime_unavailable"

	// Check for specific error types
	if strings.Contains(errorMessage, "timeout") || strings.Contains(errorMessage, "deadline exceeded") {
		hint = "Runtime server request timed out. The server may be overloaded or unreachable."
		code = "runtime_timeout"
	} else if strings.Contains(errorMessage, "connection refused") {
		hint = "Cannot connect to runtime server. Please verify the runtime server is running and accessible."
		code = "runtime_connection_refused"
	} else if strings.Contains(errorMessage, "no such host") {
		hint = "Runtime server hostname cannot be resolved. Please check the runtime base URL configuration."
		code = "runtime_host_not_found"
	} else if strings.Contains(errorMessage, "network is unreachable") {
		hint = "Runtime server network is unreachable. Please check your network connection."
		code = "runtime_network_unreachable"
	}

	writeJSON(writer, statusCode, ErrorResponse{
		Detail:        errorMessage,
		Code:          code,
		Hint:          hint,
		RuntimeBaseURL: s.config.RuntimeBaseURL,
		DemoModeTip:   "Consider enabling demo mode (DIFFAUDIT_DEMO_MODE=true) to use snapshot data without runtime server",
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

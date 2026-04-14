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
)

type Config struct {
	PublicDataDir     string
	ControlAPIBaseURL string
}

type Server struct {
	config Config
	mux    *http.ServeMux
	client *http.Client
}

func NewServer(config Config) *Server {
	mux := http.NewServeMux()
	server := &Server{
		config: config,
		mux:    mux,
		client: &http.Client{},
	}
	mux.HandleFunc("GET /health", server.handleHealth)
	mux.HandleFunc("GET /api/v1/control/local-api", server.handleLocalAPIHealth)
	mux.HandleFunc("GET /api/v1/catalog", server.handleSnapshotFile("catalog.json"))
	mux.HandleFunc("GET /api/v1/evidence/attack-defense-table", server.handleSnapshotFile("attack-defense-table.json"))
	mux.HandleFunc("GET /api/v1/models", server.handleSnapshotFile("models.json"))
	mux.HandleFunc("GET /api/v1/experiments/recon/best", server.handleBestReconSummary)
	mux.HandleFunc("GET /api/v1/experiments/{workspace}/summary", server.handleWorkspaceSummary)
	mux.HandleFunc("GET /api/v1/audit/job-template", server.handleControlGet)
	mux.HandleFunc("GET /api/v1/audit/jobs", server.handleControlGet)
	mux.HandleFunc("POST /api/v1/audit/jobs", server.handleControlPost)
	mux.HandleFunc("GET /api/v1/audit/jobs/{jobID}", server.handleControlGet)
	return server
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

func (s *Server) handleHealth(writer http.ResponseWriter, _ *http.Request) {
	manifestAvailable := s.snapshotExists("manifest.json")

	writeJSON(writer, http.StatusOK, map[string]any{
		"status":               "ok",
		"public_data_dir":      s.config.PublicDataDir,
		"snapshot_available":   manifestAvailable,
		"control_api_base_url": s.config.ControlAPIBaseURL,
	})
}

func (s *Server) handleLocalAPIHealth(writer http.ResponseWriter, _ *http.Request) {
	payload := map[string]any{
		"status":               "disconnected",
		"connected":            false,
		"control_api_base_url": s.config.ControlAPIBaseURL,
	}

	if s.config.ControlAPIBaseURL == "" {
		payload["detail"] = "control api base url is not configured"
		writeJSON(writer, http.StatusOK, payload)
		return
	}

	upstreamURL, err := url.JoinPath(s.config.ControlAPIBaseURL, "/health")
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

	response, err := s.client.Do(upstreamRequest)
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
		payload["detail"] = "local api health check failed"
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
	s.forwardControl(writer, request, nil)
}

func (s *Server) handleControlPost(writer http.ResponseWriter, request *http.Request) {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	s.forwardControl(writer, request, body)
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

func (s *Server) forwardControl(writer http.ResponseWriter, request *http.Request, body []byte) {
	if s.config.ControlAPIBaseURL == "" {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": "control api base url is not configured"})
		return
	}

	upstreamPath := request.URL.Path
	if jobID := request.PathValue("jobID"); jobID != "" {
		upstreamPath = strings.TrimSuffix(request.URL.Path, request.PathValue("jobID")) + jobID
	}
	upstreamURL, err := url.JoinPath(s.config.ControlAPIBaseURL, upstreamPath)
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
	response, err := s.client.Do(upstreamRequest)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
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

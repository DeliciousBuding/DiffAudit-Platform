package proxy

import (
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type Config struct {
	ResearchAPIBaseURL string
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
	mux.HandleFunc("GET /api/v1/catalog", server.handleProxyGet)
	mux.HandleFunc("GET /api/v1/evidence/attack-defense-table", server.handleProxyGet)
	mux.HandleFunc("GET /api/v1/models", server.handleProxyGet)
	mux.HandleFunc("GET /api/v1/experiments/recon/best", server.handleProxyGet)
	mux.HandleFunc("GET /api/v1/experiments/{workspace}/summary", server.handleProxyGet)
	mux.HandleFunc("GET /api/v1/audit/jobs", server.handleProxyGet)
	mux.HandleFunc("POST /api/v1/audit/jobs", server.handleProxyPost)
	mux.HandleFunc("GET /api/v1/audit/jobs/{jobID}", server.handleProxyGet)
	return server
}

func (s *Server) Handler() http.Handler {
	return s.mux
}

func (s *Server) handleHealth(writer http.ResponseWriter, _ *http.Request) {
	writeJSON(writer, http.StatusOK, map[string]any{
		"status":                "ok",
		"research_api_base_url": s.config.ResearchAPIBaseURL,
	})
}

func (s *Server) handleProxyGet(writer http.ResponseWriter, request *http.Request) {
	s.forward(writer, request, nil)
}

func (s *Server) handleProxyPost(writer http.ResponseWriter, request *http.Request) {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	s.forward(writer, request, body)
}

func (s *Server) forward(writer http.ResponseWriter, request *http.Request, body []byte) {
	if s.config.ResearchAPIBaseURL == "" {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": "research api base url is not configured"})
		return
	}
	upstreamPath := request.URL.Path
	if jobID := request.PathValue("jobID"); jobID != "" {
		upstreamPath = strings.TrimSuffix(request.URL.Path, request.PathValue("jobID")) + jobID
	}
	upstreamURL, err := url.JoinPath(s.config.ResearchAPIBaseURL, upstreamPath)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
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

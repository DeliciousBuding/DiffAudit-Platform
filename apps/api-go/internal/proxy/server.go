package proxy

import (
	"io"
	"encoding/json"
	"net/http"
	"net/url"
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
	mux.HandleFunc("GET /api/v1/models", server.handleProxyGet)
	mux.HandleFunc("GET /api/v1/experiments/recon/best", server.handleProxyGet)
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
	if s.config.ResearchAPIBaseURL == "" {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": "research api base url is not configured"})
		return
	}
	upstreamURL, err := url.JoinPath(s.config.ResearchAPIBaseURL, request.URL.Path)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	upstreamRequest, err := http.NewRequest(http.MethodGet, upstreamURL, nil)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	response, err := s.client.Do(upstreamRequest)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	defer response.Body.Close()
	body, err := io.ReadAll(response.Body)
	if err != nil {
		writeJSON(writer, http.StatusBadGateway, map[string]any{"detail": err.Error()})
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(response.StatusCode)
	_, _ = writer.Write(body)
}

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}

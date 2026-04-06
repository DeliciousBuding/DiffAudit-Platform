package proxy

import (
	"encoding/json"
	"net/http"
)

type Config struct {
	ResearchAPIBaseURL string
}

type Server struct {
	config Config
	mux    *http.ServeMux
}

func NewServer(config Config) *Server {
	mux := http.NewServeMux()
	server := &Server{
		config: config,
		mux:    mux,
	}
	mux.HandleFunc("GET /health", server.handleHealth)
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

func writeJSON(writer http.ResponseWriter, statusCode int, payload any) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)
	_ = json.NewEncoder(writer).Encode(payload)
}

package proxy

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

// CORSMiddleware wraps an http.Handler with CORS headers.
func CORSMiddleware(cfg CORSConfig) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")
			if cfg.isAllowedOrigin(origin) {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
			w.Header().Set("Access-Control-Allow-Methods", strings.Join(cfg.Methods, ", "))
			w.Header().Set("Access-Control-Allow-Headers", strings.Join(cfg.Headers, ", "))
			w.Header().Set("Access-Control-Max-Age", "86400")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// CORSConfig holds CORS configuration.
type CORSConfig struct {
	AllowedOrigins []string // exact origins to allow; empty = allow all
	Methods        []string
	Headers        []string
}

func (c *CORSConfig) isAllowedOrigin(origin string) bool {
	if origin == "" {
		return false
	}
	if len(c.AllowedOrigins) == 0 {
		return true // allow all when empty (development default)
	}
	for _, allowed := range c.AllowedOrigins {
		if allowed == origin {
			return true
		}
	}
	return false
}

// NewStructuredLogger creates a middleware that logs each request as JSON.
func NewStructuredLogger() func(http.Handler) http.Handler {
	logger := log.New(os.Stdout, "", 0)
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			reqID := strconv.FormatInt(start.UnixNano(), 36)
			rw := &capturingWriter{ResponseWriter: w, statusCode: http.StatusOK}

			next.ServeHTTP(rw, r)

			elapsed := time.Since(start)
			logger.Printf(
				`{"time":"%s","id":"%s","method":"%s","path":"%s","status":%d,"duration_ms":%.1f}`,
				start.Format(time.RFC3339),
				reqID,
				r.Method,
				r.URL.Path,
				rw.statusCode,
				float64(elapsed.Microseconds())/1000.0,
			)
		})
	}
}

// capturingWriter wraps http.ResponseWriter to capture the status code.
type capturingWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *capturingWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

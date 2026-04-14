package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"diffaudit/platform-api-go/internal/proxy"
)

type runtimeConfig struct {
	Host           string
	Port           string
	PublicDataDir  string
	RuntimeBaseURL string
	DemoMode       bool
	CORSOrigins    string
}

const (
	defaultHost = "127.0.0.1"
	defaultPort = "8780"
)

func parseConfig(args []string) (runtimeConfig, error) {
	flagSet := flag.NewFlagSet("platform-api", flag.ContinueOnError)
	flagSet.SetOutput(os.Stdout)

	host := flagSet.String("host", defaultHost, "listen host")
	port := flagSet.String("port", defaultPort, "listen port")
	publicDataDir := flagSet.String(
		"public-data-dir",
		envOrDefault(defaultPublicDataDir(), "DIFFAUDIT_PUBLIC_DATA_DIR"),
		"public snapshot directory",
	)
	runtimeBaseURL := flagSet.String(
		"runtime-base-url",
		envOrDefault("http://127.0.0.1:8765", "DIFFAUDIT_RUNTIME_BASE_URL", "DIFFAUDIT_CONTROL_API_BASE_URL"),
		"upstream runtime base url",
	)
	legacyControlAPIBaseURL := flagSet.String(
		"control-api-base-url",
		"",
		"deprecated alias for --runtime-base-url",
	)
	legacyResearchAPIBaseURL := flagSet.String(
		"research-api-base-url",
		"",
		"deprecated alias for --runtime-base-url",
	)
	demoMode := flagSet.Bool(
		"demo-mode",
		envOrDefault("false", "DIFFAUDIT_DEMO_MODE") == "true",
		"enable demo mode (use snapshot data, simulate job creation)",
	)
	corsOrigins := flagSet.String(
		"cors-allowed-origins",
		envOrDefault("", "DIFFAUDIT_CORS_ALLOWED_ORIGINS"),
		"comma-separated list of allowed CORS origins (empty = allow all)",
	)
	if err := flagSet.Parse(args); err != nil {
		return runtimeConfig{}, err
	}

	resolvedRuntimeBaseURL := *runtimeBaseURL
	if *legacyControlAPIBaseURL != "" {
		resolvedRuntimeBaseURL = *legacyControlAPIBaseURL
	}
	if *legacyResearchAPIBaseURL != "" {
		resolvedRuntimeBaseURL = *legacyResearchAPIBaseURL
	}

	return runtimeConfig{
		Host:           *host,
		Port:           *port,
		PublicDataDir:  *publicDataDir,
		RuntimeBaseURL: resolvedRuntimeBaseURL,
		DemoMode:       *demoMode,
		CORSOrigins:    *corsOrigins,
	}, nil
}

func main() {
	config, err := parseConfig(os.Args[1:])
	if err != nil {
		os.Exit(2)
	}

	var allowedOrigins []string
	if config.CORSOrigins != "" {
		for _, origin := range strings.Split(config.CORSOrigins, ",") {
			trimmed := strings.TrimSpace(origin)
			if trimmed != "" {
				allowedOrigins = append(allowedOrigins, trimmed)
			}
		}
	}

	server := proxy.NewServer(proxy.Config{
		PublicDataDir:  config.PublicDataDir,
		RuntimeBaseURL: config.RuntimeBaseURL,
		DemoMode:       config.DemoMode,
		CORS: proxy.CORSConfig{
			AllowedOrigins: allowedOrigins,
			Methods:        []string{"GET", "POST", "DELETE", "OPTIONS"},
			Headers:        []string{"Content-Type", "Authorization", "X-Request-ID"},
		},
	})

	handler := server.Handler()
	handler = proxy.CORSMiddleware(server.GetConfig().CORS)(handler)
	handler = proxy.NewStructuredLogger()(handler)

	address := fmt.Sprintf("%s:%s", config.Host, config.Port)
	if err := http.ListenAndServe(address, handler); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func envOrDefault(fallback string, names ...string) string {
	for _, name := range names {
		if value := os.Getenv(name); value != "" {
			return value
		}
	}

	return fallback
}

func defaultPublicDataDir() string {
	return filepath.Join(".", "data", "public")
}

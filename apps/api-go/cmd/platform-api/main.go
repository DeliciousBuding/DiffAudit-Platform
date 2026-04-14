package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"path/filepath"

	"diffaudit/platform-api-go/internal/proxy"
)

type runtimeConfig struct {
	Host           string
	Port           string
	PublicDataDir  string
	RuntimeBaseURL string
	DemoMode       bool
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
	}, nil
}

func main() {
	config, err := parseConfig(os.Args[1:])
	if err != nil {
		os.Exit(2)
	}
	server := proxy.NewServer(proxy.Config{
		PublicDataDir:  config.PublicDataDir,
		RuntimeBaseURL: config.RuntimeBaseURL,
		DemoMode:       config.DemoMode,
	})
	address := fmt.Sprintf("%s:%s", config.Host, config.Port)
	if err := http.ListenAndServe(address, server.Handler()); err != nil {
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

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
	Host              string
	Port              string
	PublicDataDir     string
	ControlAPIBaseURL string
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
		envOrDefault("DIFFAUDIT_PUBLIC_DATA_DIR", defaultPublicDataDir()),
		"public snapshot directory",
	)
	controlAPIBaseURL := flagSet.String(
		"control-api-base-url",
		envOrDefault("DIFFAUDIT_CONTROL_API_BASE_URL", "http://127.0.0.1:8765"),
		"upstream control api base url",
	)
	legacyResearchAPIBaseURL := flagSet.String(
		"research-api-base-url",
		"",
		"deprecated alias for --control-api-base-url",
	)
	if err := flagSet.Parse(args); err != nil {
		return runtimeConfig{}, err
	}

	resolvedControlAPIBaseURL := *controlAPIBaseURL
	if *legacyResearchAPIBaseURL != "" {
		resolvedControlAPIBaseURL = *legacyResearchAPIBaseURL
	}

	return runtimeConfig{
		Host:              *host,
		Port:              *port,
		PublicDataDir:     *publicDataDir,
		ControlAPIBaseURL: resolvedControlAPIBaseURL,
	}, nil
}

func main() {
	config, err := parseConfig(os.Args[1:])
	if err != nil {
		os.Exit(2)
	}
	server := proxy.NewServer(proxy.Config{
		PublicDataDir:     config.PublicDataDir,
		ControlAPIBaseURL: config.ControlAPIBaseURL,
	})
	address := fmt.Sprintf("%s:%s", config.Host, config.Port)
	if err := http.ListenAndServe(address, server.Handler()); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func envOrDefault(name string, fallback string) string {
	if value := os.Getenv(name); value != "" {
		return value
	}

	return fallback
}

func defaultPublicDataDir() string {
	return filepath.Join(".", "data", "public")
}

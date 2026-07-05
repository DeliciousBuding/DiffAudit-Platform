package main

import (
	"context"
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"syscall"
	"time"

	"diffaudit/platform-api-go/internal/proxy"
)

type runtimeConfig struct {
	Host           string
	Port           string
	PublicDataDir  string
	RuntimeBaseURL string
	BuildRevision  string
	BuildDate      string
	DemoMode       bool
	CORSOrigins    string
}

const (
	defaultHost          = "127.0.0.1"
	defaultPort          = "8780"
	defaultReadTimeout   = 10 * time.Second
	defaultWriteTimeout  = 30 * time.Second
	defaultIdleTimeout   = 120 * time.Second
	defaultShutdownGrace = 15 * time.Second
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
		envOrDefault("", "DIFFAUDIT_RUNTIME_BASE_URL", "DIFFAUDIT_CONTROL_API_BASE_URL"),
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
		parseDemoModeEnv(),
		"enable demo mode (use snapshot data, simulate job creation)",
	)
	corsOrigins := flagSet.String(
		"cors-allowed-origins",
		envOrDefault("", "DIFFAUDIT_CORS_ALLOWED_ORIGINS"),
		"comma-separated list of allowed CORS origins (empty = allow all)",
	)
	buildRevision := flagSet.String(
		"build-revision",
		envOrDefault("unknown", "DIFFAUDIT_BUILD_REVISION"),
		"public build revision identifier",
	)
	buildDate := flagSet.String(
		"build-date",
		envOrDefault("unknown", "DIFFAUDIT_BUILD_DATE"),
		"public build timestamp",
	)
	if err := flagSet.Parse(args); err != nil {
		if err == flag.ErrHelp {
			os.Exit(0)
		}
		fmt.Fprintf(os.Stderr, "flag parse error: %v\n", err)
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
		BuildRevision:  *buildRevision,
		BuildDate:      *buildDate,
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
		BuildRevision:  config.BuildRevision,
		BuildDate:      config.BuildDate,
		DemoMode:       config.DemoMode,
		CORS: proxy.CORSConfig{
			AllowedOrigins: allowedOrigins,
			Methods:        []string{"GET", "POST", "DELETE", "OPTIONS"},
			Headers:        []string{"Content-Type", "Authorization", "X-Request-ID"},
		},
	})

	handler := server.Handler()
	handler = proxy.CORSMiddleware(server.GetConfig().CORS)(handler)
	handler = proxy.RecoveryMiddleware()(handler)
	handler = proxy.NewStructuredLogger()(handler)

	address := fmt.Sprintf("%s:%s", config.Host, config.Port)
	httpServer := &http.Server{
		Addr:              address,
		Handler:           handler,
		ReadTimeout:       defaultReadTimeout,
		ReadHeaderTimeout: defaultReadTimeout,
		WriteTimeout:      defaultWriteTimeout,
		IdleTimeout:       defaultIdleTimeout,
		MaxHeaderBytes:    1 << 20, // 1 MB
	}

	// Graceful shutdown
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		fmt.Fprintf(os.Stderr, "platform-api listening on %s (demo=%v)\n", address, config.DemoMode)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Fprintln(os.Stderr, err)
			os.Exit(1)
		}
	}()

	<-stop
	fmt.Fprintln(os.Stderr, "shutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), defaultShutdownGrace)
	defer cancel()
	if err := httpServer.Shutdown(ctx); err != nil {
		fmt.Fprintln(os.Stderr, "shutdown error:", err)
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

func parseDemoModeEnv() bool {
	raw := os.Getenv("DIFFAUDIT_DEMO_MODE")
	if raw == "" {
		raw = os.Getenv("DIFFAUDIT_FORCE_DEMO_MODE")
	}
	if raw == "" {
		return true // safe default: demo mode on
	}
	parsed, err := strconv.ParseBool(raw)
	if err != nil {
		return true // unparseable → safe default
	}
	return parsed
}

func defaultPublicDataDir() string {
	return filepath.Join(".", "data", "public")
}

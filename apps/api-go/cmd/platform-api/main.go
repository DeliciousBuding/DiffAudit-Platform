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

	"diffaudit/platform-api-go/internal/auth"
	"diffaudit/platform-api-go/internal/proxy"
	"diffaudit/platform-api-go/internal/static"
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
	StaticDir      string
	DBPath         string
	PlatformURL    string
	SharedUsername string
	SharedPassword string
	GitHubClientID string
	GitHubSecret   string
	GoogleClientID string
	GoogleSecret   string
	OAuthProxyURL  string
	CookieSecure   bool
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
	staticDir := flagSet.String(
		"static-dir",
		envOrDefault("", "DIFFAUDIT_STATIC_DIR"),
		"root directory of the SPA build to serve (empty = API only)",
	)
	dbPath := flagSet.String(
		"db-path",
		envOrDefault("", "DIFFAUDIT_DB_PATH"),
		"sqlite database path for the auth store",
	)
	platformURL := flagSet.String(
		"platform-url",
		envOrDefault("", "DIFFAUDIT_PLATFORM_URL"),
		"public platform origin used for oauth/verification links",
	)
	sharedUsername := flagSet.String(
		"shared-username",
		envOrDefault("", "DIFFAUDIT_SHARED_USERNAME"),
		"legacy shared account username (auto-bootstrapped at login)",
	)
	sharedPassword := flagSet.String(
		"shared-password",
		envOrDefault("", "DIFFAUDIT_SHARED_PASSWORD"),
		"legacy shared account password",
	)
	githubClientID := flagSet.String(
		"github-client-id",
		envOrDefault("", "GITHUB_CLIENT_ID"),
		"github oauth client id",
	)
	githubSecret := flagSet.String(
		"github-client-secret",
		envOrDefault("", "GITHUB_CLIENT_SECRET"),
		"github oauth client secret",
	)
	googleClientID := flagSet.String(
		"google-client-id",
		envOrDefault("", "GOOGLE_CLIENT_ID"),
		"google oauth client id",
	)
	googleSecret := flagSet.String(
		"google-client-secret",
		envOrDefault("", "GOOGLE_CLIENT_SECRET"),
		"google oauth client secret",
	)
	oauthProxyURL := flagSet.String(
		"oauth-proxy-url",
		envOrDefault("", "DIFFAUDIT_OAUTH_PROXY_URL"),
		"http(s) proxy used for oauth provider calls",
	)
	cookieSecure := flagSet.Bool(
		"cookie-secure",
		envOrDefault("", "NODE_ENV") == "production",
		"set the Secure attribute on session cookies",
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
		StaticDir:      *staticDir,
		DBPath:         *dbPath,
		PlatformURL:    *platformURL,
		SharedUsername: *sharedUsername,
		SharedPassword: *sharedPassword,
		GitHubClientID: *githubClientID,
		GitHubSecret:   *githubSecret,
		GoogleClientID: *googleClientID,
		GoogleSecret:   *googleSecret,
		OAuthProxyURL:  *oauthProxyURL,
		CookieSecure:   *cookieSecure,
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

	apiHandler := proxy.NewServer(proxy.Config{
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
	}).Handler()

	if config.DBPath != "" {
		authStore, err := auth.OpenStore(config.DBPath)
		if err != nil {
			fmt.Fprintf(os.Stderr, "open auth store: %v\n", err)
			os.Exit(1)
		}
		defer authStore.Close()
		if err := authStore.Migrate(context.Background()); err != nil {
			fmt.Fprintf(os.Stderr, "migrate auth store: %v\n", err)
			os.Exit(1)
		}

		authServer := auth.NewServer(auth.Options{
			Store:          authStore,
			PlatformURL:    config.PlatformURL,
			SharedUsername: config.SharedUsername,
			SharedPassword: config.SharedPassword,
			GitHubClientID: config.GitHubClientID,
			GitHubSecret:   config.GitHubSecret,
			GoogleClientID: config.GoogleClientID,
			GoogleSecret:   config.GoogleSecret,
			OAuthProxyURL:  config.OAuthProxyURL,
			CookieSecure:   config.CookieSecure,
		})
		authHandler := authServer.Routes()

		// Capture the pre-auth handler in a local so the later middleware
		// reassignments to apiHandler cannot create a handler loop.
		apiHandler = combineWithAuth(apiHandler, authHandler)
	}

	apiHandler = proxy.CORSMiddleware(proxy.CORSConfig{
		AllowedOrigins: allowedOrigins,
		Methods:        []string{"GET", "POST", "DELETE", "OPTIONS"},
		Headers:        []string{"Content-Type", "Authorization", "X-Request-ID"},
	})(apiHandler)
	apiHandler = proxy.RecoveryMiddleware()(apiHandler)
	apiHandler = proxy.NewStructuredLogger()(apiHandler)

	var handler http.Handler = apiHandler
	if config.StaticDir != "" {
		metaHandler := http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
			switch request.URL.Path {
			case "/robots.txt":
				static.RobotsHandler(config.PlatformURL).ServeHTTP(writer, request)
				return
			case "/sitemap.xml":
				static.SitemapHandler(config.PlatformURL).ServeHTTP(writer, request)
				return
			default:
				static.Wrap(apiHandler, config.StaticDir).ServeHTTP(writer, request)
			}
		})
		handler = metaHandler
	}

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

// combineWithAuth routes /api/auth/* to the auth handler and everything else
// to the API handler. Both handlers are captured by value so later wrapping
// cannot create a handler loop.
func combineWithAuth(apiHandler http.Handler, authHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(writer http.ResponseWriter, request *http.Request) {
		if strings.HasPrefix(request.URL.Path, "/api/auth/") {
			authHandler.ServeHTTP(writer, request)
			return
		}
		apiHandler.ServeHTTP(writer, request)
	})
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

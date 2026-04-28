package main

import "testing"

func TestParseConfigUsesDefaults(t *testing.T) {
	config, err := parseConfig([]string{})
	if err != nil {
		t.Fatalf("parseConfig returned error: %v", err)
	}
	if config.Host != defaultHost {
		t.Fatalf("expected default host %s, got %s", defaultHost, config.Host)
	}
	if config.Port != "8780" {
		t.Fatalf("expected default port 8780, got %s", config.Port)
	}
	if config.PublicDataDir != defaultPublicDataDir() {
		t.Fatalf("expected default public data dir %s, got %s", defaultPublicDataDir(), config.PublicDataDir)
	}
	if config.RuntimeBaseURL != "" {
		t.Fatalf("expected default runtime upstream url to be empty, got %s", config.RuntimeBaseURL)
	}
	if config.BuildRevision != "unknown" {
		t.Fatalf("expected default build revision unknown, got %s", config.BuildRevision)
	}
	if !config.DemoMode {
		t.Fatalf("expected demo mode enabled by default")
	}
}

func TestParseConfigAcceptsOverrides(t *testing.T) {
	config, err := parseConfig([]string{
		"--host", "0.0.0.0",
		"--port", "9002",
		"--public-data-dir", "./snapshots/public",
		"--runtime-base-url", "http://127.0.0.1:9999",
		"--build-revision", "abc123",
		"--build-date", "2026-04-29T00:00:00Z",
	})
	if err != nil {
		t.Fatalf("parseConfig returned error: %v", err)
	}
	if config.Host != "0.0.0.0" {
		t.Fatalf("expected host override, got %s", config.Host)
	}
	if config.Port != "9002" {
		t.Fatalf("expected port override, got %s", config.Port)
	}
	if config.PublicDataDir != "./snapshots/public" {
		t.Fatalf("expected public data dir override, got %s", config.PublicDataDir)
	}
	if config.RuntimeBaseURL != "http://127.0.0.1:9999" {
		t.Fatalf("expected upstream override, got %s", config.RuntimeBaseURL)
	}
	if config.BuildRevision != "abc123" {
		t.Fatalf("expected build revision override, got %s", config.BuildRevision)
	}
	if config.BuildDate != "2026-04-29T00:00:00Z" {
		t.Fatalf("expected build date override, got %s", config.BuildDate)
	}
}

func TestParseConfigAcceptsLegacyControlAPIFlag(t *testing.T) {
	config, err := parseConfig([]string{
		"--control-api-base-url", "http://127.0.0.1:8888",
	})
	if err != nil {
		t.Fatalf("parseConfig returned error: %v", err)
	}
	if config.RuntimeBaseURL != "http://127.0.0.1:8888" {
		t.Fatalf("expected legacy control alias to override runtime upstream, got %s", config.RuntimeBaseURL)
	}
}

func TestParseConfigAcceptsLegacyResearchAPIFlag(t *testing.T) {
	config, err := parseConfig([]string{
		"--research-api-base-url", "http://127.0.0.1:7777",
	})
	if err != nil {
		t.Fatalf("parseConfig returned error: %v", err)
	}
	if config.RuntimeBaseURL != "http://127.0.0.1:7777" {
		t.Fatalf("expected legacy alias to override runtime upstream, got %s", config.RuntimeBaseURL)
	}
}

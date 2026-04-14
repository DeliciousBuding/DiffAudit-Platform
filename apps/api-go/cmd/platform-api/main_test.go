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
	if config.ControlAPIBaseURL != "http://127.0.0.1:8765" {
		t.Fatalf("expected default control upstream url http://127.0.0.1:8765, got %s", config.ControlAPIBaseURL)
	}
}

func TestParseConfigAcceptsOverrides(t *testing.T) {
	config, err := parseConfig([]string{
		"--host", "0.0.0.0",
		"--port", "9002",
		"--public-data-dir", "D:/snapshots/public",
		"--control-api-base-url", "http://127.0.0.1:9999",
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
	if config.PublicDataDir != "D:/snapshots/public" {
		t.Fatalf("expected public data dir override, got %s", config.PublicDataDir)
	}
	if config.ControlAPIBaseURL != "http://127.0.0.1:9999" {
		t.Fatalf("expected upstream override, got %s", config.ControlAPIBaseURL)
	}
}

func TestParseConfigAcceptsLegacyResearchAPIFlag(t *testing.T) {
	config, err := parseConfig([]string{
		"--research-api-base-url", "http://127.0.0.1:7777",
	})
	if err != nil {
		t.Fatalf("parseConfig returned error: %v", err)
	}
	if config.ControlAPIBaseURL != "http://127.0.0.1:7777" {
		t.Fatalf("expected legacy alias to override control upstream, got %s", config.ControlAPIBaseURL)
	}
}

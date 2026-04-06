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
	if config.Port != defaultPort {
		t.Fatalf("expected default port %s, got %s", defaultPort, config.Port)
	}
	if config.ResearchAPIBaseURL != defaultResearchAPIBaseURL {
		t.Fatalf("expected default upstream url %s, got %s", defaultResearchAPIBaseURL, config.ResearchAPIBaseURL)
	}
}

func TestParseConfigAcceptsOverrides(t *testing.T) {
	config, err := parseConfig([]string{
		"--host", "0.0.0.0",
		"--port", "9002",
		"--research-api-base-url", "http://127.0.0.1:9999",
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
	if config.ResearchAPIBaseURL != "http://127.0.0.1:9999" {
		t.Fatalf("expected upstream override, got %s", config.ResearchAPIBaseURL)
	}
}

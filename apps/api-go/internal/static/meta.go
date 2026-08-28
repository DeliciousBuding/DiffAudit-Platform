package static

import (
	"encoding/xml"
	"fmt"
	"net/http"
	"strings"
)

// sitemapEntries are the public marketing/documentation routes, mirroring the
// legacy Next.js sitemap output. The origin is injected from
// DIFFAUDIT_PLATFORM_URL at startup so the public repository never carries a
// deployment-specific domain.
var sitemapEntries = []struct {
	Path     string
	Priority float64
	Freq     string
}{
	{Path: "", Priority: 1.0, Freq: "monthly"},
	{Path: "/docs", Priority: 0.9, Freq: "weekly"},
	{Path: "/trial", Priority: 0.7, Freq: "monthly"},
	{Path: "/login", Priority: 0.5, Freq: "monthly"},
	{Path: "/register", Priority: 0.5, Freq: "monthly"},
	{Path: "/docs/getting-started", Priority: 0.8, Freq: "monthly"},
	{Path: "/docs/architecture", Priority: 0.7, Freq: "monthly"},
	{Path: "/docs/attack-defense-matrix", Priority: 0.7, Freq: "monthly"},
}

type urlSet struct {
	XMLName xml.Name `xml:"urlset"`
	Xmlns   string   `xml:"xmlns,attr"`
	URLs    []urlEl  `xml:"url"`
}

type urlEl struct {
	Loc        string  `xml:"loc"`
	LastMod    string  `xml:"lastmod"`
	ChangeFreq string  `xml:"changefreq"`
	Priority   float64 `xml:"priority"`
}

// RobotsHandler serves robots.txt with the configured public origin so the
// sitemap link always points at the real deployment host.
func RobotsHandler(publicOrigin string) http.HandlerFunc {
	return func(writer http.ResponseWriter, _ *http.Request) {
		origin := normalizeOrigin(publicOrigin)
		writer.Header().Set("Content-Type", "text/plain; charset=utf-8")
		_, _ = fmt.Fprintf(writer, "User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /workspace/\n\nSitemap: %s/sitemap.xml\n", origin)
	}
}

// SitemapHandler serves sitemap.xml with the configured public origin.
func SitemapHandler(publicOrigin string) http.HandlerFunc {
	return func(writer http.ResponseWriter, _ *http.Request) {
		origin := normalizeOrigin(publicOrigin)
		urls := make([]urlEl, 0, len(sitemapEntries))
		for _, entry := range sitemapEntries {
			urls = append(urls, urlEl{
				Loc:        origin + entry.Path,
				LastMod:    "2026-08-28",
				ChangeFreq: entry.Freq,
				Priority:   entry.Priority,
			})
		}
		writer.Header().Set("Content-Type", "application/xml; charset=utf-8")
		_ = xml.NewEncoder(writer).Encode(urlSet{
			Xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
			URLs:  urls,
		})
	}
}

func normalizeOrigin(value string) string {
	trimmed := strings.TrimRight(strings.TrimSpace(value), "/")
	if trimmed == "" {
		return "https://platform.example.com"
	}
	return trimmed
}

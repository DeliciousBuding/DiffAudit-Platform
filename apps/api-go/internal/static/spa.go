package static

import (
	"mime"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

// Wrap serves the SPA build from root while leaving API and health paths to
// the underlying handler. Unknown paths fall back to index.html so client
// routes (/workspace/*) work on deep links.
func Wrap(api http.Handler, root string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") || r.URL.Path == "/health" {
			api.ServeHTTP(w, r)
			return
		}

		rel := strings.TrimPrefix(path.Clean("/"+r.URL.Path), "/")
		full := filepath.Join(root, filepath.FromSlash(rel))
		info, err := os.Stat(full)
		if err != nil || info.IsDir() {
			if strings.HasPrefix(rel, ".") {
				http.NotFound(w, r)
				return
			}
			full = filepath.Join(root, "index.html")
			w.Header().Set("Cache-Control", "no-cache")
		}

		if ext := filepath.Ext(full); ext != "" {
			if ctype := mime.TypeByExtension(ext); ctype != "" {
				w.Header().Set("Content-Type", ctype)
			}
		}

		http.ServeFile(w, r, full)
	})
}

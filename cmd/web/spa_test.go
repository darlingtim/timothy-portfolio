package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestServeSinglePageAppFallsBackToIndexHTML(t *testing.T) {
	distDir := t.TempDir()
	indexPath := filepath.Join(distDir, "index.html")
	if err := os.WriteFile(indexPath, []byte("<html>SPA</html>"), 0o644); err != nil {
		t.Fatalf("write index.html: %v", err)
	}

	req := httptest.NewRequest(http.MethodGet, "/dashboard", nil)
	res := httptest.NewRecorder()

	serveSinglePageApp(res, req, distDir)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}

	if body := res.Body.String(); body != "<html>SPA</html>" {
		t.Fatalf("expected SPA fallback html, got %q", body)
	}
}

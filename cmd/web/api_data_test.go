package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestPortfolioDataAPIHandlesGetAndPost(t *testing.T) {
	tempDir := t.TempDir()
	contentDir := filepath.Join(tempDir, "content")
	if err := os.MkdirAll(contentDir, 0o755); err != nil {
		t.Fatalf("mkdir content: %v", err)
	}

	filePath := filepath.Join(contentDir, "portfolio_data.json")
	if err := os.WriteFile(filePath, []byte(`{"profile":{"name":"Initial"}}`), 0o644); err != nil {
		t.Fatalf("write initial data: %v", err)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/api/data", nil)
	getRes := httptest.NewRecorder()
	handlePortfolioDataGet(getRes, getReq, contentDir)

	if getRes.Code != http.StatusOK {
		t.Fatalf("expected get status 200, got %d", getRes.Code)
	}

	var getPayload map[string]any
	if err := json.Unmarshal(getRes.Body.Bytes(), &getPayload); err != nil {
		t.Fatalf("decode get payload: %v", err)
	}
	if getPayload["success"] != true {
		t.Fatalf("expected success=true, got %v", getPayload["success"])
	}

	postBody := `{"settings":{"siteTitle":"Night Default"}}`
	postReq := httptest.NewRequest(http.MethodPost, "/api/data", strings.NewReader(postBody))
	postReq.Header.Set("Content-Type", "application/json")
	postRes := httptest.NewRecorder()
	handlePortfolioDataPost(postRes, postReq, contentDir)

	if postRes.Code != http.StatusOK {
		t.Fatalf("expected post status 200, got %d", postRes.Code)
	}

	updatedBytes, err := os.ReadFile(filePath)
	if err != nil {
		t.Fatalf("read updated file: %v", err)
	}
	if !strings.Contains(string(updatedBytes), "Night Default") {
		t.Fatalf("expected payload to be saved, got: %s", string(updatedBytes))
	}
}

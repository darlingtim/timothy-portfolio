package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"timothy-portfolio/internal/config"
	"timothy-portfolio/internal/models"
	"timothy-portfolio/internal/services"
)

func setupTestHandler(t *testing.T) *Handler {
	cfg := &config.Config{
		Port:         "8080",
		AppEnv:       "test",
		ContactEmail: "test@example.com",
		MaxBodyBytes: 64 * 1024,
	}

	contentDir := filepath.Join("..", "..", "content")
	// If running from package directory or root directory
	if _, err := os.Stat(contentDir); os.IsNotExist(err) {
		contentDir = "content"
	}

	contentSvc, err := services.NewContentService(contentDir)
	if err != nil {
		t.Fatalf("failed to create content service: %v", err)
	}

	templatesDir := filepath.Join("..", "..", "templates")
	if _, err := os.Stat(templatesDir); os.IsNotExist(err) {
		templatesDir = "templates"
	}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	h, err := New(cfg, contentSvc, templatesDir, logger)
	if err != nil {
		t.Fatalf("failed to initialize handler: %v", err)
	}

	return h
}

func TestHealthEndpoint(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()

	h.Health(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status OK (200), got %d", rr.Code)
	}

	var res map[string]interface{}
	if err := json.NewDecoder(rr.Body).Decode(&res); err != nil {
		t.Fatalf("invalid json response: %v", err)
	}

	if res["status"] != "ok" {
		t.Errorf("expected status 'ok', got %v", res["status"])
	}
}

func TestHomeRoute(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rr := httptest.NewRecorder()

	h.Home(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status OK (200), got %d", rr.Code)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "Timothy Ododo") {
		t.Errorf("expected response body to contain 'Timothy Ododo'")
	}
	if !strings.Contains(body, "Technology Mentor &amp; Advocate") && !strings.Contains(body, "Technology Mentor & Advocate") {
		t.Errorf("expected response to contain brand positioning title")
	}
}

func TestProjectsAPI(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest(http.MethodGet, "/api/projects", nil)
	rr := httptest.NewRecorder()

	h.APIProjects(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status OK (200), got %d", rr.Code)
	}

	var projects []models.Project
	if err := json.NewDecoder(rr.Body).Decode(&projects); err != nil {
		t.Fatalf("failed to decode JSON projects: %v", err)
	}

	if len(projects) == 0 {
		t.Errorf("expected non-empty projects list")
	}
}

func TestProjectDetailFound(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest(http.MethodGet, "/projects/go-portfolio-service", nil)
	rr := httptest.NewRecorder()

	h.ProjectDetail(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status OK (200), got %d", rr.Code)
	}

	body := rr.Body.String()
	if !strings.Contains(body, "Go net/http") && !strings.Contains(body, "portfolio") {
		t.Errorf("expected project detail content in response")
	}
}

func TestProjectDetailNotFound(t *testing.T) {
	h := setupTestHandler(t)

	req := httptest.NewRequest(http.MethodGet, "/projects/non-existent-slug-xyz", nil)
	rr := httptest.NewRecorder()

	h.ProjectDetail(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Errorf("expected status NotFound (404), got %d", rr.Code)
	}
}

func TestContactValidationSuccess(t *testing.T) {
	h := setupTestHandler(t)

	payload := map[string]string{
		"name":    "Ada Lovelace",
		"email":   "ada@example.com",
		"subject": "Mentorship Inquiry",
		"message": "Hello Timothy, I would love to connect regarding technology mentorship.",
	}
	data, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/contact", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleContactSubmit(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status OK (200), got %d", rr.Code)
	}

	var res map[string]interface{}
	json.NewDecoder(rr.Body).Decode(&res)
	if res["success"] != true {
		t.Errorf("expected success true, got %v", res["success"])
	}
}

func TestContactHoneypotSpamRejection(t *testing.T) {
	h := setupTestHandler(t)

	// Spammer filling hidden honeypot website field
	form := url.Values{}
	form.Set("name", "Bot")
	form.Set("email", "bot@spam.com")
	form.Set("subject", "Crypto")
	form.Set("message", "Buy cheap coins now")
	form.Set("website", "http://spam-site.com")

	req := httptest.NewRequest(http.MethodPost, "/contact", strings.NewReader(form.Encode()))
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	rr := httptest.NewRecorder()

	h.HandleContactSubmit(rr, req)

	// Should safely redirect without triggering errors or sending message
	if rr.Code != http.StatusSeeOther {
		t.Errorf("expected redirect (303), got %d", rr.Code)
	}
}

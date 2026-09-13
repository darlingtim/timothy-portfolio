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

func TestContactPersistsMessageRecord(t *testing.T) {
	tempContent := t.TempDir()
	cfg := &config.Config{Port: "8080", AppEnv: "test", ContactEmail: "test@example.com", MaxBodyBytes: 64 * 1024}
	contentSvc, err := services.NewContentService(tempContent)
	if err != nil {
		t.Fatalf("content service: %v", err)
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	h, err := New(cfg, contentSvc, "", logger)
	if err != nil {
		t.Fatalf("new handler: %v", err)
	}

	payload := map[string]string{
		"name":    "Grace Hopper",
		"email":   "grace@example.com",
		"subject": "Compiler Question",
		"message": "Hello Timothy, let us discuss compiler development and systems.",
	}
	data, _ := json.Marshal(payload)

	req := httptest.NewRequest(http.MethodPost, "/api/contact", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleContactSubmit(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status OK (200), got %d", rr.Code)
	}

	var res map[string]any
	if err := json.NewDecoder(rr.Body).Decode(&res); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if res["success"] != true {
		t.Fatalf("expected success=true")
	}
	msgRecord, ok := res["messageRecord"].(map[string]any)
	if !ok {
		t.Fatalf("expected messageRecord in response")
	}
	if msgRecord["name"] != "Grace Hopper" {
		t.Errorf("expected name Grace Hopper, got %v", msgRecord["name"])
	}

	// Verify persistence in portfolio_data.json
	dataBytes, err := os.ReadFile(filepath.Join(tempContent, "portfolio_data.json"))
	if err != nil {
		t.Fatalf("read portfolio_data.json: %v", err)
	}
	var stored map[string]any
	if err := json.Unmarshal(dataBytes, &stored); err != nil {
		t.Fatalf("unmarshal portfolio_data.json: %v", err)
	}
	messages, ok := stored["messages"].([]any)
	if !ok || len(messages) == 0 {
		t.Fatalf("expected messages array with at least 1 message")
	}
}

func TestHandleReplySuccess(t *testing.T) {
	tempContent := t.TempDir()
	cfg := &config.Config{Port: "8080", AppEnv: "test", ContactEmail: "test@example.com", MaxBodyBytes: 64 * 1024}
	contentSvc, err := services.NewContentService(tempContent)
	if err != nil {
		t.Fatalf("content service: %v", err)
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	h, err := New(cfg, contentSvc, "", logger)
	if err != nil {
		t.Fatalf("new handler: %v", err)
	}

	// Seed portfolio_data.json with an existing message
	initialData := map[string]any{
		"messages": []any{
			map[string]any{
				"id":      "msg-12345",
				"name":    "Alan Turing",
				"email":   "alan@enigma.org",
				"subject": "Decryption question",
				"message": "Let us collaborate on computational machinery.",
				"isRead":  false,
				"status":  "New",
			},
		},
	}
	initBytes, _ := json.Marshal(initialData)
	_ = os.WriteFile(filepath.Join(tempContent, "portfolio_data.json"), initBytes, 0o644)

	replyPayload := map[string]string{
		"to":                "alan@enigma.org",
		"toName":            "Alan Turing",
		"subject":           "Re: Decryption question",
		"body":              "Happy to collaborate on this!",
		"originalMessageId": "msg-12345",
	}
	bodyBytes, _ := json.Marshal(replyPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/reply", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleReply(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d: %s", rr.Code, rr.Body.String())
	}

	var res map[string]any
	json.NewDecoder(rr.Body).Decode(&res)
	if res["success"] != true {
		t.Fatalf("expected success=true")
	}

	// Check updated data on disk
	dataBytes, _ := os.ReadFile(filepath.Join(tempContent, "portfolio_data.json"))
	var updated map[string]any
	json.Unmarshal(dataBytes, &updated)
	msgs := updated["messages"].([]any)
	msg := msgs[0].(map[string]any)
	if msg["status"] != "Replied" {
		t.Errorf("expected status 'Replied', got %v", msg["status"])
	}
	if msg["isRead"] != true {
		t.Errorf("expected isRead true, got %v", msg["isRead"])
	}
	replies := msg["replies"].([]any)
	if len(replies) != 1 {
		t.Fatalf("expected 1 reply in replies array, got %d", len(replies))
	}
}

func TestHandleReplyValidationFailure(t *testing.T) {
	h := setupTestHandler(t)

	// Missing recipient email
	invalidPayload := map[string]string{
		"to":   "",
		"body": "Some body",
	}
	bodyBytes, _ := json.Marshal(invalidPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/reply", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleReply(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 Bad Request, got %d", rr.Code)
	}
}

func TestHandleUploadPhoto(t *testing.T) {
	tempContent := t.TempDir()
	cfg := &config.Config{Port: "8080", AppEnv: "test", ContactEmail: "test@example.com", MaxBodyBytes: 64 * 1024}
	contentSvc, err := services.NewContentService(tempContent)
	if err != nil {
		t.Fatalf("content service: %v", err)
	}
	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	h, err := New(cfg, contentSvc, "", logger)
	if err != nil {
		t.Fatalf("new handler: %v", err)
	}

	uploadPayload := map[string]any{
		"imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==",
		"filename":  "profile.png",
		"isAvatar":  true,
		"caption":   "Timothy Ododo",
	}
	data, _ := json.Marshal(uploadPayload)

	req := httptest.NewRequest(http.MethodPost, "/api/upload-photo", bytes.NewBuffer(data))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.HandleUploadPhoto(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	var res map[string]any
	json.NewDecoder(rr.Body).Decode(&res)
	if res["success"] != true {
		t.Fatalf("expected success=true")
	}

	// Verify avatarUrl saved in portfolio_data.json
	dataBytes, _ := os.ReadFile(filepath.Join(tempContent, "portfolio_data.json"))
	var stored map[string]any
	json.Unmarshal(dataBytes, &stored)
	profile := stored["profile"].(map[string]any)
	if !strings.HasPrefix(profile["avatarUrl"].(string), "/static/images/") {
		t.Errorf("expected avatarUrl under /static/images/, got: %v", profile["avatarUrl"])
	}
}


package handlers

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"timothy-portfolio/internal/config"
	"timothy-portfolio/internal/services"
)

func setupAuthTestHandler(t *testing.T) (*Handler, string) {
	t.Helper()
	tempDir := t.TempDir()
	contentDir := filepath.Join(tempDir, "content")
	_ = os.MkdirAll(contentDir, 0o755)

	contentSvc, err := services.NewContentService(contentDir)
	if err != nil {
		t.Fatalf("failed to init content service: %v", err)
	}

	cfg := &config.Config{
		AdminEmail:        "timothyododo@gmail.com",
		AdminPassword:     "Timothy@2025",
		Admin2FAPhone:     "+2348140004589",
		AdminRecoveryCode: "12345678",
	}

	logger := slog.New(slog.NewTextHandler(io.Discard, nil))
	h, err := New(cfg, contentSvc, "", logger)
	if err != nil {
		t.Fatalf("failed to init handler: %v", err)
	}

	return h, tempDir
}

func TestAuthFlow(t *testing.T) {
	h, _ := setupAuthTestHandler(t)

	// 1. Invalid Login
	invalidBody, _ := json.Marshal(map[string]string{
		"email":    "wrong@example.com",
		"password": "wrongpassword",
	})
	req := httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(invalidBody))
	w := httptest.NewRecorder()
	h.HandleAuthLogin(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 on invalid login, got %d", w.Code)
	}

	// 2. Valid Login
	validBody, _ := json.Marshal(map[string]string{
		"email":    "timothyododo@gmail.com",
		"password": "Timothy@2025",
		"channel":  "email",
	})
	req = httptest.NewRequest(http.MethodPost, "/api/auth/login", bytes.NewReader(validBody))
	w = httptest.NewRecorder()
	h.HandleAuthLogin(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on valid login, got %d", w.Code)
	}

	var loginResp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &loginResp); err != nil {
		t.Fatalf("failed to parse login response: %v", err)
	}

	tempToken, ok := loginResp["tempToken"].(string)
	if !ok || tempToken == "" {
		t.Fatalf("expected tempToken in response, got %v", loginResp)
	}

	// Inspect pending OTP
	activeOTPsMu.RLock()
	pending := activeOTPs[tempToken]
	activeOTPsMu.RUnlock()
	if pending == nil {
		t.Fatalf("pending OTP not found for tempToken")
	}

	// 3. Verify with wrong code
	wrongVerify, _ := json.Marshal(map[string]string{
		"tempToken": tempToken,
		"code":      "000000",
	})
	req = httptest.NewRequest(http.MethodPost, "/api/auth/verify-2fa", bytes.NewReader(wrongVerify))
	w = httptest.NewRecorder()
	h.HandleAuthVerify2FA(w, req)

	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 on wrong code, got %d", w.Code)
	}

	// 4. Verify with correct OTP code
	correctVerify, _ := json.Marshal(map[string]string{
		"tempToken": tempToken,
		"code":      pending.Code,
	})
	req = httptest.NewRequest(http.MethodPost, "/api/auth/verify-2fa", bytes.NewReader(correctVerify))
	w = httptest.NewRecorder()
	h.HandleAuthVerify2FA(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on valid 2FA, got %d: %s", w.Code, w.Body.String())
	}

	var verifyResp map[string]any
	if err := json.Unmarshal(w.Body.Bytes(), &verifyResp); err != nil {
		t.Fatalf("failed to parse verify response: %v", err)
	}

	adminToken, ok := verifyResp["adminToken"].(string)
	if !ok || adminToken == "" {
		t.Fatalf("expected adminToken in response, got %v", verifyResp)
	}

	// 5. Check Session with admin token
	req = httptest.NewRequest(http.MethodGet, "/api/auth/session", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	w = httptest.NewRecorder()
	h.HandleAuthSession(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on session check, got %d", w.Code)
	}

	var sessionResp map[string]any
	_ = json.Unmarshal(w.Body.Bytes(), &sessionResp)
	if sessionResp["authenticated"] != true {
		t.Fatalf("expected authenticated=true, got %v", sessionResp)
	}

	// 6. Logout
	req = httptest.NewRequest(http.MethodPost, "/api/auth/logout", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	w = httptest.NewRecorder()
	h.HandleAuthLogout(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected 200 on logout, got %d", w.Code)
	}

	// 7. Verify session revoked
	req = httptest.NewRequest(http.MethodGet, "/api/auth/session", nil)
	req.Header.Set("Authorization", "Bearer "+adminToken)
	w = httptest.NewRecorder()
	h.HandleAuthSession(w, req)

	_ = json.Unmarshal(w.Body.Bytes(), &sessionResp)
	if sessionResp["authenticated"] != false {
		t.Fatalf("expected authenticated=false after logout, got %v", sessionResp)
	}
}

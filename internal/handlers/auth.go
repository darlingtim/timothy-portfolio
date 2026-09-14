package handlers

import (
	"bytes"
	"crypto/rand"
	"crypto/tls"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"net/smtp"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"
)

// Auth payloads
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Channel  string `json:"channel"`
}

type SendOTPRequest struct {
	TempToken string `json:"tempToken"`
	Channel   string `json:"channel"`
}

type Verify2FARequest struct {
	TempToken string `json:"tempToken"`
	Code      string `json:"code"`
}

type PendingOTP struct {
	Email     string
	Phone     string
	Code      string
	Channel   string
	CreatedAt time.Time
	ExpiresAt time.Time
	Attempts  int
}

type AdminSession struct {
	Email     string
	CreatedAt time.Time
	ExpiresAt time.Time
	Role      string
}

var (
	activeOTPsMu     sync.RWMutex
	activeOTPs       = make(map[string]*PendingOTP)
	activeSessionsMu sync.RWMutex
	activeSessions   = make(map[string]*AdminSession)
)

func maskEmail(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) != 2 {
		return "t***o@gmail.com"
	}
	name := parts[0]
	domain := parts[1]
	if len(name) <= 2 {
		return string(name[0]) + "***@" + domain
	}
	return string(name[0]) + "***" + string(name[len(name)-1]) + "@" + domain
}

func maskPhone(phone string) string {
	if len(phone) < 8 {
		return "+234 ••• ••• 0002"
	}
	prefix := phone[:4]
	suffix := phone[len(phone)-4:]
	return prefix + " ••• ••• " + suffix
}

func generateRandomHex(n int) string {
	bytes := make([]byte, n)
	if _, err := rand.Read(bytes); err != nil {
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(bytes)
}

func generateOTP() string {
	max := big.NewInt(900000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	}
	return fmt.Sprintf("%06d", n.Int64()+100000)
}

// CheckAdminAuth validates request Authorization header
func (h *Handler) CheckAdminAuth(r *http.Request) bool {
	authHeader := r.Header.Get("Authorization")
	var token string
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		token = r.Header.Get("x-admin-token")
	}

	token = strings.TrimSpace(token)
	if token == "" {
		return false
	}

	activeSessionsMu.RLock()
	session, exists := activeSessions[token]
	activeSessionsMu.RUnlock()

	if !exists {
		return false
	}

	if time.Now().After(session.ExpiresAt) {
		activeSessionsMu.Lock()
		delete(activeSessions, token)
		activeSessionsMu.Unlock()
		return false
	}

	return true
}

// HandleAuthLogin handles POST /api/auth/login
func (h *Handler) HandleAuthLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{"error": "Email and password are required."})
		return
	}

	cleanEmail := strings.ToLower(strings.TrimSpace(req.Email))
	adminEmail := strings.ToLower(strings.TrimSpace(h.cfg.AdminEmail))
	if adminEmail == "" {
		adminEmail = "timothyododo@gmail.com"
	}

	isEmailValid := cleanEmail == adminEmail || cleanEmail == "timothyododo@gmail.com"
	isPasswordValid := req.Password == h.cfg.AdminPassword

	if !isEmailValid || !isPasswordValid {
		h.logger.Warn("failed admin login attempt", "email", maskEmail(cleanEmail), "remote_ip", r.RemoteAddr)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": "Invalid admin credentials. Please verify your email and password.",
		})
		return
	}

	otpCode := generateOTP()
	tempToken := generateRandomHex(24)
	channel := "email"
	if req.Channel == "sms" {
		channel = "sms"
	}

	destination := cleanEmail
	if channel == "sms" {
		destination = h.cfg.Admin2FAPhone
	}

	pending := &PendingOTP{
		Email:     cleanEmail,
		Phone:     h.cfg.Admin2FAPhone,
		Code:      otpCode,
		Channel:   channel,
		CreatedAt: time.Now(),
		ExpiresAt: time.Now().Add(5 * time.Minute),
		Attempts:  0,
	}

	activeOTPsMu.Lock()
	activeOTPs[tempToken] = pending
	activeOTPsMu.Unlock()

	// Dispatch OTP
	go h.DispatchOTP(channel, destination, otpCode)

	h.logger.Info("admin 2FA OTP dispatched", "channel", channel, "target", maskEmail(destination))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success":     true,
		"require2FA":  true,
		"tempToken":   tempToken,
		"maskedEmail": maskEmail(cleanEmail),
		"maskedPhone": maskPhone(h.cfg.Admin2FAPhone),
		"channel":     channel,
	})
}

// HandleAuthSendOTP handles POST /api/auth/send-otp
func (h *Handler) HandleAuthSendOTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req SendOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{"error": "Invalid request payload."})
		return
	}

	activeOTPsMu.Lock()
	pending, exists := activeOTPs[req.TempToken]
	if !exists || time.Now().After(pending.ExpiresAt) {
		if exists {
			delete(activeOTPs, req.TempToken)
		}
		activeOTPsMu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": "Invalid or expired 2FA session. Please log in again.",
		})
		return
	}

	newOtp := generateOTP()
	channel := "email"
	if req.Channel == "sms" {
		channel = "sms"
	}
	destination := pending.Email
	if channel == "sms" {
		destination = pending.Phone
	}

	pending.Code = newOtp
	pending.Channel = channel
	pending.ExpiresAt = time.Now().Add(5 * time.Minute)
	pending.Attempts = 0
	activeOTPsMu.Unlock()

	go h.DispatchOTP(channel, destination, newOtp)

	channelName := "Gmail OTP"
	if channel == "sms" {
		channelName = "SMS OTP"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"message": fmt.Sprintf("Verification code sent via %s", channelName),
		"channel": channel,
	})
}

// HandleAuthVerify2FA handles POST /api/auth/verify-2fa
func (h *Handler) HandleAuthVerify2FA(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req Verify2FARequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{"error": "2FA session token and verification code are required."})
		return
	}

	activeOTPsMu.Lock()
	pending, exists := activeOTPs[req.TempToken]
	if !exists {
		activeOTPsMu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": "2FA session has expired or is invalid. Please sign in again.",
		})
		return
	}

	if time.Now().After(pending.ExpiresAt) {
		delete(activeOTPs, req.TempToken)
		activeOTPsMu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": "Verification code has expired. Please request a new code.",
		})
		return
	}

	if pending.Attempts >= 5 {
		delete(activeOTPs, req.TempToken)
		activeOTPsMu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusTooManyRequests)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": "Too many failed verification attempts. Please sign in again.",
		})
		return
	}

	cleanCode := strings.TrimSpace(req.Code)
	hasCustomRecovery := len(h.cfg.AdminRecoveryCode) >= 8
	isRecovery := hasCustomRecovery && cleanCode == h.cfg.AdminRecoveryCode
	isOtpValid := cleanCode == pending.Code

	if !isOtpValid && !isRecovery {
		pending.Attempts++
		remaining := 5 - pending.Attempts
		activeOTPsMu.Unlock()
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]any{
			"error": fmt.Sprintf("Invalid verification code. (%d attempts remaining)", remaining),
		})
		return
	}

	// 2FA Verified! Cleanup pending
	delete(activeOTPs, req.TempToken)
	activeOTPsMu.Unlock()

	adminToken := "adm_" + generateRandomHex(32)
	expiresAt := time.Now().Add(24 * time.Hour)

	activeSessionsMu.Lock()
	activeSessions[adminToken] = &AdminSession{
		Email:     pending.Email,
		CreatedAt: time.Now(),
		ExpiresAt: expiresAt,
		Role:      "super_admin",
	}
	activeSessionsMu.Unlock()

	h.logger.Info("admin 2FA verified successfully", "email", maskEmail(pending.Email))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success":    true,
		"adminToken": adminToken,
		"expiresAt":  expiresAt.UnixMilli(),
		"user": map[string]any{
			"email":       h.cfg.AdminEmail,
			"name":        "Timothy Ododo",
			"role":        "super_admin",
			"verified2FA": true,
		},
	})
}

// HandleAuthSession handles GET /api/auth/session
func (h *Handler) HandleAuthSession(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	isAuth := h.CheckAdminAuth(r)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)

	if isAuth {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"authenticated": true,
			"user": map[string]any{
				"email":       h.cfg.AdminEmail,
				"name":        "Timothy Ododo",
				"role":        "super_admin",
				"verified2FA": true,
			},
		})
	} else {
		_ = json.NewEncoder(w).Encode(map[string]any{
			"authenticated": false,
			"user":          nil,
		})
	}
}

// HandleAuthLogout handles POST /api/auth/logout
func (h *Handler) HandleAuthLogout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	authHeader := r.Header.Get("Authorization")
	var token string
	if strings.HasPrefix(authHeader, "Bearer ") {
		token = strings.TrimPrefix(authHeader, "Bearer ")
	} else {
		token = r.Header.Get("x-admin-token")
	}

	token = strings.TrimSpace(token)
	if token != "" {
		activeSessionsMu.Lock()
		delete(activeSessions, token)
		activeSessionsMu.Unlock()
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"message": "Logged out successfully.",
	})
}

// HandleMailStatus handles GET /api/mail/status
func (h *Handler) HandleMailStatus(w http.ResponseWriter, r *http.Request) {
	hasPass := strings.TrimSpace(h.cfg.SMTPPass) != ""
	hasResend := strings.TrimSpace(h.cfg.ResendAPIKey) != ""

	provider := "none"
	if hasPass {
		provider = "smtp"
	} else if hasResend {
		provider = "resend"
	}

	instructions := "Pending configuration: Provide SMTP_PASS (or GMAIL_APP_PASSWORD) in environment settings to enable live Gmail forwarding to your inbox."
	if hasPass || hasResend {
		instructions = "Active: Real email dispatch is configured."
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"configured":   hasPass || hasResend,
		"provider":     provider,
		"smtpUser":     maskEmail(h.cfg.SMTPUser),
		"smtpHost":     h.cfg.SMTPHost,
		"instructions": instructions,
	})
}

// DispatchOTP sends the code via email or SMS
func (h *Handler) DispatchOTP(channel, target, otpCode string) {
	if channel == "email" {
		subject := fmt.Sprintf("Your Admin Verification Code: %s", otpCode)
		text := fmt.Sprintf("Hello Timothy,\n\nYour Portfolio Admin 2FA verification code is: %s\n\nThis code will expire in 5 minutes.\n\nTimothy Ododo Portfolio Security System", otpCode)
		h.SendEmailNotification(target, subject, text, "", target, "Timothy Ododo Security")
		return
	}

	// SMS via Termii
	if channel == "sms" && h.cfg.TermiiAPIKey != "" {
		cleanPhone := strings.ReplaceAll(target, "+", "")
		payload, _ := json.Marshal(map[string]any{
			"to":      cleanPhone,
			"from":    "Timothy",
			"sms":     fmt.Sprintf("Your Timothy Ododo Portfolio 2FA code is: %s. Valid for 5 mins.", otpCode),
			"type":    "plain",
			"channel": "generic",
			"api_key": h.cfg.TermiiAPIKey,
		})
		_, _ = http.Post("https://api.ng.termii.com/api/sms/send", "application/json", bytes.NewReader(payload))
		return
	}

	// SMS via Twilio
	if channel == "sms" && h.cfg.TwilioAccountSID != "" && h.cfg.TwilioAuthToken != "" && h.cfg.TwilioFromPhone != "" {
		data := url.Values{}
		data.Set("To", target)
		data.Set("From", h.cfg.TwilioFromPhone)
		data.Set("Body", fmt.Sprintf("Your Timothy Ododo Portfolio 2FA code is: %s. Valid for 5 mins.", otpCode))

		endpoint := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", h.cfg.TwilioAccountSID)
		req, err := http.NewRequest(http.MethodPost, endpoint, strings.NewReader(data.Encode()))
		if err == nil {
			req.SetBasicAuth(h.cfg.TwilioAccountSID, h.cfg.TwilioAuthToken)
			req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
			_, _ = http.DefaultClient.Do(req)
		}
	}
}

// SendEmailNotification sends an email via SMTP or Resend
func (h *Handler) SendEmailNotification(to, subject, text, html, replyTo, fromName string) bool {
	smtpUser := h.cfg.SMTPUser
	smtpPass := strings.TrimSpace(h.cfg.SMTPPass)
	smtpHost := h.cfg.SMTPHost
	smtpPort := h.cfg.SMTPPort

	if fromName == "" {
		fromName = "Timothy Ododo Portfolio"
	}

	// 1. SMTP dispatch
	if smtpPass != "" {
		auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
		fromHeader := fmt.Sprintf("%s <%s>", fromName, smtpUser)
		var msg bytes.Buffer
		msg.WriteString(fmt.Sprintf("From: %s\r\n", fromHeader))
		msg.WriteString(fmt.Sprintf("To: %s\r\n", to))
		if replyTo != "" {
			msg.WriteString(fmt.Sprintf("Reply-To: %s\r\n", replyTo))
		}
		msg.WriteString(fmt.Sprintf("Subject: %s\r\n", subject))
		msg.WriteString("MIME-Version: 1.0\r\n")
		if html != "" {
			msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n\r\n")
			msg.WriteString(html)
		} else {
			msg.WriteString("Content-Type: text/plain; charset=UTF-8\r\n\r\n")
			msg.WriteString(text)
		}

		addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
		// TLS support if port 465
		if smtpPort == "465" {
			tlsConfig := &tls.Config{ServerName: smtpHost}
			conn, err := tls.Dial("tcp", addr, tlsConfig)
			if err == nil {
				client, err := smtp.NewClient(conn, smtpHost)
				if err == nil {
					if err = client.Auth(auth); err == nil {
						if err = client.Mail(smtpUser); err == nil {
							if err = client.Rcpt(to); err == nil {
								w, err := client.Data()
								if err == nil {
									_, _ = w.Write(msg.Bytes())
									_ = w.Close()
									_ = client.Quit()
									h.logger.Info("email delivered via SMTP TLS", "to", maskEmail(to))
									return true
								}
							}
						}
					}
				}
			}
		}

		err := smtp.SendMail(addr, auth, smtpUser, []string{to}, msg.Bytes())
		if err == nil {
			h.logger.Info("email delivered via SMTP", "to", maskEmail(to))
			return true
		}
		h.logger.Warn("SMTP dispatch failed", "err", err, "to", maskEmail(to))
	}

	// 2. Resend API
	if h.cfg.ResendAPIKey != "" {
		bodyMap := map[string]any{
			"from":    fmt.Sprintf("%s <onboarding@resend.dev>", fromName),
			"to":      []string{to},
			"subject": subject,
		}
		if html != "" {
			bodyMap["html"] = html
		} else {
			bodyMap["text"] = text
		}
		if replyTo != "" {
			bodyMap["reply_to"] = replyTo
		}

		payload, _ := json.Marshal(bodyMap)
		req, err := http.NewRequest(http.MethodPost, "https://api.resend.com/emails", bytes.NewReader(payload))
		if err == nil {
			req.Header.Set("Authorization", "Bearer "+h.cfg.ResendAPIKey)
			req.Header.Set("Content-Type", "application/json")
			resp, err := http.DefaultClient.Do(req)
			if err == nil && resp.StatusCode >= 200 && resp.StatusCode < 300 {
				h.logger.Info("email delivered via Resend", "to", maskEmail(to))
				return true
			}
		}
	}

	return false
}

// HandleImagesList handles GET /api/images
func (h *Handler) HandleImagesList(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	staticImagesDir := filepath.Join(".", "static", "images")
	categories := []string{"profile", "projects", "mentoring", "events", "achievements", "certifications", "gallery", "general"}
	var result []map[string]any

	for _, cat := range categories {
		dir := filepath.Join(staticImagesDir, cat)
		entries, err := os.ReadDir(dir)
		if err != nil {
			continue
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			name := e.Name()
			info, _ := e.Info()
			size := int64(0)
			modTime := time.Now()
			if info != nil {
				size = info.Size()
				modTime = info.ModTime()
			}
			url := fmt.Sprintf("/static/images/%s/%s", cat, name)
			result = append(result, map[string]any{
				"url":          url,
				"filename":     name,
				"category":     cat,
				"size":         size,
				"lastModified": modTime.Format(time.RFC3339),
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"images":  result,
	})
}

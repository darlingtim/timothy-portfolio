package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds runtime configuration loaded from environment variables
type Config struct {
	Port              string
	AppEnv            string
	ContactEmail      string
	AdminEmail        string
	AdminPassword     string
	Admin2FAPhone     string
	AdminRecoveryCode string
	SMTPHost          string
	SMTPPort          string
	SMTPUser          string
	SMTPPass          string
	ResendAPIKey      string
	TermiiAPIKey      string
	TwilioAccountSID  string
	TwilioAuthToken   string
	TwilioFromPhone   string
	ReadTimeout       time.Duration
	WriteTimeout      time.Duration
	IdleTimeout       time.Duration
	MaxBodyBytes      int64
	EnableAnalytics   bool
}

// Load loads configuration from environment variables with sensible defaults
func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = "production"
	}

	contactEmail := os.Getenv("CONTACT_EMAIL")
	if contactEmail == "" {
		contactEmail = "timothyododo@gmail.com"
	}

	adminEmail := os.Getenv("ADMIN_EMAIL")
	if adminEmail == "" {
		adminEmail = "timothyododo@gmail.com"
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "Timothy@2025"
	}

	adminPhone := os.Getenv("ADMIN_2FA_PHONE")
	if adminPhone == "" {
		adminPhone = "+2348140004589"
	}

	smtpUser := os.Getenv("SMTP_USER")
	if smtpUser == "" {
		smtpUser = os.Getenv("GMAIL_USER")
	}
	if smtpUser == "" {
		smtpUser = adminEmail
	}
	smtpUser = strings.Trim(strings.TrimSpace(smtpUser), "\"'`")

	smtpPass := os.Getenv("SMTP_PASS")
	if smtpPass == "" {
		smtpPass = os.Getenv("GMAIL_APP_PASSWORD")
	}
	if smtpPass == "" {
		smtpPass = os.Getenv("SMTP_PASSWORD")
	}
	smtpPass = strings.Trim(strings.TrimSpace(smtpPass), "\"'`")
	// If it's a Gmail App Password or contains spaces, strip all whitespace/spaces.
	// Google displays 16-character App Passwords with spaces like "xxxx xxxx xxxx xxxx",
	// but the SMTP server requires all spaces to be removed ("xxxxxxxxxxxxxxxx").
	if strings.Contains(smtpUser, "@gmail.com") || strings.Contains(smtpPass, " ") {
		smtpPass = strings.ReplaceAll(smtpPass, " ", "")
	}

	smtpHost := strings.Trim(strings.TrimSpace(os.Getenv("SMTP_HOST")), "\"'`")
	if smtpHost == "" {
		smtpHost = "smtp.gmail.com"
	}

	smtpPort := strings.Trim(strings.TrimSpace(os.Getenv("SMTP_PORT")), "\"'`")
	if smtpPort == "" {
		smtpPort = "587"
	}

	enableAnalytics, _ := strconv.ParseBool(os.Getenv("ENABLE_ANALYTICS"))

	return &Config{
		Port:              port,
		AppEnv:            appEnv,
		ContactEmail:      contactEmail,
		AdminEmail:        adminEmail,
		AdminPassword:     adminPassword,
		Admin2FAPhone:     adminPhone,
		AdminRecoveryCode: os.Getenv("ADMIN_RECOVERY_CODE"),
		SMTPHost:          smtpHost,
		SMTPPort:          smtpPort,
		SMTPUser:          smtpUser,
		SMTPPass:          smtpPass,
		ResendAPIKey:      strings.Trim(strings.TrimSpace(os.Getenv("RESEND_API_KEY")), "\"'`"),
		TermiiAPIKey:      os.Getenv("TERMII_API_KEY"),
		TwilioAccountSID:  os.Getenv("TWILIO_ACCOUNT_SID"),
		TwilioAuthToken:   os.Getenv("TWILIO_AUTH_TOKEN"),
		TwilioFromPhone:   os.Getenv("TWILIO_FROM_PHONE"),
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       120 * time.Second,
		MaxBodyBytes:      1024 * 64, // 64 KB
		EnableAnalytics:   enableAnalytics,
	}
}

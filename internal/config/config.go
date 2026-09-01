package config

import (
	"os"
	"strconv"
	"time"
)

// Config holds runtime configuration loaded from environment variables
type Config struct {
	Port            string
	AppEnv          string
	ContactEmail    string
	ReadTimeout     time.Duration
	WriteTimeout    time.Duration
	IdleTimeout     time.Duration
	MaxBodyBytes    int64
	EnableAnalytics bool
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

	enableAnalytics, _ := strconv.ParseBool(os.Getenv("ENABLE_ANALYTICS"))

	return &Config{
		Port:            port,
		AppEnv:          appEnv,
		ContactEmail:    contactEmail,
		ReadTimeout:     10 * time.Second,
		WriteTimeout:    15 * time.Second,
		IdleTimeout:     120 * time.Second,
		MaxBodyBytes:    1024 * 64, // 64 KB
		EnableAnalytics: enableAnalytics,
	}
}

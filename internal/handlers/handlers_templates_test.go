package handlers

import (
	"log/slog"
	"testing"

	"timothy-portfolio/internal/config"
	"timothy-portfolio/internal/services"
)

func TestNewDoesNotRequireLegacyTemplatesForReactApp(t *testing.T) {
	cfg := &config.Config{Port: "8080", AppEnv: "production"}
	contentSvc, err := services.NewContentService("../../content")
	if err != nil {
		t.Fatalf("content service: %v", err)
	}

	_, err = New(cfg, contentSvc, "/does/not/exist", slog.Default())
	if err != nil {
		t.Fatalf("expected missing legacy templates to be tolerated, got: %v", err)
	}
}

package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"timothy-portfolio/internal/config"
	"timothy-portfolio/internal/handlers"
	"timothy-portfolio/internal/services"
)

func main() {
	// 1. Initialize Configuration
	cfg := config.Load()

	// 2. Initialize Structured Logger
	var logHandler slog.Handler
	if cfg.AppEnv == "development" {
		logHandler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	} else {
		logHandler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	}
	logger := slog.New(logHandler)
	slog.SetDefault(logger)

	logger.Info("starting Timothy Ododo Portfolio service",
		"env", cfg.AppEnv,
		"port", cfg.Port,
	)

	// 3. Resolve Content & Template Directories
	contentDir := os.Getenv("CONTENT_DIR")
	if contentDir == "" {
		contentDir = "content"
	}

	templatesDir := os.Getenv("TEMPLATES_DIR")
	if templatesDir == "" {
		templatesDir = "templates"
	}

	staticDir := os.Getenv("STATIC_DIR")
	if staticDir == "" {
		staticDir = "static"
	}

	// 4. Initialize Content Service
	contentSvc, err := services.NewContentService(contentDir)
	if err != nil {
		logger.Error("failed to load content service", "err", err)
		os.Exit(1)
	}

	// 5. Initialize Handlers
	h, err := handlers.New(cfg, contentSvc, templatesDir, logger)
	if err != nil {
		logger.Error("failed to initialize handlers and templates", "err", err)
		os.Exit(1)
	}

	// 6. Register Routes with ServeMux
	mux := http.NewServeMux()

	// Static Assets
	fileServer := http.FileServer(http.Dir(staticDir))
	mux.Handle("/static/", http.StripPrefix("/static/", fileServer))

	// Page Routes
	mux.HandleFunc("/", h.Home)
	mux.HandleFunc("/about", h.About)
	mux.HandleFunc("/experience", h.Experience)
	mux.HandleFunc("/projects", h.Projects)
	mux.HandleFunc("/projects/", h.ProjectDetail)
	mux.HandleFunc("/skills", h.Skills)
	mux.HandleFunc("/resume", h.Resume)
	mux.HandleFunc("/contact", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			h.HandleContactSubmit(w, r)
		} else {
			h.Contact(w, r)
		}
	})

	// API & Operational Endpoints
	mux.HandleFunc("/api/contact", h.HandleContactSubmit)
	mux.HandleFunc("/api/projects", h.APIProjects)
	mux.HandleFunc("/health", h.Health)
	mux.HandleFunc("/robots.txt", h.RobotsTxt)
	mux.HandleFunc("/sitemap.xml", h.SitemapXML)

	// 7. Attach Global Middleware Pipeline
	handler := loggingMiddleware(logger, securityHeadersMiddleware(mux))

	// 8. Configure HTTP Server
	serverAddr := fmt.Sprintf("0.0.0.0:%s", cfg.Port)
	srv := &http.Server{
		Addr:         serverAddr,
		Handler:      handler,
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
		IdleTimeout:  cfg.IdleTimeout,
	}

	// 9. Graceful Shutdown Channel
	shutdownChan := make(chan os.Signal, 1)
	signal.Notify(shutdownChan, os.Interrupt, syscall.SIGTERM)

	go func() {
		logger.Info("server listening on network address", "address", "http://"+serverAddr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "err", err)
			os.Exit(1)
		}
	}()

	<-shutdownChan
	logger.Info("shutting down server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logger.Error("forced server shutdown", "err", err)
	}

	logger.Info("server shutdown complete")
}

// loggingMiddleware logs HTTP request execution times and metadata
func loggingMiddleware(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		wrapped := &responseWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		duration := time.Since(start)
		logger.Info("http request",
			"method", r.Method,
			"path", r.URL.Path,
			"status", wrapped.status,
			"duration_ms", duration.Milliseconds(),
			"remote_ip", r.RemoteAddr,
		)
	})
}

// securityHeadersMiddleware applies industry-standard HTTP security headers
func securityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "SAMEORIGIN")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		
		// If serving static files, set caching headers
		if filepath.HasPrefix(r.URL.Path, "/static/") {
			w.Header().Set("Cache-Control", "public, max-age=86400")
		}

		next.ServeHTTP(w, r)
	})
}

type responseWriter struct {
	http.ResponseWriter
	status int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.status = code
	rw.ResponseWriter.WriteHeader(code)
}

package handlers

import (
	"encoding/json"
	"fmt"
	"html/template"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"time"

	"timothy-portfolio/internal/config"
	"timothy-portfolio/internal/models"
	"timothy-portfolio/internal/services"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// Handler encapsulates routes, services, templates and dependencies
type Handler struct {
	cfg          *config.Config
	contentSvc   services.ContentService
	tmplCache    map[string]*template.Template
	tmplMu       sync.RWMutex
	templatesDir string
	logger       *slog.Logger
}

// New creates and configures the main Handler
func New(cfg *config.Config, contentSvc services.ContentService, templatesDir string, logger *slog.Logger) (*Handler, error) {
	h := &Handler{
		cfg:          cfg,
		contentSvc:   contentSvc,
		tmplCache:    make(map[string]*template.Template),
		templatesDir: templatesDir,
		logger:       logger,
	}

	if templatesDir == "" {
		logger.Warn("templates directory is empty; skipping legacy template initialization")
		return h, nil
	}

	if _, err := os.Stat(templatesDir); err != nil {
		logger.Warn("templates directory not found; skipping legacy template initialization", "templates_dir", templatesDir, "err", err)
		return h, nil
	}

	if err := h.loadTemplates(); err != nil {
		return nil, err
	}

	return h, nil
}

// Template functions
func templateFuncs() template.FuncMap {
	return template.FuncMap{
		"join":      strings.Join,
		"hasPrefix": strings.HasPrefix,
		"lower":     strings.ToLower,
		"safeHTML": func(s string) template.HTML {
			return template.HTML(s)
		},
		"add": func(a, b int) int {
			return a + b
		},
	}
}

func (h *Handler) loadTemplates() error {
	h.tmplMu.Lock()
	defer h.tmplMu.Unlock()

	pages := []string{
		"index.html",
		"about.html",
		"experience.html",
		"projects.html",
		"project.html",
		"skills.html",
		"resume.html",
		"contact.html",
		"404.html",
		"500.html",
	}

	layoutPath := filepath.Join(h.templatesDir, "layout.html")
	if _, err := os.Stat(layoutPath); err != nil {
		if os.IsNotExist(err) {
			h.logger.Warn("legacy layout not found; skipping template cache creation", "layout_path", layoutPath)
			return nil
		}
		return err
	}

	for _, page := range pages {
		pagePath := filepath.Join(h.templatesDir, page)
		if _, err := os.Stat(pagePath); err != nil {
			if os.IsNotExist(err) {
				continue
			}
			return err
		}
		tmpl, err := template.New(page).Funcs(templateFuncs()).ParseFiles(layoutPath, pagePath)
		if err != nil {
			return err
		}
		h.tmplCache[page] = tmpl
	}

	return nil
}

func (h *Handler) render(w http.ResponseWriter, r *http.Request, page string, data *models.PageData) {
	h.tmplMu.RLock()
	tmpl, exists := h.tmplCache[page]
	h.tmplMu.RUnlock()

	if !exists {
		h.logger.Error("template not found in cache", "page", page)
		h.Render500(w, r, "Internal layout error")
		return
	}

	if data.Year == 0 {
		data.Year = time.Now().Year()
	}
	data.CurrentPath = r.URL.Path

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := tmpl.ExecuteTemplate(w, "layout.html", data); err != nil {
		h.logger.Error("template execution failed", "page", page, "err", err)
	}
}

// Home handles GET /
func (h *Handler) Home(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		h.Render404(w, r)
		return
	}

	profile, _ := h.contentSvc.GetProfile()
	experiences, _ := h.contentSvc.GetFeaturedExperiences()
	projects, _ := h.contentSvc.GetFeaturedProjects()
	skills, _ := h.contentSvc.GetSkills()
	certs, _ := h.contentSvc.GetCertifications()
	edu, _ := h.contentSvc.GetEducation()
	community, _ := h.contentSvc.GetCommunity()

	data := &models.PageData{
		Title:          "Timothy Ododo — Technology Mentor & Advocate",
		MetaDesc:       "Official portfolio of Timothy Ododo: Technology Mentor & Advocate, IT Support Professional, Backend Developer, and Cloud/DevOps Practitioner.",
		Profile:        profile,
		Experiences:    experiences,
		Projects:       projects,
		SkillsData:     skills,
		Certifications: certs,
		Education:      edu,
		Community:      community,
	}

	h.render(w, r, "index.html", data)
}

// About handles GET /about
func (h *Handler) About(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()
	edu, _ := h.contentSvc.GetEducation()
	community, _ := h.contentSvc.GetCommunity()

	data := &models.PageData{
		Title:     "About Timothy Ododo — Professional Journey & Philosophy",
		MetaDesc:  "Learn about Timothy Ododo's multidisciplinary background across technology mentorship, systems troubleshooting, backend engineering, and community leadership.",
		Profile:   profile,
		Education: edu,
		Community: community,
	}

	h.render(w, r, "about.html", data)
}

// Experience handles GET /experience
func (h *Handler) Experience(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()
	experiences, _ := h.contentSvc.GetExperiences()

	data := &models.PageData{
		Title:       "Professional Experience — Timothy Ododo",
		MetaDesc:    "Comprehensive timeline of Timothy Ododo's roles at Learn2Earn NG, Solution Innovation District (SID), Buildathon Holiday Camp, and 3MTT Nigeria.",
		Profile:     profile,
		Experiences: experiences,
	}

	h.render(w, r, "experience.html", data)
}

// Projects handles GET /projects
func (h *Handler) Projects(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()
	projects, _ := h.contentSvc.GetProjects()
	categories, _ := h.contentSvc.GetProjectCategories()

	data := &models.PageData{
		Title:      "Project Portfolio & Case Studies — Timothy Ododo",
		MetaDesc:   "Explore software, backend engineering, hardware labs, and developer tooling case studies built by Timothy Ododo.",
		Profile:    profile,
		Projects:   projects,
		Categories: categories,
	}

	h.render(w, r, "projects.html", data)
}

// ProjectDetail handles GET /projects/{slug}
func (h *Handler) ProjectDetail(w http.ResponseWriter, r *http.Request) {
	slug := strings.TrimPrefix(r.URL.Path, "/projects/")
	slug = strings.Trim(slug, "/")

	if slug == "" {
		h.Projects(w, r)
		return
	}

	project, err := h.contentSvc.GetProjectBySlug(slug)
	if err != nil {
		h.Render404(w, r)
		return
	}

	profile, _ := h.contentSvc.GetProfile()

	data := &models.PageData{
		Title:    project.Name + " — Case Study | Timothy Ododo",
		MetaDesc: project.ShortDescription,
		Profile:  profile,
		Project:  project,
	}

	h.render(w, r, "project.html", data)
}

// Skills handles GET /skills
func (h *Handler) Skills(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()
	skills, _ := h.contentSvc.GetSkills()
	certs, _ := h.contentSvc.GetCertifications()

	data := &models.PageData{
		Title:          "Technical Skills & Capabilities — Timothy Ododo",
		MetaDesc:       "Detailed breakdown of technical capabilities across Go, Python, Cloud, IT Support, Linux, MicroPython, and DevOps.",
		Profile:        profile,
		SkillsData:     skills,
		Certifications: certs,
	}

	h.render(w, r, "skills.html", data)
}

// Resume handles GET /resume
func (h *Handler) Resume(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()
	experiences, _ := h.contentSvc.GetExperiences()
	skills, _ := h.contentSvc.GetSkills()
	certs, _ := h.contentSvc.GetCertifications()
	edu, _ := h.contentSvc.GetEducation()
	community, _ := h.contentSvc.GetCommunity()

	data := &models.PageData{
		Title:          "Curriculum Vitae / Resume — Timothy Ododo",
		MetaDesc:       "Professional CV of Timothy Ododo — Technology Mentor & Advocate, Backend Engineer, and IT Support Professional.",
		Profile:        profile,
		Experiences:    experiences,
		SkillsData:     skills,
		Certifications: certs,
		Education:      edu,
		Community:      community,
	}

	h.render(w, r, "resume.html", data)
}

// Contact handles GET /contact
func (h *Handler) Contact(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()

	data := &models.PageData{
		Title:    "Let's Connect — Timothy Ododo",
		MetaDesc: "Get in touch with Timothy Ododo for internship opportunities, technology mentorship, developer advocacy, backend engineering, or collaboration.",
		Profile:  profile,
	}

	h.render(w, r, "contact.html", data)
}

// HandleContactSubmit processes POST /contact and POST /api/contact
func (h *Handler) HandleContactSubmit(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	isJSON := strings.Contains(r.Header.Get("Content-Type"), "application/json")

	var sub models.ContactSubmission
	if isJSON {
		r.Body = http.MaxBytesReader(w, r.Body, h.cfg.MaxBodyBytes)
		if err := json.NewDecoder(r.Body).Decode(&sub); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid request payload"})
			return
		}
	} else {
		if err := r.ParseForm(); err != nil {
			h.logger.Warn("failed to parse form", "err", err)
		}
		sub.Name = r.FormValue("name")
		sub.Email = r.FormValue("email")
		sub.Subject = r.FormValue("subject")
		sub.Message = r.FormValue("message")
		sub.Honeypot = r.FormValue("website")
	}

	// Anti-spam Honeypot validation: if website field is filled, silently ignore
	if sub.Honeypot != "" {
		h.logger.Info("spam submission caught by honeypot", "honeypot", sub.Honeypot)
		if isJSON {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"message": "Thank you! Your message has been received.",
			})
		} else {
			http.Redirect(w, r, "/contact?sent=true", http.StatusSeeOther)
		}
		return
	}

	// Server-side validation
	sub.Name = strings.TrimSpace(sub.Name)
	sub.Email = strings.TrimSpace(sub.Email)
	sub.Subject = strings.TrimSpace(sub.Subject)
	sub.Message = strings.TrimSpace(sub.Message)

	var validationErrors []string
	if len(sub.Name) < 2 {
		validationErrors = append(validationErrors, "Name must be at least 2 characters")
	}
	if !emailRegex.MatchString(sub.Email) {
		validationErrors = append(validationErrors, "Please provide a valid email address")
	}
	if len(sub.Subject) < 3 {
		validationErrors = append(validationErrors, "Subject must be at least 3 characters")
	}
	if len(sub.Message) < 10 {
		validationErrors = append(validationErrors, "Message must be at least 10 characters")
	}

	if len(validationErrors) > 0 {
		if isJSON {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnprocessableEntity)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": false,
				"errors":  validationErrors,
			})
		} else {
			profile, _ := h.contentSvc.GetProfile()
			data := &models.PageData{
				Title:      "Let's Connect — Timothy Ododo",
				Profile:    profile,
				FlashError: strings.Join(validationErrors, ". "),
			}
			h.render(w, r, "contact.html", data)
		}
		return
	}

	sub.CreatedAt = time.Now()
	h.logger.Info("contact message received",
		"name", sub.Name,
		"email", sub.Email,
		"subject", sub.Subject,
		"length", len(sub.Message),
	)

	msgRecord := h.persistContactMessage(sub)

	if isJSON {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":       true,
			"message":       "Thank you for reaching out! Timothy has received your message and will respond promptly.",
			"messageRecord": msgRecord,
		})
	} else {
		http.Redirect(w, r, "/contact?sent=true", http.StatusSeeOther)
	}
}

func (h *Handler) getContentDir() string {
	if h.contentSvc != nil {
		if dir := h.contentSvc.GetContentDir(); dir != "" {
			return dir
		}
	}
	if dir := os.Getenv("CONTENT_DIR"); dir != "" {
		return dir
	}
	return "content"
}

func (h *Handler) persistContactMessage(sub models.ContactSubmission) map[string]any {
	contentDir := h.getContentDir()
	now := time.Now().UTC().Format(time.RFC3339)
	msgID := fmt.Sprintf("msg-%d-%04d", time.Now().UnixMilli(), time.Now().Nanosecond()%10000)

	msgRecord := map[string]any{
		"id":      msgID,
		"name":    sub.Name,
		"email":   sub.Email,
		"subject": sub.Subject,
		"message": sub.Message,
		"date":    now,
		"isRead":  false,
		"status":  "New",
	}

	dataPath := filepath.Join(contentDir, "portfolio_data.json")
	var existing map[string]any
	if data, err := os.ReadFile(dataPath); err == nil && len(data) > 0 {
		_ = json.Unmarshal(data, &existing)
	}
	if existing == nil {
		existing = map[string]any{}
	}

	messagesList, ok := existing["messages"].([]any)
	if !ok {
		messagesList = []any{}
	}
	existing["messages"] = append([]any{msgRecord}, messagesList...)
	existing["lastUpdated"] = now

	_ = os.MkdirAll(contentDir, 0o755)
	if encoded, err := json.MarshalIndent(existing, "", "  "); err == nil {
		_ = os.WriteFile(dataPath, encoded, 0o644)
	}

	return msgRecord
}

// ReplyRequest defines payload for POST /api/reply
type ReplyRequest struct {
	To                string `json:"to"`
	ToName            string `json:"toName"`
	Subject           string `json:"subject"`
	Body              string `json:"body"`
	OriginalMessageID string `json:"originalMessageId"`
}

// HandleReply processes POST /api/reply
func (h *Handler) HandleReply(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ReplyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"error": "Invalid request payload"})
		return
	}

	req.To = strings.TrimSpace(req.To)
	req.Body = strings.TrimSpace(req.Body)
	if req.To == "" || req.Body == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"error": "Recipient email and reply body are required."})
		return
	}

	if req.Subject == "" {
		req.Subject = "Reply from Timothy Ododo"
	}
	if req.ToName == "" {
		req.ToName = req.To
	}

	contentDir := h.getContentDir()
	now := time.Now().UTC().Format(time.RFC3339)
	replyID := fmt.Sprintf("reply-%d", time.Now().UnixMilli())

	replyRecord := map[string]any{
		"id":                replyID,
		"originalMessageId": req.OriginalMessageID,
		"to":                req.To,
		"toName":            req.ToName,
		"from":              "timothyododo@gmail.com",
		"subject":           req.Subject,
		"body":              req.Body,
		"sentAt":            now,
	}

	replyEntryForMessage := map[string]any{
		"id":      replyRecord["id"],
		"date":    replyRecord["sentAt"],
		"subject": req.Subject,
		"body":    req.Body,
		"sentBy":  "Timothy Ododo <timothyododo@gmail.com>",
	}

	dataPath := filepath.Join(contentDir, "portfolio_data.json")
	var existing map[string]any
	if data, err := os.ReadFile(dataPath); err == nil && len(data) > 0 {
		_ = json.Unmarshal(data, &existing)
	}
	if existing == nil {
		existing = map[string]any{}
	}

	if messagesList, ok := existing["messages"].([]any); ok {
		for i, rawMsg := range messagesList {
			if msgMap, ok := rawMsg.(map[string]any); ok {
				if msgMap["id"] == req.OriginalMessageID {
					msgMap["isRead"] = true
					msgMap["status"] = "Replied"
					replies, _ := msgMap["replies"].([]any)
					msgMap["replies"] = append(replies, replyEntryForMessage)
					messagesList[i] = msgMap
					break
				}
			}
		}
		existing["messages"] = messagesList
	}
	existing["lastUpdated"] = now

	_ = os.MkdirAll(contentDir, 0o755)
	if encoded, err := json.MarshalIndent(existing, "", "  "); err == nil {
		_ = os.WriteFile(dataPath, encoded, 0o644)
	}

	h.logger.Info("outgoing email reply recorded",
		"to", req.To,
		"subject", req.Subject,
		"originalMessageId", req.OriginalMessageID,
	)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"message": fmt.Sprintf("Reply sent successfully to %s", req.To),
		"reply":   replyRecord,
	})
}

// UploadPhotoRequest defines payload for POST /api/upload-photo
type UploadPhotoRequest struct {
	ImageData string `json:"imageData"`
	Filename  string `json:"filename"`
	IsAvatar  bool   `json:"isAvatar"`
	Caption   string `json:"caption"`
	Tag       string `json:"tag"`
}

// HandleUploadPhoto processes POST /api/upload-photo
func (h *Handler) HandleUploadPhoto(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	var req UploadPhotoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"error": "Image data is required."})
		return
	}

	if strings.TrimSpace(req.ImageData) == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{"error": "Image data is required."})
		return
	}

	if req.IsAvatar {
		contentDir := h.getContentDir()
		dataPath := filepath.Join(contentDir, "portfolio_data.json")
		var existing map[string]any
		if data, err := os.ReadFile(dataPath); err == nil && len(data) > 0 {
			_ = json.Unmarshal(data, &existing)
		}
		if existing == nil {
			existing = map[string]any{}
		}
		profileMap, ok := existing["profile"].(map[string]any)
		if !ok {
			profileMap = map[string]any{}
		}
		profileMap["avatarUrl"] = req.ImageData
		existing["profile"] = profileMap
		existing["lastUpdated"] = time.Now().UTC().Format(time.RFC3339)
		_ = os.MkdirAll(contentDir, 0o755)
		if encoded, err := json.MarshalIndent(existing, "", "  "); err == nil {
			_ = os.WriteFile(dataPath, encoded, 0o644)
		}
	}

	filename := req.Filename
	if filename == "" {
		filename = "photo.jpg"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]any{
		"success":  true,
		"url":      req.ImageData,
		"filename": filename,
		"caption":  req.Caption,
		"tag":      req.Tag,
	})
}

// APIProjects handles GET /api/projects
func (h *Handler) APIProjects(w http.ResponseWriter, r *http.Request) {
	projects, err := h.contentSvc.GetProjects()
	if err != nil {
		http.Error(w, "Failed to retrieve projects", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Cache-Control", "public, max-age=300")
	json.NewEncoder(w).Encode(projects)
}

// Health handles GET /health and GET /api/health
func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	now := time.Now().UTC().Format(time.RFC3339)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"time":      now,
		"timestamp": now,
		"service":   "timothy-portfolio",
		"version":   "1.0.0",
	})
}

// RobotsTxt handles GET /robots.txt
func (h *Handler) RobotsTxt(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.Write([]byte("User-agent: *\nAllow: /\nSitemap: https://timothyododo.onrender.com/sitemap.xml\n"))
}

// SitemapXML handles GET /sitemap.xml
func (h *Handler) SitemapXML(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/xml")
	urls := []string{"", "about", "experience", "projects", "skills", "resume", "contact"}

	var sb strings.Builder
	sb.WriteString(`<?xml version="1.0" encoding="UTF-8"?>` + "\n")
	sb.WriteString(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + "\n")

	baseURL := "https://timothyododo.onrender.com"
	for _, u := range urls {
		loc := baseURL + "/" + u
		sb.WriteString("  <url>\n    <loc>" + loc + "</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n")
	}

	projects, _ := h.contentSvc.GetProjects()
	for _, p := range projects {
		loc := baseURL + "/projects/" + p.Slug
		sb.WriteString("  <url>\n    <loc>" + loc + "</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n")
	}

	sb.WriteString(`</urlset>`)
	w.Write([]byte(sb.String()))
}

// Render404 renders the custom 404 page
func (h *Handler) Render404(w http.ResponseWriter, r *http.Request) {
	profile, _ := h.contentSvc.GetProfile()
	w.WriteHeader(http.StatusNotFound)
	data := &models.PageData{
		Title:    "Page Not Found — Timothy Ododo",
		MetaDesc: "The requested page does not exist.",
		Profile:  profile,
	}
	h.render(w, r, "404.html", data)
}

// Render500 renders the custom 500 page
func (h *Handler) Render500(w http.ResponseWriter, r *http.Request, msg string) {
	profile, _ := h.contentSvc.GetProfile()
	w.WriteHeader(http.StatusInternalServerError)
	data := &models.PageData{
		Title:      "Server Error — Timothy Ododo",
		MetaDesc:   "A temporary server issue occurred.",
		Profile:    profile,
		FlashError: msg,
	}
	h.render(w, r, "500.html", data)
}

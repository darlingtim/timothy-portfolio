package services

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"timothy-portfolio/internal/models"
)

// ContentService defines interface for accessing portfolio content
type ContentService interface {
	GetProfile() (*models.Profile, error)
	GetExperiences() ([]models.Experience, error)
	GetFeaturedExperiences() ([]models.Experience, error)
	GetProjects() ([]models.Project, error)
	GetFeaturedProjects() ([]models.Project, error)
	GetProjectBySlug(slug string) (*models.Project, error)
	GetProjectCategories() ([]string, error)
	GetSkills() (*models.SkillsData, error)
	GetCertifications() ([]models.Certification, error)
	GetEducation() ([]models.Education, error)
	GetCommunity() ([]models.CommunityRole, error)
	Reload() error
}

type fileContentService struct {
	contentDir     string
	mu             sync.RWMutex
	profile        *models.Profile
	experiences    []models.Experience
	projects       []models.Project
	skills         *models.SkillsData
	certifications []models.Certification
	education      []models.Education
	community      []models.CommunityRole
}

// NewContentService initializes and loads all structured JSON content into memory
func NewContentService(contentDir string) (ContentService, error) {
	svc := &fileContentService{
		contentDir: contentDir,
	}

	if err := svc.Reload(); err != nil {
		return nil, fmt.Errorf("failed to load content files: %w", err)
	}

	return svc, nil
}

func (s *fileContentService) Reload() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Load Profile
	var profile models.Profile
	if err := s.loadJSON("profile.json", &profile); err != nil {
		return err
	}
	s.profile = &profile

	// Load Experience
	var experiences []models.Experience
	if err := s.loadJSON("experience.json", &experiences); err != nil {
		return err
	}
	s.experiences = experiences

	// Load Projects
	var projects []models.Project
	if err := s.loadJSON("projects.json", &projects); err != nil {
		return err
	}
	s.projects = projects

	// Load Skills
	var skills models.SkillsData
	if err := s.loadJSON("skills.json", &skills); err != nil {
		return err
	}
	s.skills = &skills

	// Load Certifications
	var certs []models.Certification
	if err := s.loadJSON("certifications.json", &certs); err != nil {
		return err
	}
	s.certifications = certs

	// Load Education
	var edu []models.Education
	if err := s.loadJSON("education.json", &edu); err != nil {
		return err
	}
	s.education = edu

	// Load Community
	var comm []models.CommunityRole
	if err := s.loadJSON("community.json", &comm); err != nil {
		return err
	}
	s.community = comm

	return nil
}

func (s *fileContentService) loadJSON(filename string, target interface{}) error {
	path := filepath.Join(s.contentDir, filename)
	data, err := os.ReadFile(path)
	if err != nil {
		return fmt.Errorf("error reading %s: %w", filename, err)
	}
	if err := json.Unmarshal(data, target); err != nil {
		return fmt.Errorf("error parsing %s: %w", filename, err)
	}
	return nil
}

func (s *fileContentService) GetProfile() (*models.Profile, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.profile, nil
}

func (s *fileContentService) GetExperiences() ([]models.Experience, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.experiences, nil
}

func (s *fileContentService) GetFeaturedExperiences() ([]models.Experience, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var featured []models.Experience
	for _, exp := range s.experiences {
		if exp.IsFeatured {
			featured = append(featured, exp)
		}
	}
	return featured, nil
}

func (s *fileContentService) GetProjects() ([]models.Project, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.projects, nil
}

func (s *fileContentService) GetFeaturedProjects() ([]models.Project, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	var featured []models.Project
	for _, p := range s.projects {
		if p.IsFeatured {
			featured = append(featured, p)
		}
	}
	return featured, nil
}

func (s *fileContentService) GetProjectBySlug(slug string) (*models.Project, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	for _, p := range s.projects {
		if p.Slug == slug {
			return &p, nil
		}
	}
	return nil, fmt.Errorf("project with slug %q not found", slug)
}

func (s *fileContentService) GetProjectCategories() ([]string, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	catMap := make(map[string]bool)
	var categories []string
	categories = append(categories, "All")

	for _, p := range s.projects {
		for _, c := range p.Categories {
			if !catMap[c] {
				catMap[c] = true
				categories = append(categories, c)
			}
		}
	}
	return categories, nil
}

func (s *fileContentService) GetSkills() (*models.SkillsData, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.skills, nil
}

func (s *fileContentService) GetCertifications() ([]models.Certification, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.certifications, nil
}

func (s *fileContentService) GetEducation() ([]models.Education, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.education, nil
}

func (s *fileContentService) GetCommunity() ([]models.CommunityRole, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.community, nil
}

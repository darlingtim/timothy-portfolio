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
	GetContentDir() string
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

func (s *fileContentService) GetContentDir() string {
	return s.contentDir
}

func (s *fileContentService) Reload() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// 1. Load baseline from individual JSON files if they exist
	var profile models.Profile
	if err := s.loadJSON("profile.json", &profile); err == nil {
		s.profile = &profile
	}

	var experiences []models.Experience
	if err := s.loadJSON("experience.json", &experiences); err == nil {
		s.experiences = experiences
	}

	var projects []models.Project
	if err := s.loadJSON("projects.json", &projects); err == nil {
		s.projects = projects
	}

	var skills models.SkillsData
	if err := s.loadJSON("skills.json", &skills); err == nil {
		s.skills = &skills
	}

	var certs []models.Certification
	if err := s.loadJSON("certifications.json", &certs); err == nil {
		s.certifications = certs
	}

	var edu []models.Education
	if err := s.loadJSON("education.json", &edu); err == nil {
		s.education = edu
	}

	var comm []models.CommunityRole
	if err := s.loadJSON("community.json", &comm); err == nil {
		s.community = comm
	}

	// 2. If portfolio_data.json exists, overlay its authoritative data
	portfolioPath := filepath.Join(s.contentDir, "portfolio_data.json")
	if data, err := os.ReadFile(portfolioPath); err == nil && len(data) > 0 {
		var combined struct {
			Profile        *models.Profile        `json:"profile"`
			Experiences    []models.Experience    `json:"experiences"`
			Projects       []models.Project       `json:"projects"`
			Skills         *models.SkillsData     `json:"skills"`
			Certifications []models.Certification `json:"certifications"`
			Education      []models.Education     `json:"education"`
			Community      []models.CommunityRole `json:"community"`
		}
		if err := json.Unmarshal(data, &combined); err == nil {
			if combined.Profile != nil {
				s.profile = combined.Profile
			}
			if combined.Experiences != nil {
				s.experiences = combined.Experiences
			}
			if combined.Projects != nil {
				s.projects = combined.Projects
			}
			if combined.Skills != nil {
				s.skills = combined.Skills
			}
			if combined.Certifications != nil {
				s.certifications = combined.Certifications
			}
			if combined.Education != nil {
				s.education = combined.Education
			}
			if combined.Community != nil {
				s.community = combined.Community
			}
		}
	}

	// Ensure non-nil defaults
	if s.profile == nil {
		s.profile = &models.Profile{}
	}
	if s.skills == nil {
		s.skills = &models.SkillsData{}
	}

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

package models

import "time"

// ImpactMetric represents a key measurable achievement
type ImpactMetric struct {
	Value  string `json:"value"`
	Label  string `json:"label"`
	Detail string `json:"detail"`
}

// Capability represents a core professional capability
type Capability struct {
	ID          string `json:"id"`
	Title       string `json:"title"`
	Icon        string `json:"icon"`
	Description string `json:"description"`
}

// Profile contains personal brand and contact information
type Profile struct {
	Name          string         `json:"name"`
	Title         string         `json:"title"`
	Subtitle      string         `json:"subtitle"`
	Tagline       string         `json:"tagline"`
	Location      string         `json:"location"`
	Email         string         `json:"email"`
	GitHub        string         `json:"github"`
	LinkedIn      string         `json:"linkedin"`
	Bio           string         `json:"bio"`
	Status        string         `json:"status"`
	ImpactMetrics []ImpactMetric `json:"impactMetrics"`
	Capabilities  []Capability   `json:"capabilities"`
}

// Experience represents a professional role, fellowship or training position
type Experience struct {
	ID           string   `json:"id"`
	Role         string   `json:"role"`
	Organization string   `json:"organization"`
	Period       string   `json:"period"`
	Location     string   `json:"location"`
	Type         string   `json:"type"`
	IsFeatured   bool     `json:"isFeatured"`
	Summary      string   `json:"summary"`
	Highlights   []string `json:"highlights"`
	Technologies []string `json:"technologies"`
}

// Project represents a portfolio case study project
type Project struct {
	Slug               string            `json:"slug"`
	Name               string            `json:"name"`
	Tagline            string            `json:"tagline"`
	ShortDescription   string            `json:"shortDescription"`
	Category           string            `json:"category"`
	Categories         []string          `json:"categories"`
	IsFeatured         bool              `json:"isFeatured"`
	Year               string            `json:"year"`
	Technologies       []string          `json:"technologies"`
	GitHub             string            `json:"github"`
	LiveURL            string            `json:"liveUrl"`
	Overview           string            `json:"overview"`
	Problem            string            `json:"problem"`
	Solution           string            `json:"solution"`
	KeyFeatures        []string          `json:"keyFeatures"`
	Architecture       string            `json:"architecture"`
	Stack              map[string]string `json:"stack"`
	Challenges         string            `json:"challenges"`
	SolutionApproach   string            `json:"solutionApproach"`
	Learnings          string            `json:"learnings"`
	FutureImprovements string            `json:"futureImprovements"`
}

// Skill represents an individual technical proficiency
type Skill struct {
	Name      string `json:"name"`
	Level     string `json:"level"`
	Highlight string `json:"highlight"`
	Tag       string `json:"tag"`
}

// SkillCategory groups related skills
type SkillCategory struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Skills      []Skill `json:"skills"`
}

// SkillsData holds all categorized skills
type SkillsData struct {
	Categories []SkillCategory `json:"categories"`
}

// Certification represents an official certification or credential
type Certification struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Issuer        string   `json:"issuer"`
	Year          string   `json:"year"`
	Description   string   `json:"description"`
	SkillsCovered []string `json:"skillsCovered"`
	CredentialURL string   `json:"credentialUrl"`
}

// Education represents formal academic background
type Education struct {
	Degree            string   `json:"degree"`
	Institution       string   `json:"institution"`
	Location          string   `json:"location"`
	Period            string   `json:"period"`
	IsScholarship     bool     `json:"isScholarship"`
	ScholarshipDetail string   `json:"scholarshipDetail"`
	Highlights        []string `json:"highlights"`
}

// CommunityRole represents civic, leadership, or advocacy engagement
type CommunityRole struct {
	Organization string `json:"organization"`
	Role         string `json:"role"`
	Period       string `json:"period"`
	Summary      string `json:"summary"`
}

// ContactSubmission represents a message submitted from the contact form
type ContactSubmission struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	Honeypot  string    `json:"website,omitempty"` // Anti-spam field
	CreatedAt time.Time `json:"createdAt"`
}

// PageData represents the template rendering context
type PageData struct {
	Title          string
	MetaDesc       string
	CurrentPath    string
	Profile        *Profile
	Experiences    []Experience
	Projects       []Project
	Project        *Project
	SkillsData     *SkillsData
	Certifications []Certification
	Education      []Education
	Community      []CommunityRole
	Categories     []string
	Year           int
	FlashMessage   string
	FlashError     string
}

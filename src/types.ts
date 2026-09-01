export interface CarouselPhoto {
  id: string;
  url: string;
  caption: string;
  tag?: string;
  isIncludedInCarousel: boolean;
  order: number;
  dateAdded?: string;
}

export interface CarouselConfig {
  mode: 'carousel' | 'steady';
  steadyPhotoId: string;
  intervalSeconds: number;
  autoPlay: boolean;
  showIndicators: boolean;
  showArrows: boolean;
  showCaptions: boolean;
  photos: CarouselPhoto[];
}

export interface EventContribution {
  id: string;
  title: string;
  role: string;
  organization: string;
  date: string;
  location: string;
  track?: 'Technical' | 'Non-Technical' | 'Hybrid';
  category: 'Summit & Innovation' | 'STEM & Hardware Training' | 'Community & Advocacy' | 'Developer Conference' | 'Hackathon' | 'Youth Leadership' | 'Policy & Governance';
  badge?: string;
  summary: string;
  impactMetric?: string;
  highlights: string[];
  technologies?: string[];
  imageUrl?: string;
  eventUrl?: string;
  certificateUrl?: string;
  customFields?: CustomField[];
}

export interface CustomField {
  id: string;
  label: string;
  value: string;
  type?: 'text' | 'link' | 'number' | 'date';
}

export interface ImpactMetric {
  value: string;
  label: string;
  detail?: string;
  icon?: string;
  color?: string;
}

export interface Capability {
  id: string;
  title: string;
  icon: string;
  description: string;
  color?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface Profile {
  name: string;
  title: string;
  subtitle: string;
  tagline: string;
  location: string;
  email: string;
  phone?: string;
  github: string;
  linkedin: string;
  twitter?: string;
  website?: string;
  bio: string;
  status: string;
  avatarUrl?: string;
  impactMetrics: ImpactMetric[];
  capabilities: Capability[];
  customFields?: CustomField[];
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  period: string;
  location: string;
  type: string;
  isFeatured: boolean;
  summary: string;
  highlights: string[];
  technologies: string[];
  customFields?: CustomField[];
  companyUrl?: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  category: string;
  categories: string[];
  isFeatured: boolean;
  year: string;
  technologies: string[];
  github: string;
  liveUrl: string;
  overview: string;
  problem: string;
  solution: string;
  keyFeatures: string[];
  architecture: string;
  stack: Record<string, string>;
  challenges: string;
  solutionApproach: string;
  learnings: string;
  futureImprovements: string;
  status?: 'Published' | 'In Progress' | 'Archived';
  dateAdded?: string;
  imageUrl?: string;
  customFields?: CustomField[];
}

export interface Skill {
  id?: string;
  name: string;
  level: 'Strong' | 'Practical Experience' | 'Working Proficiency' | 'Developing' | 'Expert' | 'Advanced' | 'Intermediate';
  highlight?: string;
  tag: string;
  category?: string;
  proficiency?: number;
  customFields?: CustomField[];
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  skills: Skill[];
}

export interface SkillsData {
  categories: SkillCategory[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
  track?: 'Technical' | 'Non-Technical';
  description: string;
  skillsCovered: string[];
  credentialUrl: string;
  category?: string;
  badge?: string;
  customFields?: CustomField[];
}

export interface Achievement {
  id: string;
  title: string;
  issuer: string;
  year: string;
  track?: 'Technical' | 'Non-Technical';
  category: 'Certification' | 'Award' | 'Recognition' | 'Fellowship' | 'Scholarship';
  description: string;
  icon?: string;
  date?: string;
  customFields?: CustomField[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
  isScholarship: boolean;
  scholarshipDetail: string;
  highlights: string[];
  customFields?: CustomField[];
}

export interface CommunityRole {
  organization: string;
  role: string;
  period: string;
  summary: string;
  customFields?: CustomField[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'Training' | 'Community' | 'Certificate' | 'Workshop';
  date: string;
  imageUrl: string;
  description: string;
  location?: string;
  tags?: string[];
  customFields?: CustomField[];
}

export interface MentoringProgram {
  id: string;
  title: string;
  organization: string;
  period: string;
  learnersCount: string;
  focus: string;
  description: string;
  highlights: string[];
  technologies: string[];
  customFields?: CustomField[];
  testimonials?: {
    author: string;
    role: string;
    quote: string;
  }[];
}

export interface MessageReply {
  id: string;
  date: string;
  subject: string;
  body: string;
  sentBy: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  isRead: boolean;
  isStarred?: boolean;
  status?: 'New' | 'Replied' | 'Archived';
  replies?: MessageReply[];
  customFields?: CustomField[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  lastLogin: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  primaryRole: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  allowMessages: boolean;
  showAdminLink: boolean;
}

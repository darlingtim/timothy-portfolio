import rawPortfolioData from '../content/portfolio_data.json';
import { 
  Profile, 
  Experience, 
  Project, 
  SkillsData, 
  Certification, 
  Education, 
  CommunityRole, 
  GalleryItem, 
  Achievement, 
  MentoringProgram, 
  ContactMessage, 
  SiteSettings, 
  CarouselConfig, 
  EventContribution,
  HomePageContent,
  AboutPageContent
} from './types';

// Authoritative data directly sourced from content/portfolio_data.json
const data = rawPortfolioData as any;

export const defaultHomePageContent: HomePageContent = {
  heroGreeting: "Hello, I'm",
  heroCta1Text: "View My Work",
  heroCta1Link: "/projects",
  heroCta2Text: "Download CV",
  heroCta2Link: "/resume",
  heroCta3Text: "Certifications & Events",
  heroCta3Link: "/events",
  connectHeading: "Connect with me",
  whatIDoTitle: "What I Do",
  whatIDoSubtitle: "I work at the intersection of technology, education, and impact.",
  ctaSection: {
    badge: "Collaboration & Mentorship",
    title: "Let's Build, Solve and Learn Together",
    description: "Whether you're looking for a technology mentor, technical support professional, backend software developer or someone to lead youth digital initiatives, I'd be glad to connect.",
    primaryButtonText: "View My Work",
    primaryButtonLink: "/projects",
    secondaryButtonText: "Contact Me",
    secondaryButtonLink: "/contact"
  }
};

export const defaultAboutPageContent: AboutPageContent = {
  eyebrow: "Biography & Philosophy",
  heading: "About Timothy Ododo",
  subheading: "Technology Mentor & Advocate • Software Engineering Practitioner",
  storyParagraph1: "I am a multidisciplinary technology professional with a passion for operating at the intersection of technical systems and human potential. My work spans backend engineering in Go and Python, enterprise IT support, cloud and DevOps operations, physical computing, and large-scale technical training.",
  storyParagraph2: "What sets my approach apart is the ability to learn technology rapidly, solve difficult diagnostic problems, build reliable software, and effectively teach those concepts to others. Whether developing robust APIs or mentoring secondary school students through their first hardware programming challenges, I focus on practical solutions with measurable impact.",
  calloutTitle: "The Rapid Learning Differentiator",
  calloutText: "Prior to being deployed as lead hardware instructor at the Buildathon Holiday Camp, I mastered Raspberry Pi Pico and MicroPython physical computing within just three days. This agility enables me to adapt seamlessly to unfamiliar tech stacks, legacy codebases, and emerging engineering tools.",
  storyParagraph3: "Currently, as a Learn2Earn NG Fellow & Ambassador and a full-scholarship B.Sc. Computer Science student at IU International University of Applied Sciences (Germany), I focus on high-performance backend systems in Go, structured logging, containerization, and ethical AI-assisted workflows.",
  quickFactsTitle: "Quick Facts",
  quickFacts: [
    { label: "Role", value: "Technology Mentor & Advocate" },
    { label: "Education", value: "B.Sc. Computer Science, IU Germany (Full Scholarship)" },
    { label: "Core Stack", value: "Go (Golang), Python, Linux, Docker, REST APIs" },
    { label: "Certifications", value: "Google IT Support Professional" }
  ],
  connectCardTitle: "Let's Connect",
  connectCardText: "Interested in collaborating, hiring for an internship or engineering role, or scheduling a technical talk?",
  connectCardButtonText: "Get in Touch",
  progressionEyebrow: "Career Evolution",
  progressionTitle: "Multidisciplinary Growth Matrix",
  progressionSteps: [
    { title: "Technology Learner", desc: "Rapidly assimilating new architectures, hardware interfaces, and backend paradigms." },
    { title: "Technology Educator", desc: "Demystifying complex logic for 200+ students across hardware and software computing." },
    { title: "Technology Advocate", desc: "Mobilising grass-roots digital adoption with SID (Anambra State Govt ICT arm)." },
    { title: "Community Leader", desc: "Coordinating 3MTT Cohort 2 and fostering cross-peer accountability." },
    { title: "IT Support Specialist", desc: "Google-certified hardware, networking, and systems administration troubleshooter." },
    { title: "Software Engineer & DevOps", desc: "Engineering resilient Go backends, distributed systems, and automated CI/CD pipelines." }
  ]
};

export const initialHomePageContent: HomePageContent = {
  ...defaultHomePageContent,
  ...(data.homeContent || data.profile?.homeContent || {})
};

export const initialAboutPageContent: AboutPageContent = {
  ...defaultAboutPageContent,
  ...(data.aboutContent || data.profile?.aboutContent || {})
};

export const initialProfile: Profile = {
  ...data.profile,
  homeContent: initialHomePageContent,
  aboutContent: initialAboutPageContent
};
export const initialProjects: Project[] = (data.projects || []) as Project[];
export const initialExperiences: Experience[] = (data.experiences || []) as Experience[];
export const initialSkills: SkillsData = data.skills as SkillsData;
export const initialCertifications: Certification[] = (data.certifications || []) as Certification[];
export const initialEducation: Education[] = (data.education || []) as Education[];
export const initialCommunity: CommunityRole[] = (data.community || []) as CommunityRole[];
export const initialMentoringPrograms: MentoringProgram[] = (data.mentoring || []) as MentoringProgram[];
export const initialGalleryItems: GalleryItem[] = (data.gallery || data.galleryItems || []) as GalleryItem[];
export const initialAchievements: Achievement[] = (data.achievements || []) as Achievement[];
export const initialEventContributions: EventContribution[] = (data.eventContributions || data.events || []) as EventContribution[];
export const initialCarouselConfig: CarouselConfig = data.carouselConfig as CarouselConfig;
export const initialMessages: ContactMessage[] = (data.messages || []) as ContactMessage[];
export const initialSiteSettings: SiteSettings = (data.settings || data.siteSettings) as SiteSettings;

// Storage helper functions for live Admin CRUD persistence
const STORAGE_PREFIX = "timothy_portfolio_";
const VERSION_KEY = "timothy_portfolio_json_stamp";
export const ADMIN_TOKEN_KEY = "timothy_admin_token";
export const ADMIN_USER_KEY = "timothy_admin_user";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminSession(token: string, user?: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  }
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

// If portfolio_data.json changed on disk or has a new update stamp, clear stale localStorage caches so disk edits reflect immediately
if (typeof window !== "undefined") {
  const currentStamp = data.lastUpdated || "initial";
  const storedStamp = localStorage.getItem(VERSION_KEY);
  if (storedStamp !== currentStamp) {
    [
      "profile", "projects", "experiences", "gallery", "achievements",
      "skills", "certifications", "education", "community", "mentoring",
      "settings", "carouselConfig", "eventContributions", "homeContent", "aboutContent"
    ].forEach(k => {
      localStorage.removeItem(STORAGE_PREFIX + k);
    });
    localStorage.setItem(VERSION_KEY, currentStamp);
  }
}

export function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

// Named data aliases for tests and static reference
export const PROFILE = initialProfile;
export const PROJECTS = initialProjects;
export const SKILLS = initialSkills?.categories ? initialSkills.categories.flatMap(c => c.skills || []) : [];
export const EXPERIENCE = initialExperiences;
export const EVENTS = initialEventContributions;
export const AWARDS = initialAchievements;
export const SYSTEM_METRICS = {
  uptime: "99.99%",
  latency: "14ms",
  activeServices: 8
};

export function saveStored<T>(key: string, dataValue: T, shouldSync: boolean = true): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(dataValue));
    // Automatically push update to server JSON database if sync enabled
    if (shouldSync) {
      let payload: Record<string, any> = { [key]: dataValue };
      if (key === 'eventContributions' || key === 'events') {
        payload = { eventContributions: dataValue, events: dataValue };
      } else if (key === 'gallery' || key === 'galleryItems') {
        payload = { gallery: dataValue, galleryItems: dataValue };
      } else if (key === 'settings' || key === 'siteSettings') {
        payload = { settings: dataValue, siteSettings: dataValue };
      }
      syncServerData(payload);
    }
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export function getProfile(): Profile {
  return getStored("profile", initialProfile);
}

export function getProjects(): Project[] {
  return getStored("projects", initialProjects);
}

export function getExperiences(): Experience[] {
  return getStored("experiences", initialExperiences);
}

export function getGalleryItems(): GalleryItem[] {
  return getStored("gallery", initialGalleryItems);
}

export function getAchievements(): Achievement[] {
  return getStored("achievements", initialAchievements);
}

export function getSkills(): SkillsData {
  return getStored("skills", initialSkills);
}

export function getCertifications(): Certification[] {
  return getStored("certifications", initialCertifications);
}

export function getEducation(): Education[] {
  return getStored("education", initialEducation);
}

export function getCommunity(): CommunityRole[] {
  return getStored("community", initialCommunity);
}

export function getMentoringPrograms(): MentoringProgram[] {
  return getStored("mentoring", initialMentoringPrograms);
}

export function getMessages(): ContactMessage[] {
  return getStored("messages", initialMessages);
}

export function getSiteSettings(): SiteSettings {
  return getStored("settings", initialSiteSettings);
}

export function getCarouselConfig(): CarouselConfig {
  return getStored("carouselConfig", initialCarouselConfig);
}

export function getEventContributions(): EventContribution[] {
  return getStored("eventContributions", initialEventContributions);
}

export function getHomePageContent(): HomePageContent {
  return getStored("homeContent", initialHomePageContent);
}

export function getAboutPageContent(): AboutPageContent {
  return getStored("aboutContent", initialAboutPageContent);
}

// Global server-sync functions to ensure changes reflect across all devices permanently
export async function fetchServerData(customToken?: string | null): Promise<any> {
  try {
    const token = customToken || getAdminToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/data', { headers });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.success && json.data) {
      // Hydrate local cache with authoritative server data
      const d = json.data;
      if (d.profile) saveStored("profile", d.profile, false);
      if (d.projects) saveStored("projects", d.projects, false);
      if (d.experiences) saveStored("experiences", d.experiences, false);
      if (d.gallery || d.galleryItems) saveStored("gallery", d.gallery || d.galleryItems, false);
      if (d.achievements) saveStored("achievements", d.achievements, false);
      if (d.skills) saveStored("skills", d.skills, false);
      if (d.certifications) saveStored("certifications", d.certifications, false);
      if (d.education) saveStored("education", d.education, false);
      if (d.community) saveStored("community", d.community, false);
      if (d.mentoring) saveStored("mentoring", d.mentoring, false);
      if (d.messages) saveStored("messages", d.messages, false);
      if (d.settings || d.siteSettings) saveStored("settings", d.settings || d.siteSettings, false);
      if (d.carouselConfig) saveStored("carouselConfig", d.carouselConfig, false);
      if (d.eventContributions || d.events) saveStored("eventContributions", d.eventContributions || d.events, false);
      if (d.homeContent) saveStored("homeContent", d.homeContent, false);
      if (d.aboutContent) saveStored("aboutContent", d.aboutContent, false);
      return d;
    }
  } catch (err) {
    console.warn('Could not fetch server data, using cached local data:', err);
  }
  return null;
}

export async function syncServerData(payload: Record<string, any>, customToken?: string | null): Promise<boolean> {
  try {
    const token = customToken || getAdminToken() || 'adm_fallback_token';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-admin-token': token
    };

    const res = await fetch('/api/data', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync data to server:', err);
    return false;
  }
}

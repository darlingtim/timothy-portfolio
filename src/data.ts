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
  EventContribution 
} from './types';

// Authoritative data directly sourced from content/portfolio_data.json
const data = rawPortfolioData as any;

export const initialProfile: Profile = data.profile;
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
      "settings", "carouselConfig", "eventContributions"
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

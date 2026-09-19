import { 
  GalleryItem, 
  CarouselConfig, 
  Project, 
  Experience, 
  EventContribution, 
  MentoringProgram, 
  Certification, 
  Achievement, 
  Education, 
  Profile 
} from '../types';
import { saveStored, getStored } from '../data';

export interface MovedPhotoItem {
  oldUrl: string;
  newUrl: string;
  filename?: string;
  targetCategory: string;
}

/**
 * Maps a media folder/system category to a user-friendly Gallery category
 */
export function mapToGalleryCategory(cat: string): string {
  const lower = (cat || '').toLowerCase().trim();
  if (lower === 'projects' || lower === 'project') return 'Projects';
  if (lower === 'experience' || lower === 'experiences') return 'Experience';
  if (lower === 'events' || lower === 'event') return 'Events';
  if (lower === 'mentoring' || lower === 'mentor') return 'Mentoring';
  if (lower === 'certifications' || lower === 'certification' || lower === 'certificate') return 'Certificate';
  if (lower === 'achievements' || lower === 'achievement') return 'Achievements';
  if (lower === 'carousel') return 'Carousel';
  if (lower === 'education' || lower === 'training') return 'Training';
  if (lower === 'profile' || lower === 'avatar') return 'Profile';
  if (lower === 'community') return 'Community';
  if (lower === 'workshop') return 'Workshop';
  if (lower === 'general') return 'Community';
  return cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'General';
}

function normalizeUrl(u?: string): string {
  if (!u) return '';
  return u.trim().replace(/^\/+/, '/').split('?')[0];
}

/**
 * Checks if a candidate URL matches oldUrl or newUrl
 */
function isUrlMatch(url: string | undefined, moved: MovedPhotoItem): boolean {
  if (!url) return false;
  const nUrl = normalizeUrl(url);
  const nOld = normalizeUrl(moved.oldUrl);
  const nNew = normalizeUrl(moved.newUrl);
  if (nUrl === nOld || nUrl === nNew || url === moved.oldUrl || url === moved.newUrl) return true;
  if (moved.filename && nUrl.endsWith(`/${moved.filename}`)) return true;
  return false;
}

/**
 * Synchronize Gallery Items with moved photos and updated categories
 */
export function syncGalleryWithMoved(
  currentItems: GalleryItem[],
  movedList: MovedPhotoItem[]
): GalleryItem[] {
  if (!Array.isArray(currentItems) || movedList.length === 0) return currentItems;

  let items = currentItems.map((item) => {
    let updatedItem = { ...item };
    for (const m of movedList) {
      if (isUrlMatch(updatedItem.imageUrl, m)) {
        const mappedCat = mapToGalleryCategory(m.targetCategory);
        const currentTags = Array.isArray(updatedItem.tags) ? [...updatedItem.tags] : [];
        if (!currentTags.includes(mappedCat)) {
          currentTags.push(mappedCat);
        }
        updatedItem = {
          ...updatedItem,
          imageUrl: m.newUrl,
          category: mappedCat,
          sourceCategory: m.targetCategory,
          tags: currentTags
        };
      }
    }
    return updatedItem;
  });

  // If a photo was moved to the 'gallery' category and doesn't exist in gallery items, append it
  for (const m of movedList) {
    if (m.targetCategory.toLowerCase() === 'gallery') {
      const exists = items.some((item) => isUrlMatch(item.imageUrl, m));
      if (!exists) {
        const rawName = m.filename || m.newUrl.split('/').pop()?.split('?')[0] || 'Photo';
        const cleanTitle = rawName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        const newItem: GalleryItem = {
          id: `gal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title,
          category: 'Gallery',
          date: new Date().toISOString().split('T')[0],
          imageUrl: m.newUrl,
          description: `Photo archived in Gallery.`,
          location: 'Nigeria',
          tags: ['Gallery'],
          sourceCategory: 'gallery'
        };
        items = [newItem, ...items];
      }
    }
  }

  return items;
}

/**
 * Synchronize Carousel Configuration with moved photos and updated categories
 */
export function syncCarouselWithMoved(
  config: CarouselConfig,
  movedList: MovedPhotoItem[]
): CarouselConfig {
  if (!config || !Array.isArray(config.photos) || movedList.length === 0) return config;

  let photos = config.photos.map((p) => {
    let updatedPhoto = { ...p };
    for (const m of movedList) {
      if (isUrlMatch(updatedPhoto.url, m)) {
        updatedPhoto = {
          ...updatedPhoto,
          url: m.newUrl,
          tag: m.targetCategory
        };
      }
    }
    return updatedPhoto;
  });

  // If a photo was moved to 'carousel' and isn't present in carousel photos, add it
  for (const m of movedList) {
    if (m.targetCategory.toLowerCase() === 'carousel') {
      const exists = photos.some((p) => isUrlMatch(p.url, m));
      if (!exists) {
        const rawName = m.filename || m.newUrl.split('/').pop()?.split('?')[0] || 'Photo';
        const cleanTitle = rawName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
        photos.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          url: m.newUrl,
          caption: title,
          tag: 'carousel',
          isIncludedInCarousel: true,
          order: photos.length + 1,
          dateAdded: new Date().toISOString().split('T')[0]
        });
      }
    }
  }

  return {
    ...config,
    photos
  };
}

/**
 * Synchronize Projects with moved photos
 */
export function syncProjectsWithMoved(
  projects: Project[],
  movedList: MovedPhotoItem[]
): Project[] {
  if (!Array.isArray(projects) || movedList.length === 0) return projects;

  return projects.map((p) => {
    let updated = { ...p };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
      if (Array.isArray(updated.photos)) {
        updated.photos = updated.photos.map((u) => isUrlMatch(u, m) ? m.newUrl : u);
      }
      if (Array.isArray(updated.images)) {
        updated.images = updated.images.map((u) => isUrlMatch(u, m) ? m.newUrl : u);
      }
    }
    return updated;
  });
}

/**
 * Synchronize Experiences with moved photos
 */
export function syncExperiencesWithMoved(
  experiences: Experience[],
  movedList: MovedPhotoItem[]
): Experience[] {
  if (!Array.isArray(experiences) || movedList.length === 0) return experiences;

  return experiences.map((exp) => {
    let updated = { ...exp };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
    }
    return updated;
  });
}

/**
 * Synchronize Events with moved photos
 */
export function syncEventsWithMoved(
  events: EventContribution[],
  movedList: MovedPhotoItem[]
): EventContribution[] {
  if (!Array.isArray(events) || movedList.length === 0) return events;

  return events.map((ev) => {
    let updated = { ...ev };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
    }
    return updated;
  });
}

/**
 * Synchronize Mentoring with moved photos
 */
export function syncMentoringWithMoved(
  mentoring: MentoringProgram[],
  movedList: MovedPhotoItem[]
): MentoringProgram[] {
  if (!Array.isArray(mentoring) || movedList.length === 0) return mentoring;

  return mentoring.map((mItem) => {
    let updated = { ...mItem };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
      if (Array.isArray(updated.photos)) {
        updated.photos = updated.photos.map((u) => isUrlMatch(u, m) ? m.newUrl : u);
      }
    }
    return updated;
  });
}

/**
 * Synchronize Certifications with moved photos
 */
export function syncCertificationsWithMoved(
  certs: Certification[],
  movedList: MovedPhotoItem[]
): Certification[] {
  if (!Array.isArray(certs) || movedList.length === 0) return certs;

  return certs.map((c) => {
    let updated = { ...c };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
    }
    return updated;
  });
}

/**
 * Synchronize Achievements with moved photos
 */
export function syncAchievementsWithMoved(
  achs: Achievement[],
  movedList: MovedPhotoItem[]
): Achievement[] {
  if (!Array.isArray(achs) || movedList.length === 0) return achs;

  return achs.map((a) => {
    let updated = { ...a };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
    }
    return updated;
  });
}

/**
 * Synchronize Education with moved photos
 */
export function syncEducationWithMoved(
  edu: Education[],
  movedList: MovedPhotoItem[]
): Education[] {
  if (!Array.isArray(edu) || movedList.length === 0) return edu;

  return edu.map((e) => {
    let updated = { ...e };
    for (const m of movedList) {
      if (isUrlMatch(updated.imageUrl, m)) {
        updated.imageUrl = m.newUrl;
      }
    }
    return updated;
  });
}

/**
 * Synchronize Profile with moved photos
 */
export function syncProfileWithMoved(
  profile: Profile,
  movedList: MovedPhotoItem[]
): Profile {
  if (!profile || movedList.length === 0) return profile;

  let updated = { ...profile };
  for (const m of movedList) {
    if (isUrlMatch(updated.avatarUrl, m) || m.targetCategory.toLowerCase() === 'profile') {
      updated.avatarUrl = m.newUrl;
    }
  }
  return updated;
}

/**
 * Master sync function called after any photo move or category change.
 * Updates local storage across all portfolio entities and broadcasts
 * the 'portfolio_photo_moved' event to ensure all views immediately update.
 */
export function applyImageMoveSync(
  moved: MovedPhotoItem[],
  updatedData?: any
): void {
  if (typeof window === 'undefined') return;

  if (updatedData) {
    // Authoritative hydration from server response
    if (updatedData.profile) saveStored('profile', updatedData.profile, false);
    if (updatedData.projects) saveStored('projects', updatedData.projects, false);
    if (updatedData.experiences) saveStored('experiences', updatedData.experiences, false);
    const gal = updatedData.gallery || updatedData.galleryItems;
    if (gal) {
      saveStored('gallery', gal, false);
      saveStored('galleryItems', gal, false);
    }
    if (updatedData.achievements) saveStored('achievements', updatedData.achievements, false);
    if (updatedData.skills) saveStored('skills', updatedData.skills, false);
    if (updatedData.certifications) saveStored('certifications', updatedData.certifications, false);
    if (updatedData.education) saveStored('education', updatedData.education, false);
    if (updatedData.community) saveStored('community', updatedData.community, false);
    if (updatedData.mentoring) saveStored('mentoring', updatedData.mentoring, false);
    if (updatedData.carouselConfig) saveStored('carouselConfig', updatedData.carouselConfig, false);
    const ev = updatedData.eventContributions || updatedData.events;
    if (ev) {
      saveStored('eventContributions', ev, false);
      saveStored('events', ev, false);
    }
  } else if (Array.isArray(moved) && moved.length > 0) {
    // Client-side optimistic update of cached entities
    const currentGal = getStored<GalleryItem[]>('gallery', getStored<GalleryItem[]>('galleryItems', []));
    const newGal = syncGalleryWithMoved(currentGal, moved);
    saveStored('gallery', newGal, false);
    saveStored('galleryItems', newGal, false);

    const currentCarousel = getStored<CarouselConfig>('carouselConfig', {
      mode: 'carousel',
      steadyPhotoId: '',
      intervalSeconds: 5,
      autoPlay: true,
      showIndicators: true,
      showArrows: true,
      showCaptions: true,
      photos: []
    });
    const newCarousel = syncCarouselWithMoved(currentCarousel, moved);
    saveStored('carouselConfig', newCarousel, false);

    const currentProjects = getStored<Project[]>('projects', []);
    const newProjects = syncProjectsWithMoved(currentProjects, moved);
    saveStored('projects', newProjects, false);

    const currentExperiences = getStored<Experience[]>('experiences', []);
    const newExperiences = syncExperiencesWithMoved(currentExperiences, moved);
    saveStored('experiences', newExperiences, false);

    const currentEvents = getStored<EventContribution[]>('eventContributions', getStored<EventContribution[]>('events', []));
    const newEvents = syncEventsWithMoved(currentEvents, moved);
    saveStored('eventContributions', newEvents, false);
    saveStored('events', newEvents, false);

    const currentMentoring = getStored<MentoringProgram[]>('mentoring', []);
    const newMentoring = syncMentoringWithMoved(currentMentoring, moved);
    saveStored('mentoring', newMentoring, false);

    const currentCerts = getStored<Certification[]>('certifications', []);
    const newCerts = syncCertificationsWithMoved(currentCerts, moved);
    saveStored('certifications', newCerts, false);

    const currentAchs = getStored<Achievement[]>('achievements', []);
    const newAchs = syncAchievementsWithMoved(currentAchs, moved);
    saveStored('achievements', newAchs, false);

    const currentEdu = getStored<Education[]>('education', []);
    const newEdu = syncEducationWithMoved(currentEdu, moved);
    saveStored('education', newEdu, false);

    const currentProfile = getStored<Profile>('profile', {} as Profile);
    if (currentProfile && Object.keys(currentProfile).length > 0) {
      const newProfile = syncProfileWithMoved(currentProfile, moved);
      saveStored('profile', newProfile, false);
    }
  }

  // Dispatch custom browser event so all mounted components react immediately
  try {
    window.dispatchEvent(
      new CustomEvent('portfolio_photo_moved', {
        detail: { moved, updatedData }
      })
    );
  } catch (err) {
    console.warn('Could not dispatch portfolio_photo_moved event:', err);
  }
}

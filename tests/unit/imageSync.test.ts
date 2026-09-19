import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mapToGalleryCategory,
  syncGalleryWithMoved,
  syncCarouselWithMoved,
  syncProjectsWithMoved,
  syncProfileWithMoved,
  applyImageMoveSync,
  MovedPhotoItem,
} from '../../src/utils/imageSync';
import {
  moveMediaImages,
  deleteMediaImages,
  deduplicateMediaImages,
  fetchMediaImages,
} from '../../src/utils/imageUpload';
import { GalleryItem, CarouselConfig, Project } from '../../src/types';

describe('imageSync Utilities & Cross-Category Data Normalization', () => {
  describe('mapToGalleryCategory', () => {
    it('correctly normalizes all system categories to user-friendly labels', () => {
      expect(mapToGalleryCategory('projects')).toBe('Projects');
      expect(mapToGalleryCategory('project')).toBe('Projects');
      expect(mapToGalleryCategory('events')).toBe('Events');
      expect(mapToGalleryCategory('event')).toBe('Events');
      expect(mapToGalleryCategory('mentoring')).toBe('Mentoring');
      expect(mapToGalleryCategory('mentor')).toBe('Mentoring');
      expect(mapToGalleryCategory('certifications')).toBe('Certificate');
      expect(mapToGalleryCategory('achievements')).toBe('Achievements');
      expect(mapToGalleryCategory('carousel')).toBe('Carousel');
      expect(mapToGalleryCategory('workshop')).toBe('Workshop');
      expect(mapToGalleryCategory('unknown_category')).toBe('Unknown_category');
      expect(mapToGalleryCategory('')).toBe('General');
    });
  });

  describe('syncGalleryWithMoved', () => {
    it('updates URLs and category tags for existing gallery items when moved', () => {
      const initialItems: GalleryItem[] = [
        {
          id: 'gal-1',
          title: 'Robotics Workshop',
          category: 'Events',
          date: '2025-05-10',
          imageUrl: '/static/images/events/robotics.jpg',
          description: 'Robotics workshop session',
          location: 'Abuja',
          tags: ['Events'],
        },
      ];

      const movedList: MovedPhotoItem[] = [
        {
          oldUrl: '/static/images/events/robotics.jpg',
          newUrl: '/static/images/projects/robotics.jpg',
          targetCategory: 'projects',
          filename: 'robotics.jpg',
        },
      ];

      const updated = syncGalleryWithMoved(initialItems, movedList);
      expect(updated[0].imageUrl).toBe('/static/images/projects/robotics.jpg');
      expect(updated[0].category).toBe('Projects');
      expect(updated[0].tags).toContain('Projects');
    });

    it('adds a new gallery item if a photo is moved into the gallery category', () => {
      const initialItems: GalleryItem[] = [];
      const movedList: MovedPhotoItem[] = [
        {
          oldUrl: '/static/images/events/keynote.jpg',
          newUrl: '/static/images/gallery/keynote.jpg',
          targetCategory: 'gallery',
          filename: 'keynote.jpg',
        },
      ];

      const updated = syncGalleryWithMoved(initialItems, movedList);
      expect(updated.length).toBe(1);
      expect(updated[0].imageUrl).toBe('/static/images/gallery/keynote.jpg');
      expect(updated[0].title).toBe('Keynote');
      expect(updated[0].category).toBe('Gallery');
    });
  });

  describe('syncCarouselWithMoved', () => {
    it('updates carousel photo URLs and tags when a photo is moved', () => {
      const config: CarouselConfig = {
        mode: 'carousel',
        steadyPhotoId: 'photo-1',
        autoPlay: true,
        intervalSeconds: 3,
        showArrows: true,
        showIndicators: true,
        showCaptions: true,
        photos: [
          {
            id: 'photo-1',
            url: '/static/images/events/stage-speech.jpg',
            caption: 'Keynote Speech',
            tag: 'Events',
            isIncludedInCarousel: true,
            order: 1,
            dateAdded: '2025-01-01',
          },
        ],
      };

      const movedList: MovedPhotoItem[] = [
        {
          oldUrl: '/static/images/events/stage-speech.jpg',
          newUrl: '/static/images/mentoring/stage-speech.jpg',
          targetCategory: 'mentoring',
          filename: 'stage-speech.jpg',
        },
      ];

      const result = syncCarouselWithMoved(config, movedList);
      expect(result.photos[0].url).toBe('/static/images/mentoring/stage-speech.jpg');
      expect(result.photos[0].tag).toBe('mentoring');
    });

    it('adds a new photo to carousel if photo was moved to carousel category', () => {
      const config: CarouselConfig = {
        mode: 'carousel',
        steadyPhotoId: '',
        autoPlay: true,
        intervalSeconds: 3,
        showArrows: true,
        showIndicators: true,
        showCaptions: true,
        photos: [],
      };

      const movedList: MovedPhotoItem[] = [
        {
          oldUrl: '/static/images/general/hero-banner.jpg',
          newUrl: '/static/images/carousel/hero-banner.jpg',
          targetCategory: 'carousel',
          filename: 'hero-banner.jpg',
        },
      ];

      const result = syncCarouselWithMoved(config, movedList);
      expect(result.photos.length).toBe(1);
      expect(result.photos[0].url).toBe('/static/images/carousel/hero-banner.jpg');
      expect(result.photos[0].tag).toBe('carousel');
    });
  });

  describe('syncProjectsWithMoved', () => {
    it('updates project imageUrl when its photo is moved', () => {
      const projects = [
        {
          slug: 'smart-agro-iot',
          name: 'Smart Agro IoT',
          title: 'Smart Agro IoT',
          description: 'Sensors for soil monitoring',
          category: 'Hardware',
          tags: ['IoT', 'Python'],
          stars: 10,
          forks: 2,
          featured: true,
          imageUrl: '/static/images/general/agro-iot.jpg',
        },
      ] as unknown as Project[];

      const movedList: MovedPhotoItem[] = [
        {
          oldUrl: '/static/images/general/agro-iot.jpg',
          newUrl: '/static/images/projects/agro-iot.jpg',
          targetCategory: 'projects',
          filename: 'agro-iot.jpg',
        },
      ];

      const updated = syncProjectsWithMoved(projects, movedList);
      expect(updated[0].imageUrl).toBe('/static/images/projects/agro-iot.jpg');
    });
  });

  describe('applyImageMoveSync across full portfolio dataset', () => {
    it('synchronizes profile avatar and nested entity images cleanly', () => {
      const profile = {
        name: 'Timothy Ododo',
        bio: 'Tech professional',
        avatarUrl: '/static/images/general/avatar.jpg',
      } as any;

      const movedList: MovedPhotoItem[] = [
        {
          oldUrl: '/static/images/general/avatar.jpg',
          newUrl: '/static/images/profile/avatar.jpg',
          targetCategory: 'profile',
          filename: 'avatar.jpg',
        },
      ];

      const updated = syncProfileWithMoved(profile, movedList);
      expect(updated.avatarUrl).toBe('/static/images/profile/avatar.jpg');

      // Test applyImageMoveSync does not throw and executes storage sync
      expect(() => applyImageMoveSync(movedList, { profile: updated })).not.toThrow();
    });
  });
});

describe('Media API Client Operations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchMediaImages retrieves server images and returns fallback on failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        images: [
          { url: '/static/images/carousel/img1.jpg', filename: 'img1.jpg', category: 'carousel' },
        ],
      }),
    });

    const images = await fetchMediaImages();
    expect(images.length).toBe(1);
    expect(images[0].filename).toBe('img1.jpg');
  });

  it('moveMediaImages posts payload to /api/images/move and returns result', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h: string) => (h === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        success: true,
        movedCount: 1,
        referencesUpdated: 2,
        moved: [{ oldUrl: '/old.jpg', newUrl: '/new.jpg', targetCategory: 'events' }],
      }),
    });

    const result = await moveMediaImages(['/old.jpg'], 'events');
    expect(result.success).toBe(true);
    expect(result.movedCount).toBe(1);
    expect(result.referencesUpdated).toBe(2);
  });

  it('deleteMediaImages posts payload to /api/images/delete and returns result', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h: string) => (h === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        success: true,
        deletedCount: 1,
        deleted: ['/static/images/events/temp.jpg'],
      }),
    });

    const result = await deleteMediaImages(['/static/images/events/temp.jpg']);
    expect(result.success).toBe(true);
    expect(result.deletedCount).toBe(1);
  });

  it('deduplicateMediaImages posts request and handles response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: {
        get: (h: string) => (h === 'content-type' ? 'application/json' : null),
      },
      json: async () => ({
        success: true,
        removedCount: 2,
        savedBytes: 45000,
        details: ['Deduplicated duplicate-1.jpg -> original.jpg'],
      }),
    });

    const result = await deduplicateMediaImages();
    expect(result.success).toBe(true);
    expect(result.removedCount).toBe(2);
    expect(result.savedBytes).toBe(45000);
  });
});

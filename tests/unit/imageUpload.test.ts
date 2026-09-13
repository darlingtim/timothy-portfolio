import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadImageFile } from '../../src/utils/imageUpload';
import { PROFILE, initialCarouselConfig } from '../../src/data';

describe('Image Architecture & Static Storage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('profile avatar points to static/images/profile directory', () => {
    expect(PROFILE.avatarUrl).toBeDefined();
    expect(PROFILE.avatarUrl).toMatch(/^\/static\/images\/profile\/.*\.jpg$/);
  });

  it('carousel photos point to static carousel images or valid URLs', () => {
    expect(initialCarouselConfig.photos.length).toBeGreaterThan(0);
    initialCarouselConfig.photos.forEach((photo) => {
      expect(photo.url).toBeTruthy();
      // Must not be a raw base64 data URI in storage
      expect(photo.url.startsWith('data:image/')).toBe(false);
      expect(
        photo.url.startsWith('/static/images/carousel/') || photo.url.startsWith('https://')
      ).toBe(true);
    });
  });

  it('uploadImageFile sends photo to /api/upload-photo with category and returns static URL', async () => {
    const fakeFile = new File(['fake content'], 'test-avatar.png', { type: 'image/png' });

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        url: '/static/images/profile/test-avatar-1788310000.png',
        filename: 'test-avatar-1788310000.png',
        category: 'profile',
      }),
    });

    const result = await uploadImageFile(fakeFile, { isAvatar: true, category: 'profile' });
    expect(result.url).toBe('/static/images/profile/test-avatar-1788310000.png');
    expect(result.category).toBe('profile');
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/upload-photo',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('"category":"profile"'),
      })
    );
  });

  it('uploadImageFile supports custom categories like projects, gallery, events', async () => {
    const projectFile = new File(['project img'], 'dashboard.png', { type: 'image/png' });

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        url: '/static/images/projects/dashboard-1234.png',
        filename: 'dashboard-1234.png',
        category: 'projects',
      }),
    });

    const result = await uploadImageFile(projectFile, { category: 'projects' });
    expect(result.url).toBe('/static/images/projects/dashboard-1234.png');
    expect(result.category).toBe('projects');
  });

  it('uploadImageFile gracefully falls back to data URL if fetch fails', async () => {
    const fakeFile = new File(['offline content'], 'offline.png', { type: 'image/png' });

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await uploadImageFile(fakeFile);
    expect(result.url).toBeTruthy();
    expect(result.filename).toBe('offline.png');
  });
});

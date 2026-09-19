export type ImageCategory = 
  | 'profile' 
  | 'carousel' 
  | 'projects' 
  | 'experience' 
  | 'education' 
  | 'gallery' 
  | 'events' 
  | 'certifications' 
  | 'achievements' 
  | 'mentoring' 
  | 'general';

export interface UploadImageResult {
  url: string;
  filename: string;
  category?: string;
}

export interface UploadImageOptions {
  category?: ImageCategory | string;
  isAvatar?: boolean;
  caption?: string;
  tag?: string;
}

export interface MediaImageItem {
  url: string;
  filename: string;
  category: string;
  source?: 'uploaded' | 'portfolio' | 'preset';
  modified?: string;
  size?: number;
}

/**
 * Helper to build auth headers with current admin session token
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('timothy_admin_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-admin-token'] = token;
    }
  }
  return headers;
}

/**
 * Safely parses response as JSON, with descriptive errors if the server returned HTML or error status
 */
async function parseResponseSafely<T>(res: Response, fallbackAction: string): Promise<T> {
  const contentType = (res.headers && typeof res.headers.get === 'function')
    ? (res.headers.get('content-type') || '')
    : ((res.headers && (res.headers as any)['content-type']) || 'application/json');
  if (contentType && !contentType.includes('application/json')) {
    const text = await res.text();
    if (res.status === 404) {
      throw new Error(`Media endpoint not found (HTTP 404). Please ensure latest backend routes are active.`);
    }
    if (res.status === 403) {
      throw new Error('Access denied: Administrator authentication required.');
    }
    const cleanSnippet = text.replace(/<[^>]*>?/gm, '').trim().slice(0, 120);
    throw new Error(cleanSnippet ? `Server error (${res.status}): ${cleanSnippet}` : `Failed to ${fallbackAction} (HTTP ${res.status})`);
  }
  const data = await res.json();
  if (!res.ok && !data.error) {
    data.error = `Server returned status ${res.status}`;
  }
  return data;
}

/**
 * Fetches all available photos across all categories from the server API.
 */
export async function fetchMediaImages(): Promise<MediaImageItem[]> {
  try {
    const res = await fetch('/api/images', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        return data.images;
      }
    }
  } catch (err) {
    console.warn('Could not fetch media images from /api/images:', err);
  }

  // Fallback preset / static defaults (only authentic portfolio template assets)
  return [
    { url: '/static/images/carousel/carousel-photo-1.jpg', filename: 'carousel-photo-1.jpg', category: 'carousel', source: 'uploaded' },
    { url: '/static/images/carousel/carousel-photo-2.jpg', filename: 'carousel-photo-2.jpg', category: 'carousel', source: 'uploaded' },
    { url: '/static/images/carousel/carousel-photo-3.jpg', filename: 'carousel-photo-3.jpg', category: 'carousel', source: 'uploaded' },
    { url: '/static/images/certifications/google-it-support-cert.svg', filename: 'google-it-support-cert.svg', category: 'certifications', source: 'uploaded' },
    { url: '/static/images/certifications/rpi-educator-cert.svg', filename: 'rpi-educator-cert.svg', category: 'certifications', source: 'uploaded' },
  ];
}

/**
 * Uploads an image file to the backend API which saves it to category folders under static/images/<category>/.
 * Returns the public URL (e.g. /static/images/profile/avatar-1788310000.jpg).
 * Gracefully falls back to a base64 Data URL if the server is unreachable or offline.
 */
export async function uploadImageFile(
  file: File,
  options?: UploadImageOptions
): Promise<UploadImageResult> {
  const category = options?.category || (options?.isAvatar ? 'profile' : 'general');

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        resolve({ url: '', filename: file.name, category });
        return;
      }

      try {
        const response = await fetch('/api/upload-photo', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            imageData: dataUrl,
            filename: file.name,
            category,
            isAvatar: options?.isAvatar,
            caption: options?.caption,
            tag: options?.tag,
          }),
        });

        if (response.ok) {
          const resData = await parseResponseSafely<any>(response, 'upload image');
          if (resData.success && resData.url) {
            resolve({
              url: resData.url,
              filename: resData.filename || file.name,
              category: resData.category || category,
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Backend image upload error, using local fallback:', err);
      }

      // Safe fallback to dataUrl if network request fails
      resolve({
        url: dataUrl,
        filename: file.name,
        category,
      });
    };

    reader.onerror = (err) => {
      console.error('File reading failed:', err);
      resolve({ url: '', filename: file.name, category });
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Moves one or more images from their current category folder to targetCategory.
 * Updates all references in portfolio data.
 */
export async function moveMediaImages(
  urls: string[],
  targetCategory: string
): Promise<{ success: boolean; movedCount: number; referencesUpdated: number; moved: any[]; updatedData?: any; error?: string }> {
  try {
    const res = await fetch('/api/images/move', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ urls, targetCategory }),
    });
    return await parseResponseSafely<{ success: boolean; movedCount: number; referencesUpdated: number; moved: any[]; updatedData?: any; error?: string }>(res, 'move media images');
  } catch (err: any) {
    console.error('Failed to move media images:', err);
    return { success: false, movedCount: 0, referencesUpdated: 0, moved: [], error: err.message || 'Failed to move images' };
  }
}

/**
 * Permanently deletes one or more images from the server filesystem.
 */
export async function deleteMediaImages(
  urls: string[]
): Promise<{ success: boolean; deletedCount: number; deleted: string[]; error?: string }> {
  try {
    const res = await fetch('/api/images/delete', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ urls }),
    });
    return await parseResponseSafely<{ success: boolean; deletedCount: number; deleted: string[]; error?: string }>(res, 'delete media images');
  } catch (err: any) {
    console.error('Failed to delete media images:', err);
    return { success: false, deletedCount: 0, deleted: [], error: err.message || 'Failed to delete images' };
  }
}

/**
 * Detects duplicate photos across folders, cleans redundant copies,
 * and points all portfolio references to canonical URLs.
 */
export async function deduplicateMediaImages(): Promise<{
  success: boolean;
  removedCount: number;
  savedBytes: number;
  details: string[];
  canonicalMap?: Record<string, string>;
  error?: string;
}> {
  try {
    const res = await fetch('/api/images/deduplicate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({}),
    });
    return await parseResponseSafely<any>(res, 'deduplicate media images');
  } catch (err: any) {
    console.error('Failed to deduplicate media images:', err);
    return { success: false, removedCount: 0, savedBytes: 0, details: [], error: err.message || 'Failed to deduplicate images' };
  }
}


export type ImageCategory = 'profile' | 'carousel' | 'projects' | 'gallery' | 'events' | 'general';

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
          headers: { 'Content-Type': 'application/json' },
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
          const resData = await response.json();
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

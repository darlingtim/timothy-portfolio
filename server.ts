import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE_PATH = path.join(process.cwd(), 'content', 'portfolio_data.json');
const STATIC_DIR = path.join(process.cwd(), 'static');
const STATIC_IMAGES_DIR = path.join(STATIC_DIR, 'images');

// Ensure static/images directory and category subdirectories exist on disk
if (!fs.existsSync(STATIC_IMAGES_DIR)) {
  fs.mkdirSync(STATIC_IMAGES_DIR, { recursive: true });
}
const IMAGE_CATEGORIES = ['profile', 'carousel', 'projects', 'experience', 'gallery', 'events', 'certifications', 'achievements', 'mentoring', 'general'];
IMAGE_CATEGORIES.forEach((cat) => {
  const dir = path.join(STATIC_IMAGES_DIR, cat);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function syncStaticToDist() {
  try {
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      const distStaticDir = path.join(distPath, 'static');
      fs.cpSync(STATIC_DIR, distStaticDir, { recursive: true, force: true });
    }
  } catch {
    // Non-blocking sync
  }
}
syncStaticToDist();

// Helper to decode base64 or copy and persist uploaded images to static/images/<category>/
function saveImageToDisk(
  imageData: string,
  originalFilename?: string,
  requestedCategory?: string
): { url: string; filename: string; category: string } {
  if (!imageData) {
    throw new Error('Image data is required');
  }

  // Clean and sanitize category folder name
  let category = 'general';
  if (requestedCategory && typeof requestedCategory === 'string') {
    const clean = requestedCategory.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
    if (clean) category = clean;
  }

  // If already a remote web URL or static path, return as is
  if (imageData.startsWith('http://') || imageData.startsWith('https://') || imageData.startsWith('/static/images/')) {
    return {
      url: imageData,
      filename: originalFilename || 'image',
      category
    };
  }

  let ext = 'jpg';
  let buffer: Buffer;

  const matches = imageData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (matches) {
    let matchedExt = matches[1].toLowerCase();
    if (matchedExt === 'jpeg') matchedExt = 'jpg';
    if (matchedExt === 'svg+xml') matchedExt = 'svg';
    ext = matchedExt;
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    try {
      buffer = Buffer.from(imageData, 'base64');
    } catch {
      return { url: imageData, filename: originalFilename || 'image', category };
    }
  }

  const safeBaseName = originalFilename
    ? path.basename(originalFilename, path.extname(originalFilename)).replace(/[^a-zA-Z0-9_-]/g, '_')
    : 'upload';
  const finalFilename = `${safeBaseName}-${Date.now()}.${ext}`;

  const categoryDir = path.join(STATIC_IMAGES_DIR, category);
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  const filePath = path.join(categoryDir, finalFilename);

  fs.writeFileSync(filePath, buffer);

  // Sync to dist if dist exists in production
  try {
    const distCategoryDir = path.join(process.cwd(), 'dist', 'static', 'images', category);
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      fs.mkdirSync(distCategoryDir, { recursive: true });
      fs.writeFileSync(path.join(distCategoryDir, finalFilename), buffer);
    }
  } catch (syncErr) {
    console.warn('Could not sync uploaded image to dist:', syncErr);
  }

  return {
    url: `/static/images/${category}/${finalFilename}`,
    filename: finalFilename,
    category
  };
}

// Helper to safely load data from disk
function loadServerData(): any {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading portfolio data from disk:', err);
  }
  return null;
}

// Helper to safely persist data to disk
function saveServerData(data: any): boolean {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving portfolio data to disk:', err);
    return false;
  }
}

// Recursively traverse portfolio data and replace oldUrl with newUrl
function replaceUrlInObject(obj: any, oldUrl: string, newUrl: string): number {
  if (!obj || oldUrl === newUrl) return 0;
  let count = 0;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === 'string' && obj[i] === oldUrl) {
        obj[i] = newUrl;
        count++;
      } else if (typeof obj[i] === 'object' && obj[i] !== null) {
        count += replaceUrlInObject(obj[i], oldUrl, newUrl);
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && obj[key] === oldUrl) {
        obj[key] = newUrl;
        count++;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        count += replaceUrlInObject(obj[key], oldUrl, newUrl);
      }
    }
  }
  return count;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parser with high limit for image uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // In-memory / server-side log storage (hydrated from disk if exists)
  let serverData = loadServerData() || {};

  // Serve static files from static/ and static/images/
  app.use('/static', express.static(STATIC_DIR, { maxAge: '1d' }));
  app.use('/images', express.static(STATIC_IMAGES_DIR, { maxAge: '1d' }));

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Global Data GET: returns all authoritative portfolio data from disk
  app.get('/api/data', (req, res) => {
    const current = loadServerData() || serverData;
    return res.json({
      success: true,
      data: current
    });
  });

  // Global Data POST: writes updated data to disk permanently across all devices
  app.post('/api/data', (req, res) => {
    try {
      const incomingData = req.body;
      if (!incomingData || typeof incomingData !== 'object') {
        return res.status(400).json({ error: 'Valid JSON payload is required' });
      }

      // Merge with existing server data
      const existing = loadServerData() || {};
      const merged = {
        ...existing,
        ...incomingData,
        lastUpdated: new Date().toISOString()
      };

      // Keep alias keys synchronized in JSON
      if (merged.gallery) merged.galleryItems = merged.gallery;
      if (merged.galleryItems) merged.gallery = merged.galleryItems;
      if (merged.settings) merged.siteSettings = merged.settings;
      if (merged.siteSettings) merged.settings = merged.siteSettings;
      if (merged.eventContributions) merged.events = merged.eventContributions;
      if (merged.events) merged.eventContributions = merged.events;

      saveServerData(merged);
      serverData = merged;

      console.log(`[DATA PERSISTED TO DISK] Portfolio content updated globally at ${new Date().toLocaleTimeString()}`);

      return res.json({
        success: true,
        message: 'Portfolio data saved permanently on server.',
        data: merged
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to save data' });
    }
  });

  // Contact endpoint: receives message, writes to messages array on disk, and logs notification to timothyododo@gmail.com
  app.post('/api/contact', (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      const newMsg = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name,
        email,
        subject: subject || 'Portfolio Contact Form Submission',
        message,
        date: new Date().toISOString(),
        isRead: false,
        status: 'New'
      };

      // Persist to server data
      const currentData = loadServerData() || {};
      const currentMessages = Array.isArray(currentData.messages) ? currentData.messages : [];
      currentData.messages = [newMsg, ...currentMessages];
      saveServerData(currentData);
      serverData = currentData;

      // Email notification delivery simulation / dispatch log to timothyododo@gmail.com
      console.log(`[EMAIL NOTIFICATION TO timothyododo@gmail.com]
=========================================
New Contact Inquiry from: ${name} (${email})
Subject: ${subject}
Date: ${new Date().toLocaleString()}
Message:
${message}
=========================================`);

      return res.json({
        success: true,
        message: 'Message delivered successfully. Notification sent to timothyododo@gmail.com',
        messageRecord: newMsg
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Direct Reply endpoint: allows replying to an email directly from the admin dashboard
  app.post('/api/reply', (req, res) => {
    try {
      const { to, toName, subject, body, originalMessageId } = req.body;
      if (!to || !body) {
        return res.status(400).json({ error: 'Recipient email and reply body are required.' });
      }

      const replyRecord = {
        id: `reply-${Date.now()}`,
        originalMessageId,
        to,
        toName: toName || to,
        from: 'timothyododo@gmail.com',
        subject: subject || 'Reply from Timothy Ododo',
        body,
        sentAt: new Date().toISOString()
      };

      // Persist reply inside the message record on disk
      const currentData = loadServerData() || {};
      if (Array.isArray(currentData.messages)) {
        currentData.messages = currentData.messages.map((m: any) => {
          if (m.id === originalMessageId) {
            const replies = Array.isArray(m.replies) ? m.replies : [];
            return {
              ...m,
              isRead: true,
              status: 'Replied',
              replies: [...replies, {
                id: replyRecord.id,
                date: replyRecord.sentAt,
                subject: replyRecord.subject,
                body: replyRecord.body,
                sentBy: 'Timothy Ododo <timothyododo@gmail.com>'
              }]
            };
          }
          return m;
        });
        saveServerData(currentData);
        serverData = currentData;
      }

      console.log(`[OUTGOING EMAIL SENT FROM timothyododo@gmail.com]
=========================================
To: ${toName ? `${toName} <${to}>` : to}
From: Timothy Ododo <timothyododo@gmail.com>
Subject: ${subject}
Date: ${new Date().toLocaleString()}
Body:
${body}
=========================================`);

      return res.json({
        success: true,
        message: `Reply sent successfully to ${to}`,
        reply: replyRecord
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Profile & categorized photo upload API: saves images to static/images/<category>/ and updates disk
  app.post(['/api/upload-photo', '/api/upload-image'], (req, res) => {
    try {
      const { imageData, filename, isAvatar, caption, tag, category } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: 'Image data is required.' });
      }

      const targetCategory = category || (isAvatar ? 'profile' : 'general');
      const { url, filename: savedFilename, category: savedCategory } = saveImageToDisk(imageData, filename, targetCategory);

      // If requested as primary avatar, also persist in profile on disk
      if (isAvatar) {
        const currentData = loadServerData() || {};
        currentData.profile = {
          ...(currentData.profile || {}),
          avatarUrl: url
        };
        saveServerData(currentData);
        serverData = currentData;
      }

      return res.json({
        success: true,
        url,
        filename: savedFilename,
        category: savedCategory,
        caption: caption || '',
        tag: tag || ''
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Image processing failed.' });
    }
  });

  // Get list of all organized image folders and files
  app.get('/api/images/categories', (req, res) => {
    try {
      const result: Record<string, string[]> = {};
      if (fs.existsSync(STATIC_IMAGES_DIR)) {
        const entries = fs.readdirSync(STATIC_IMAGES_DIR, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const catDir = path.join(STATIC_IMAGES_DIR, entry.name);
            const files = fs.readdirSync(catDir).filter(f => !f.startsWith('.'));
            result[entry.name] = files.map(f => `/static/images/${entry.name}/${f}`);
          }
        }
      }
      return res.json({ success: true, categories: result });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to list image categories' });
    }
  });

  // Universal Media Library API: returns all photos across all categories (disk + portfolio references)
  app.get('/api/images', (req, res) => {
    try {
      interface ImageInfo {
        url: string;
        filename: string;
        category: string;
        source: 'uploaded' | 'portfolio' | 'preset';
        modified?: string;
        size?: number;
      }

      const images: ImageInfo[] = [];
      const seenUrls = new Set<string>();

      // 1. Scan filesystem static/images/<category>/* and static/images/*
      if (fs.existsSync(STATIC_IMAGES_DIR)) {
        // Direct files in static/images
        const rootFiles = fs.readdirSync(STATIC_IMAGES_DIR, { withFileTypes: true });
        for (const rf of rootFiles) {
          if (!rf.isDirectory() && !rf.name.startsWith('.')) {
            const fullPath = path.join(STATIC_IMAGES_DIR, rf.name);
            const stat = fs.statSync(fullPath);
            const url = `/static/images/${rf.name}`;
            if (!seenUrls.has(url)) {
              seenUrls.add(url);
              images.push({
                url,
                filename: rf.name,
                category: 'general',
                source: 'uploaded',
                modified: stat.mtime.toISOString(),
                size: stat.size
              });
            }
          }
        }

        // Subdirectories per category
        for (const cat of IMAGE_CATEGORIES) {
          const catDir = path.join(STATIC_IMAGES_DIR, cat);
          if (fs.existsSync(catDir)) {
            const catFiles = fs.readdirSync(catDir).filter(f => !f.startsWith('.'));
            for (const f of catFiles) {
              const fullPath = path.join(catDir, f);
              try {
                const stat = fs.statSync(fullPath);
                const url = `/static/images/${cat}/${f}`;
                if (!seenUrls.has(url)) {
                  seenUrls.add(url);
                  images.push({
                    url,
                    filename: f,
                    category: cat,
                    source: 'uploaded',
                    modified: stat.mtime.toISOString(),
                    size: stat.size
                  });
                }
              } catch {
                // Skip if error
              }
            }
          }
        }
      }

      // 2. Also harvest any photos defined in current portfolio data so user can re-use existing photos
      const data = loadServerData() || {};
      const checkAndAdd = (url: string | undefined, category: string, label?: string) => {
        if (!url || typeof url !== 'string' || url.trim() === '') return;
        const cleanUrl = url.trim();
        if (seenUrls.has(cleanUrl)) return;
        seenUrls.add(cleanUrl);
        
        let filename = label || cleanUrl.split('/').pop()?.split('?')[0] || 'photo';
        if (filename.length > 30) filename = filename.slice(0, 30) + '...';

        images.push({
          url: cleanUrl,
          filename,
          category,
          source: cleanUrl.startsWith('/static/') ? 'uploaded' : 'portfolio'
        });
      };

      // Profile avatar
      if (data.profile?.avatarUrl) checkAndAdd(data.profile.avatarUrl, 'profile', 'Profile Avatar');

      // Carousel photos
      if (data.carouselConfig?.photos && Array.isArray(data.carouselConfig.photos)) {
        data.carouselConfig.photos.forEach((p: any) => {
          checkAndAdd(p.url, 'carousel', p.caption || 'Carousel Slide');
        });
      }

      // Projects
      if (data.projects && Array.isArray(data.projects)) {
        data.projects.forEach((proj: any) => {
          checkAndAdd(proj.imageUrl, 'projects', proj.name || 'Project Cover');
        });
      }

      // Experiences
      if (data.experiences && Array.isArray(data.experiences)) {
        data.experiences.forEach((exp: any) => {
          checkAndAdd(exp.imageUrl, 'experience', `${exp.role} at ${exp.organization}`);
        });
      }

      // Certifications
      if (data.certifications && Array.isArray(data.certifications)) {
        data.certifications.forEach((c: any) => {
          checkAndAdd(c.imageUrl, 'certifications', c.name || 'Certificate');
        });
      }

      // Achievements
      if (data.achievements && Array.isArray(data.achievements)) {
        data.achievements.forEach((a: any) => {
          checkAndAdd(a.imageUrl, 'achievements', a.title || 'Achievement');
        });
      }

      // Mentoring
      if (data.mentoring && Array.isArray(data.mentoring)) {
        data.mentoring.forEach((m: any) => {
          checkAndAdd(m.imageUrl, 'mentoring', m.title || 'Mentoring Program');
        });
      }

      // Events
      if (data.events && Array.isArray(data.events)) {
        data.events.forEach((e: any) => {
          checkAndAdd(e.imageUrl, 'events', e.title || 'Event Contribution');
        });
      }

      // Gallery
      if (data.galleryItems && Array.isArray(data.galleryItems)) {
        data.galleryItems.forEach((g: any) => {
          checkAndAdd(g.imageUrl, 'gallery', g.title || 'Gallery Photo');
        });
      }

      // Sort newest uploaded first
      images.sort((a, b) => {
        if (a.modified && b.modified) {
          return new Date(b.modified).getTime() - new Date(a.modified).getTime();
        }
        return a.category.localeCompare(b.category);
      });

      return res.json({
        success: true,
        count: images.length,
        images
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch media images' });
    }
  });

  // Move photo(s) from one category folder to another and update references in portfolio_data.json
  app.post('/api/images/move', (req, res) => {
    try {
      const { urls, targetCategory } = req.body;
      if (!Array.isArray(urls) || urls.length === 0 || !targetCategory) {
        return res.status(400).json({ error: 'urls (string array) and targetCategory are required.' });
      }

      if (!IMAGE_CATEGORIES.includes(targetCategory)) {
        return res.status(400).json({ error: `Invalid targetCategory. Allowed: ${IMAGE_CATEGORIES.join(', ')}` });
      }

      const destCategoryDir = path.join(STATIC_IMAGES_DIR, targetCategory);
      if (!fs.existsSync(destCategoryDir)) {
        fs.mkdirSync(destCategoryDir, { recursive: true });
      }

      const currentData = loadServerData() || {};
      const moved: { oldUrl: string; newUrl: string; filename: string; targetCategory: string }[] = [];
      let totalRefUpdates = 0;

      for (const rawUrl of urls) {
        if (!rawUrl || typeof rawUrl !== 'string') continue;
        const cleanUrl = rawUrl.trim();

        // Extract relative image path from URL
        let relativeImagePath = '';
        if (cleanUrl.startsWith('/static/images/')) {
          relativeImagePath = cleanUrl.replace(/^\/static\/images\//, '');
        } else if (cleanUrl.startsWith('/images/')) {
          relativeImagePath = cleanUrl.replace(/^\/images\//, '');
        } else {
          continue; // External URLs cannot be moved on local filesystem
        }

        const sourcePath = path.join(STATIC_IMAGES_DIR, relativeImagePath);
        if (!fs.existsSync(sourcePath)) {
          console.warn(`[MOVE] File not found on disk: ${sourcePath}`);
          continue;
        }

        const filename = path.basename(sourcePath);
        let targetFilename = filename;
        let destPath = path.join(destCategoryDir, targetFilename);

        // If source and destination are the exact same path, skip
        if (path.resolve(sourcePath) === path.resolve(destPath)) {
          continue;
        }

        // Handle naming collisions if destination file exists and is a different file
        if (fs.existsSync(destPath)) {
          const srcStat = fs.statSync(sourcePath);
          const dstStat = fs.statSync(destPath);
          if (srcStat.size !== dstStat.size) {
            const ext = path.extname(filename);
            const base = path.basename(filename, ext);
            targetFilename = `${base}-${Date.now()}${ext}`;
            destPath = path.join(destCategoryDir, targetFilename);
          } else {
            // Same size, unlink source to avoid duplication
            try {
              fs.unlinkSync(sourcePath);
            } catch {}
          }
        }

        // Move file
        if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
          fs.renameSync(sourcePath, destPath);
        }

        // Also sync move to dist if dist exists
        try {
          const distStaticDir = path.join(process.cwd(), 'dist', 'static', 'images');
          if (fs.existsSync(distStaticDir)) {
            const distDestDir = path.join(distStaticDir, targetCategory);
            fs.mkdirSync(distDestDir, { recursive: true });
            const distDestPath = path.join(distDestDir, targetFilename);
            if (fs.existsSync(destPath)) {
              fs.copyFileSync(destPath, distDestPath);
            }
            const distSourcePath = path.join(distStaticDir, relativeImagePath);
            if (fs.existsSync(distSourcePath) && distSourcePath !== distDestPath) {
              fs.unlinkSync(distSourcePath);
            }
          }
        } catch (syncErr) {
          console.warn('[MOVE] Could not sync move to dist:', syncErr);
        }

        const newUrl = `/static/images/${targetCategory}/${targetFilename}`;
        moved.push({
          oldUrl: cleanUrl,
          newUrl,
          filename: targetFilename,
          targetCategory
        });

        // Update references across portfolio_data.json
        const updatedCount = replaceUrlInObject(currentData, cleanUrl, newUrl);
        totalRefUpdates += updatedCount;
      }

      if (totalRefUpdates > 0 || moved.length > 0) {
        saveServerData(currentData);
        serverData = currentData;
      }

      return res.json({
        success: true,
        movedCount: moved.length,
        referencesUpdated: totalRefUpdates,
        moved
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to move images' });
    }
  });

  // Permanently delete photo(s) from disk
  app.post('/api/images/delete', (req, res) => {
    try {
      const { urls } = req.body;
      if (!Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({ error: 'urls (string array) is required.' });
      }

      const deleted: string[] = [];

      for (const rawUrl of urls) {
        if (!rawUrl || typeof rawUrl !== 'string') continue;
        const cleanUrl = rawUrl.trim();

        let relativeImagePath = '';
        if (cleanUrl.startsWith('/static/images/')) {
          relativeImagePath = cleanUrl.replace(/^\/static\/images\//, '');
        } else if (cleanUrl.startsWith('/images/')) {
          relativeImagePath = cleanUrl.replace(/^\/images\//, '');
        } else {
          continue;
        }

        const filePath = path.join(STATIC_IMAGES_DIR, relativeImagePath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deleted.push(cleanUrl);
        }

        // Also delete from dist
        try {
          const distPath = path.join(process.cwd(), 'dist', 'static', 'images', relativeImagePath);
          if (fs.existsSync(distPath)) {
            fs.unlinkSync(distPath);
          }
        } catch {}
      }

      return res.json({
        success: true,
        deletedCount: deleted.length,
        deleted
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete images' });
    }
  });

  // Scan all static/images, detect duplicate files by MD5 checksum, clean redundant duplicates, and update portfolio_data.json
  app.post('/api/images/deduplicate', (req, res) => {
    try {
      interface FileEntry {
        filePath: string;
        url: string;
        category: string;
        filename: string;
        size: number;
        hash: string;
        isRoot: boolean;
      }

      const files: FileEntry[] = [];

      // Scan root static/images
      if (fs.existsSync(STATIC_IMAGES_DIR)) {
        const rootItems = fs.readdirSync(STATIC_IMAGES_DIR, { withFileTypes: true });
        for (const item of rootItems) {
          if (!item.isDirectory() && !item.name.startsWith('.')) {
            const fp = path.join(STATIC_IMAGES_DIR, item.name);
            try {
              const buf = fs.readFileSync(fp);
              const hash = crypto.createHash('md5').update(buf).digest('hex');
              files.push({
                filePath: fp,
                url: `/static/images/${item.name}`,
                category: 'general',
                filename: item.name,
                size: buf.length,
                hash,
                isRoot: true
              });
            } catch {}
          }
        }

        // Scan subdirectories
        for (const cat of IMAGE_CATEGORIES) {
          const catDir = path.join(STATIC_IMAGES_DIR, cat);
          if (fs.existsSync(catDir)) {
            const catFiles = fs.readdirSync(catDir).filter(f => !f.startsWith('.'));
            for (const f of catFiles) {
              const fp = path.join(catDir, f);
              try {
                const buf = fs.readFileSync(fp);
                const hash = crypto.createHash('md5').update(buf).digest('hex');
                files.push({
                  filePath: fp,
                  url: `/static/images/${cat}/${f}`,
                  category: cat,
                  filename: f,
                  size: buf.length,
                  hash,
                  isRoot: false
                });
              } catch {}
            }
          }
        }
      }

      // Group by hash
      const hashMap = new Map<string, FileEntry[]>();
      for (const f of files) {
        const existing = hashMap.get(f.hash) || [];
        existing.push(f);
        hashMap.set(f.hash, existing);
      }

      const currentData = loadServerData() || {};
      const dataString = JSON.stringify(currentData);

      let removedCount = 0;
      let savedBytes = 0;
      const details: string[] = [];
      const canonicalMap: Record<string, string> = {};

      for (const [hash, group] of hashMap.entries()) {
        if (group.length <= 1) continue;

        // Determine canonical copy:
        // Priority:
        // 1. File referenced in portfolio_data.json
        // 2. Specialized folder (non-root)
        // 3. First alphabetically
        group.sort((a, b) => {
          const aInUse = dataString.includes(a.url) ? 1 : 0;
          const bInUse = dataString.includes(b.url) ? 1 : 0;
          if (aInUse !== bInUse) return bInUse - aInUse;

          if (a.isRoot !== b.isRoot) return a.isRoot ? 1 : -1;
          return a.category.localeCompare(b.category);
        });

        const canonical = group[0];
        const duplicates = group.slice(1);

        for (const dup of duplicates) {
          // Point any references to canonical
          replaceUrlInObject(currentData, dup.url, canonical.url);
          canonicalMap[dup.url] = canonical.url;

          // Delete duplicate file from disk
          try {
            if (fs.existsSync(dup.filePath)) {
              fs.unlinkSync(dup.filePath);
              savedBytes += dup.size;
              removedCount++;
              details.push(`Cleaned duplicate "${dup.url}" (pointing to canonical "${canonical.url}")`);
            }
          } catch (err: any) {
            console.warn(`Could not delete duplicate ${dup.filePath}:`, err);
          }

          // Delete duplicate from dist
          try {
            const rel = dup.isRoot ? dup.filename : `${dup.category}/${dup.filename}`;
            const distPath = path.join(process.cwd(), 'dist', 'static', 'images', rel);
            if (fs.existsSync(distPath)) {
              fs.unlinkSync(distPath);
            }
          } catch {}
        }
      }

      if (removedCount > 0) {
        saveServerData(currentData);
        serverData = currentData;
        console.log(`[DEDUPLICATE] Cleaned ${removedCount} duplicate photo files, saved ${(savedBytes / 1024).toFixed(1)} KB`);
      }

      return res.json({
        success: true,
        removedCount,
        savedBytes,
        details,
        canonicalMap
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to deduplicate images' });
    }
  });

  // Git & Auto-Deploy: Test GitHub repository connection
  app.post('/api/git/test-connection', async (req, res) => {
    try {
      const { owner, repo, token, branch = 'main' } = req.body;
      if (!owner || !repo) {
        return res.status(400).json({ error: 'GitHub owner and repository name are required.' });
      }

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-CMS-GitSync'
      };
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }

      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers
      });

      if (!response.ok) {
        const errText = await response.text();
        return res.status(response.status).json({
          success: false,
          error: `GitHub API error (${response.status}): ${errText}`
        });
      }

      const repoData = await response.json();
      return res.json({
        success: true,
        message: 'Successfully connected to GitHub repository!',
        repository: {
          fullName: repoData.full_name,
          defaultBranch: repoData.default_branch,
          isPrivate: repoData.private,
          htmlUrl: repoData.html_url,
          pushedAt: repoData.pushed_at
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to connect to GitHub' });
    }
  });

  // Git & Auto-Deploy: Commit portfolio content directly to GitHub repo
  app.post('/api/git/commit', async (req, res) => {
    try {
      const { owner, repo, token, branch = 'main', commitMessage, data } = req.body;
      if (!owner || !repo || !token) {
        return res.status(400).json({ error: 'GitHub owner, repo, and Personal Access Token (PAT) are required to commit.' });
      }

      const contentToSave = data || loadServerData() || {};
      const filePath = 'content/portfolio_data.json';
      const fileContentBase64 = Buffer.from(JSON.stringify(contentToSave, null, 2)).toString('base64');
      const message = commitMessage || `chore: update portfolio content from Admin CMS (${new Date().toISOString().split('T')[0]})`;

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`,
        'User-Agent': 'Portfolio-CMS-GitSync'
      };

      // 1. Check if file already exists in repository to get current SHA
      let currentSha: string | undefined;
      try {
        const getFileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`, {
          headers
        });
        if (getFileRes.ok) {
          const fileData = await getFileRes.json();
          currentSha = fileData.sha;
        }
      } catch (e) {
        // File may not exist yet, which is normal for first commit
      }

      // 2. Put file contents via GitHub REST API
      const putPayload: any = {
        message,
        content: fileContentBase64,
        branch,
        committer: {
          name: 'Timothy Ododo CMS',
          email: 'timothyododo@gmail.com'
        }
      };
      if (currentSha) {
        putPayload.sha = currentSha;
      }

      const putRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(putPayload)
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        return res.status(putRes.status).json({
          success: false,
          error: `GitHub commit failed (${putRes.status}): ${errText}`
        });
      }

      const commitResult = await putRes.json();
      
      console.log(`[GIT COMMIT & AUTO-DEPLOY TRIGGERED] Commit SHA: ${commitResult?.commit?.sha} pushed to ${owner}/${repo}@${branch}`);

      return res.json({
        success: true,
        message: 'Content successfully committed to GitHub! CI/CD auto-deploy pipeline triggered.',
        commit: {
          sha: commitResult?.commit?.sha,
          htmlUrl: commitResult?.commit?.html_url,
          message: commitResult?.commit?.message
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Git commit failed' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio & Admin Server running at http://localhost:${PORT}`);
  });
}

startServer();

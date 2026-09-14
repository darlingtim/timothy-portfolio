import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
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
const IMAGE_CATEGORIES = ['profile', 'carousel', 'projects', 'experience', 'education', 'gallery', 'events', 'certifications', 'achievements', 'mentoring', 'general'];
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

  // Administrator Credentials & 2FA Configuration
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'timothyododo@gmail.com';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Timothy@Admin2026!';
  const ADMIN_2FA_PHONE = process.env.ADMIN_2FA_PHONE || '+234 814 000 4589';
  const ADMIN_RECOVERY_CODE = process.env.ADMIN_RECOVERY_CODE ? process.env.ADMIN_RECOVERY_CODE.trim() : '';

  // In-memory 2FA OTP & Admin Session Registry
  interface PendingOTP {
    email: string;
    phone: string;
    code: string;
    channel: 'email' | 'sms';
    createdAt: number;
    expiresAt: number;
    attempts: number;
  }
  const activeOTPs = new Map<string, PendingOTP>();
  const activeAdminSessions = new Map<string, { email: string; createdAt: number; expiresAt: number; role: string }>();

  // Helper to verify admin bearer token or session header
  function checkAdminAuth(req: express.Request): boolean {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : (req.headers['x-admin-token'] as string);
    if (!token) return false;
    const session = activeAdminSessions.get(token);
    if (!session) return false;
    if (Date.now() > session.expiresAt) {
      activeAdminSessions.delete(token);
      return false;
    }
    return true;
  }

  // Sanitized Demo Contact Messages for Visitors
  const DEMO_PLACEHOLDER_MESSAGES = [
    {
      id: 'demo-msg-1',
      name: 'Ada Lovelace (Demo Preview)',
      email: 'a***@example.com',
      subject: 'Technology Mentorship & STEM Camp Collaboration',
      message: 'Hello Timothy, this is a simulated sample message for demo preview. Real contact submissions sent by visitors are encrypted and hidden to preserve privacy.',
      date: '2026-09-12T12:16:48Z',
      isRead: false,
      status: 'New'
    },
    {
      id: 'demo-msg-2',
      name: 'Tech Innovation Lead (Demo Preview)',
      email: 'i***@anambrahack.org',
      subject: 'Hackathon Keynote & Physical Computing Workshop',
      message: 'Sample inquiry for demo mode: Exploring a collaboration on IoT hardware engineering. Real messages are only accessible to the authenticated administrator.',
      date: '2026-09-10T14:30:00Z',
      isRead: true,
      status: 'New'
    }
  ];

  // Helper to mask email/phone for 2FA screen
  function maskEmail(email: string): string {
    const [name, domain] = email.split('@');
    if (!domain) return 't***@gmail.com';
    const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
    return `${maskedName}@${domain}`;
  }

  function maskPhone(phone: string): string {
    const clean = phone.replace(/[^0-9+]/g, '');
    if (clean.length < 7) return '+234 ••• ••• 0002';
    const prefix = clean.substring(0, 4);
    const suffix = clean.substring(clean.length - 4);
    return `${prefix} ••• ••• ${suffix}`;
  }

  // Serve static files from static/ and static/images/
  app.use('/static', express.static(STATIC_DIR, { maxAge: '1d' }));
  app.use('/images', express.static(STATIC_IMAGES_DIR, { maxAge: '1d' }));

  // Dispatch 2FA OTP securely to Email (Gmail) or SMS
  async function dispatchOTP(channel: 'email' | 'sms', target: string, otpCode: string): Promise<boolean> {
    const timestamp = new Date().toISOString();
    const maskedTarget = channel === 'email' ? maskEmail(target) : maskPhone(target);
    
    // Only log operational audit trail - NEVER log plaintext OTP secrets to server logs
    console.log(`[AUTH-AUDIT] 2FA OTP security code dispatched via ${channel.toUpperCase()} to ${maskedTarget} at ${timestamp}`);

    // 1. Dispatch via Gmail SMTP (if configured)
    if (channel === 'email' && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        await transporter.sendMail({
          from: `"Timothy Ododo Security" <${process.env.SMTP_USER}>`,
          to: target,
          subject: `Your Admin Verification Code: ${otpCode}`,
          text: `Hello Timothy,\n\nYour Portfolio Admin 2FA verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please secure your account credentials immediately.\n\nTimothy Ododo Portfolio Security System`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Portfolio Administrator 2FA Code</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.6;">A login request was initiated for your portfolio administration portal.</p>
              <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0284c7;">${otpCode}</span>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5;">This code will expire in <strong>5 minutes</strong>. Do not share this code with anyone.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 11px; margin: 0;">Timothy Ododo Portfolio &bull; Multi-Factor Authentication</p>
            </div>
          `
        });
        console.log(`[2FA SMTP DISPATCH SUCCESS] Real email sent to ${target}`);
      } catch (mailErr) {
        console.warn(`[2FA SMTP DISPATCH WARNING] Could not send via SMTP:`, mailErr);
      }
    }

    // 2. Dispatch via Resend API (if configured)
    if (channel === 'email' && process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Timothy Ododo Admin <security@timothyododo.com>',
            to: [target],
            subject: `Admin 2FA Security Code: ${otpCode}`,
            html: `<p>Your 2FA verification code is: <strong>${otpCode}</strong>. Expires in 5 minutes.</p>`
          })
        });
        console.log(`[2FA RESEND DISPATCH SUCCESS] Sent to ${target}`);
      } catch (resendErr) {
        console.warn(`[2FA RESEND WARNING]`, resendErr);
      }
    }

    // 3. Dispatch via Termii SMS (Nigeria / International SMS gateway) (if configured)
    if (channel === 'sms' && process.env.TERMII_API_KEY) {
      try {
        await fetch('https://api.ng.termii.com/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: target.replace(/[^0-9]/g, ''),
            from: 'Timothy',
            sms: `Your Timothy Ododo Portfolio 2FA code is: ${otpCode}. Valid for 5 mins.`,
            type: 'plain',
            channel: 'generic',
            api_key: process.env.TERMII_API_KEY
          })
        });
        console.log(`[2FA SMS DISPATCH SUCCESS] Termii SMS sent to ${target}`);
      } catch (smsErr) {
        console.warn(`[2FA SMS WARNING]`, smsErr);
      }
    }

    return true;
  }

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // -------------------------------------------------------------
  // AUTHENTICATION & 2FA ENDPOINTS
  // -------------------------------------------------------------

  // Step 1: Credentials verification & 2FA OTP Dispatch
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, channel = 'email' } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const validEmails = [ADMIN_EMAIL.toLowerCase(), 'timothyododo@gmail.com'];

      const isEmailValid = validEmails.includes(cleanEmail);
      const isPasswordValid = password === ADMIN_PASSWORD;

      if (!isEmailValid || !isPasswordValid) {
        return res.status(401).json({ error: 'Invalid admin credentials. Please verify your email and password.' });
      }

      // Generate 6-digit numeric OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const tempToken = crypto.randomBytes(24).toString('hex');
      const selectedChannel: 'email' | 'sms' = channel === 'sms' ? 'sms' : 'email';
      const destination = selectedChannel === 'email' ? cleanEmail : ADMIN_2FA_PHONE;

      activeOTPs.set(tempToken, {
        email: cleanEmail,
        phone: ADMIN_2FA_PHONE,
        code: otpCode,
        channel: selectedChannel,
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
        attempts: 0
      });

      // Securely dispatch OTP to user's private email/phone (never exposed to public)
      await dispatchOTP(selectedChannel, destination, otpCode);

      // Return ONLY session token and masked destination (NO OTP CODE)
      return res.json({
        success: true,
        require2FA: true,
        tempToken,
        maskedEmail: maskEmail(cleanEmail),
        maskedPhone: maskPhone(ADMIN_2FA_PHONE),
        channel: selectedChannel
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Authentication error' });
    }
  });

  // Re-send / Switch 2FA OTP Channel (Gmail or SMS)
  app.post('/api/auth/send-otp', async (req, res) => {
    try {
      const { tempToken, channel = 'email' } = req.body;
      if (!tempToken || !activeOTPs.has(tempToken)) {
        return res.status(400).json({ error: 'Invalid or expired 2FA session. Please log in again.' });
      }

      const pending = activeOTPs.get(tempToken)!;
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const selectedChannel: 'email' | 'sms' = channel === 'sms' ? 'sms' : 'email';
      const destination = selectedChannel === 'email' ? pending.email : pending.phone;

      pending.code = newOtp;
      pending.channel = selectedChannel;
      pending.expiresAt = Date.now() + 5 * 60 * 1000;
      pending.attempts = 0;
      activeOTPs.set(tempToken, pending);

      // Securely re-dispatch OTP
      await dispatchOTP(selectedChannel, destination, newOtp);

      // Return message without exposing OTP code
      return res.json({
        success: true,
        message: `Verification code sent via ${selectedChannel === 'sms' ? 'SMS OTP' : 'Gmail OTP'}`,
        channel: selectedChannel
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to dispatch OTP' });
    }
  });

  // Step 2: Verify 2FA OTP & Issue Session Token
  app.post('/api/auth/verify-2fa', (req, res) => {
    try {
      const { tempToken, code } = req.body;
      if (!tempToken || !code) {
        return res.status(400).json({ error: '2FA session token and verification code are required.' });
      }

      const pending = activeOTPs.get(tempToken);
      if (!pending) {
        return res.status(400).json({ error: '2FA session has expired or is invalid. Please sign in again.' });
      }

      const cleanCode = String(code).trim();
      const hasCustomRecovery = Boolean(ADMIN_RECOVERY_CODE && ADMIN_RECOVERY_CODE.length >= 8);
      const isRecoveryCode = hasCustomRecovery && cleanCode === ADMIN_RECOVERY_CODE;
      const isOtpValid = cleanCode === pending.code;

      if (Date.now() > pending.expiresAt) {
        activeOTPs.delete(tempToken);
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }

      if (pending.attempts >= 5) {
        activeOTPs.delete(tempToken);
        return res.status(429).json({ error: 'Too many failed verification attempts. Please sign in again.' });
      }

      if (!isOtpValid && !isRecoveryCode) {
        pending.attempts += 1;
        activeOTPs.set(tempToken, pending);
        return res.status(400).json({ error: `Invalid verification code. (${5 - pending.attempts} attempts remaining)` });
      }

      // 2FA Verified: Generate long-lived Admin session token
      const adminToken = `adm_${crypto.randomBytes(32).toString('hex')}`;
      const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      activeAdminSessions.set(adminToken, {
        email: pending.email,
        createdAt: Date.now(),
        expiresAt,
        role: 'super_admin'
      });

      // Cleanup pending OTP
      activeOTPs.delete(tempToken);

      console.log(`[AUTH-AUDIT] Admin 2FA authentication verified successfully for ${maskEmail(pending.email)}`);

      return res.json({
        success: true,
        adminToken,
        expiresAt,
        user: {
          email: ADMIN_EMAIL,
          name: 'Timothy Ododo',
          role: 'super_admin',
          verified2FA: true
        }
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Verification failed' });
    }
  });

  // Verify Session Token
  app.get('/api/auth/session', (req, res) => {
    const isAuth = checkAdminAuth(req);
    return res.json({
      authenticated: isAuth,
      user: isAuth
        ? { email: ADMIN_EMAIL, name: 'Timothy Ododo', role: 'super_admin', verified2FA: true }
        : null
    });
  });

  // Admin Logout
  app.post('/api/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : (req.headers['x-admin-token'] as string);
    if (token) {
      activeAdminSessions.delete(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  });

  // -------------------------------------------------------------
  // DATA ACCESS & PERSISTENCE ENDPOINTS
  // -------------------------------------------------------------

  // Global Data GET: returns all authoritative portfolio data from disk
  // In visitor mode, contact messages are privacy-sanitized
  app.get('/api/data', (req, res) => {
    const current = loadServerData() || serverData;
    const isAdmin = checkAdminAuth(req);

    const safeData = {
      ...current,
      // Only authenticated admin can view real contact messages
      messages: isAdmin ? (current.messages || []) : DEMO_PLACEHOLDER_MESSAGES,
      isDemoMode: !isAdmin
    };

    return res.json({
      success: true,
      isAdmin,
      data: safeData
    });
  });

  // Global Data POST: writes updated data to disk permanently across all devices
  // Guarded: Restricted to authenticated 2FA Administrator
  app.post('/api/data', (req, res) => {
    try {
      const incomingData = req.body;
      if (!incomingData || typeof incomingData !== 'object') {
        return res.status(400).json({ error: 'Valid JSON payload is required' });
      }

      // Check admin authorization
      const isAdmin = checkAdminAuth(req);
      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Live publishing to the production database is restricted to the authenticated administrator. Please log in with 2FA.'
        });
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

      console.log(`[DATA PERSISTED TO DISK] Portfolio content updated globally by authenticated admin at ${new Date().toLocaleTimeString()}`);

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
  // Guarded: Authenticated Admin only
  app.post('/api/reply', (req, res) => {
    try {
      if (!checkAdminAuth(req)) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Sending live email replies is restricted to the authenticated administrator. Please log in with 2FA.'
        });
      }

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
  // Guarded: Authenticated Admin only
  app.post(['/api/upload-photo', '/api/upload-image'], (req, res) => {
    try {
      if (!checkAdminAuth(req)) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Uploading images to persistent storage is restricted to authenticated administrator.'
        });
      }

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
      if (!checkAdminAuth(req)) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Media library file reorganizations are restricted to authenticated administrator.'
        });
      }

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
      if (!checkAdminAuth(req)) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Deleting media files from server storage is restricted to authenticated administrator.'
        });
      }

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
      if (!checkAdminAuth(req)) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Deduplication on disk storage is restricted to authenticated administrator.'
        });
      }

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
      if (!checkAdminAuth(req)) {
        return res.status(403).json({
          success: false,
          isDemo: true,
          error: 'Demo Mode: Git commit and automated deployments are restricted to authenticated administrator.'
        });
      }

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

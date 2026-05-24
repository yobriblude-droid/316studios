import express, { Request, Response, NextFunction } from "express";
import "express-async-errors";
import { createServer as createHttpServer } from "http";
import path from "path";
import { createServer as createViteServer } from "vite";
import { attachSocketServer, type SocketServerApi } from "./server/socket-server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import { randomUUID } from "crypto";
import fileUpload, { UploadedFile } from "express-fileupload";
import cookieParser from "cookie-parser";
import JSZip from "jszip"; // For creating ZIP archives if needed
import dotenv from "dotenv"; // Load environment variables
import database, { initializeDatabase } from "./src/database";
import { parseStaffPermissions, hasPermission, type StaffPermission } from "./src/lib/roles";
import {
  ensureMediaDirs,
  saveMediaFileUniversal as saveMediaFile,
  listMediaFilesUniversal as listMediaFiles,
  deleteMediaFileUniversal as deleteMediaFile,
  MEDIA_ROOT,
  LEGACY_MEDIA_ROOT,
  MEDIA_SUBDIRS,
  sanitizeSubdir,
} from "./server/lib/media-storage";
const db = database;

type AuthTokenPayload = {
  id: string;
  email: string;
  role?: "admin" | "client";
  iat?: number;
  exp?: number;
};

// Load environment variables from .env file
dotenv.config();

// Augment the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
      admin?: AuthTokenPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('Missing JWT_SECRET in environment. See .env.example');
  }
  return JWT_SECRET;
}
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

ensureMediaDirs();
if (!process.env.VERCEL) {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const asBody = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

function parseProjectImageUrls(body: Record<string, unknown>): string[] {
  const raw = body.images;
  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return [];
    try {
      const parsed = JSON.parse(t) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
      }
    } catch {
      return [t];
    }
  }
  if (Array.isArray(raw)) {
    return raw.filter((u): u is string => typeof u === "string" && u.trim().length > 0);
  }
  return [];
}

type DbUserRow = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: string;
  staffPermissions?: string;
  avatarUrl?: string | null;
};

function toPublicClientUser(user: DbUserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
  };
}

function toPublicAdminUser(user: DbUserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl || null,
    staffPermissions: parseStaffPermissions(user.staffPermissions),
  };
}

const oneFile = (value: UploadedFile | UploadedFile[] | undefined): UploadedFile | null => {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
};

const CLIENT_AUTH_COOKIE = "auth_token";
const ADMIN_AUTH_COOKIE = "admin_auth_token";

const getAuthToken = (req: Request, admin: boolean) => {
  const bearer = req.headers['authorization']?.split(' ')[1];
  if (bearer) return bearer;
  const cookieToken = admin ? req.cookies?.[ADMIN_AUTH_COOKIE] : req.cookies?.[CLIENT_AUTH_COOKIE];
  return cookieToken || null;
};

const setAuthCookie = (res: Response, token: string, admin: boolean) => {
  res.cookie(admin ? ADMIN_AUTH_COOKIE : CLIENT_AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

const clearAuthCookies = (res: Response) => {
  const options = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production" };
  res.clearCookie(CLIENT_AUTH_COOKIE, options);
  res.clearCookie(ADMIN_AUTH_COOKIE, options);
};

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const boundedText = (value: unknown, min = 1, max = 2000) => typeof value === "string" && value.trim().length >= min && value.trim().length <= max;

type RateBucket = { count: number; resetAt: number };
const createRateLimiter = (windowMs: number, max: number) => {
  const buckets = new Map<string, RateBucket>();
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${req.path}:${ip}`;
    const now = Date.now();
    const current = buckets.get(key);
    if (!current || now > current.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    current.count += 1;
    if (current.count > max) {
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    next();
  };
};

const authRateLimit = createRateLimiter(15 * 60 * 1000, 20);
const publicWriteRateLimit = createRateLimiter(60 * 1000, 30);

let socketApi: SocketServerApi | null = null;

// Auth Middleware for clients
const authenticateClientToken = (req: Request, res: Response, next: NextFunction) => {
  const token = getAuthToken(req, false);
  if (!token) return res.sendStatus(401);

  jwt.verify(token, requireJwtSecret(), (err, user) => {
    if (err) return res.sendStatus(403);
    if (!user || typeof user === "string") return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth Middleware for admins and staff
  const authenticateAdminToken = async (req: Request, res: Response, next: NextFunction) => {
    const token = getAuthToken(req, true);
    if (!token) return res.sendStatus(401);

    try {
      const user = await new Promise<AuthTokenPayload>((resolve, reject) => {
        jwt.verify(token, requireJwtSecret(), (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded as AuthTokenPayload);
        });
      });
      if (!user || typeof user === "string") return res.sendStatus(403);
      const dbUser = await db.getUserById(user.id);
      if (!dbUser || (dbUser.role !== 'admin' && dbUser.role !== 'staff')) {
        return res.sendStatus(403);
      }
      req.admin = user;
      next();
    } catch {
      return res.sendStatus(403);
    }
  };

  const requireAdminRole = async (req: Request, res: Response, next: NextFunction) => {
    const dbUser = await db.getUserById(req.admin!.id);
    if (!dbUser || dbUser.role !== 'admin') return res.sendStatus(403);
    next();
  };

  const requireStaffPermission = (perm: StaffPermission) => async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const dbUser = await db.getUserById(req.admin!.id);
    if (!dbUser) return res.sendStatus(403);
    const perms = parseStaffPermissions(dbUser.staffPermissions);
    if (!hasPermission(dbUser.role, perms, perm)) return res.sendStatus(403);
    next();
  };

// File upload middleware configuration
const fileUploadOptions = {
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
  responseOnLimit: "File size limit exceeded",
  safeFileNames: true,
  preserveExtension: true,
};

async function createApp() {
  // Initialize database first
  await initializeDatabase();
  
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });
  app.use(fileUpload(fileUploadOptions));
  if (!process.env.VERCEL) {
    app.use("/uploads", express.static(UPLOAD_DIR));
    app.use("/media", express.static(MEDIA_ROOT, { fallthrough: true }));
    if (fs.existsSync(LEGACY_MEDIA_ROOT)) {
      app.use("/media", express.static(LEGACY_MEDIA_ROOT, { fallthrough: true }));
    }
  }

  // --- Client API Routes ---

   app.post("/api/auth/register", authRateLimit, async (req, res) => {
     const { email, password, name } = req.body;
     if (!boundedText(name, 2, 80) || !isValidEmail(email) || !boundedText(password, 8, 128)) {
       return res.status(400).json({ error: "Invalid registration payload" });
     }
     const existingUser = await db.getUserByEmail(email);
     if (existingUser) {
       return res.status(400).json({ error: "User already exists" });
     }
     const hashedPassword = await bcrypt.hash(password, 10);
     const newUser = await db.createUser({ 
       id: randomUUID(), 
       email, 
       password: hashedPassword, 
       name,
       role: "client" // Default role for new registrations
     });
     const token = jwt.sign({ id: newUser.id, email: newUser.email }, requireJwtSecret(), { expiresIn: '7d' });
     setAuthCookie(res, token, false);
     const u = await db.getUserById(newUser.id)!;
     res.json({ token, user: toPublicClientUser(u as DbUserRow) });
   });

   app.post("/api/auth/login", authRateLimit, async (req, res) => {
     const { email, password } = req.body;
     if (!isValidEmail(email) || !boundedText(password, 1, 128)) {
       return res.status(400).json({ error: "Invalid login payload" });
     }
     const user = await db.getUserByEmail(email);
     if (!user || !(await bcrypt.compare(password, user.password))) {
       return res.status(401).json({ error: "Invalid credentials" });
     }
     const token = jwt.sign({ id: user.id, email: user.email }, requireJwtSecret(), { expiresIn: '7d' });
     setAuthCookie(res, token, false);
     res.json({ token, user: toPublicClientUser(user as DbUserRow) });
   });

   app.post("/api/auth/logout", async (req, res) => {
    clearAuthCookies(res);
    res.json({ success: true });
   });

   app.get("/api/auth/me", authenticateClientToken, async (req, res) => {
     const user = await db.getUserById(req.user!.id);
     if (!user) return res.sendStatus(404);
     res.json(toPublicClientUser(user as DbUserRow));
   });

   app.post("/api/auth/avatar", authenticateClientToken, async (req, res) => {
     const file = oneFile(req.files?.avatar as UploadedFile | UploadedFile[] | undefined);
     if (!file) return res.status(400).json({ error: "No image uploaded" });
     try {
       const url = await saveMediaFile(file, "avatars");
       await db.updateUserProfile(req.user!.id, { avatarUrl: url });
       const user = await db.getUserById(req.user!.id)!;
       res.json(toPublicClientUser(user as DbUserRow));
     } catch (err: unknown) {
       res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
     }
   });

   app.delete("/api/auth/avatar", authenticateClientToken, async (req, res) => {
     await db.updateUserProfile(req.user!.id, { avatarUrl: null });
     const user = await db.getUserById(req.user!.id)!;
     res.json(toPublicClientUser(user as DbUserRow));
   });

   app.put("/api/auth/profile", authenticateClientToken, async (req, res) => {
     const { name, email } = req.body;
     if (!boundedText(name, 2, 120)) return res.status(400).json({ error: "Invalid name" });
     if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
     const existing = email ? await db.getUserByEmail(email) : null;
     if (existing && existing.id !== req.user!.id) {
       return res.status(409).json({ error: "Email already in use" });
     }
     await db.updateUserProfile(req.user!.id, { name: name.trim(), email: email?.trim() });
     const user = await db.getUserById(req.user!.id)!;
     res.json(toPublicClientUser(user as DbUserRow));
   });

   app.post("/api/contact", authRateLimit, async (req, res) => {
     const { name, email, message } = req.body;
     if (!boundedText(name, 2, 120) || !isValidEmail(email) || !boundedText(message, 10, 5000)) {
       return res.status(400).json({ error: "Name, valid email, and message (10+ chars) required" });
     }
     await db.createContactSubmission({
       id: randomUUID(),
       name: name.trim(),
       email: email.trim(),
       message: message.trim(),
       createdAt: new Date().toISOString(),
     });
     res.status(201).json({ success: true });
   });

   app.post("/api/auth/change-password", authenticateClientToken, authRateLimit, async (req, res) => {
     const { currentPassword, newPassword } = req.body;
     if (!boundedText(currentPassword, 1, 128) || !boundedText(newPassword, 8, 128)) {
       return res.status(400).json({ error: "Password must be at least 8 characters" });
     }
     const user = await db.getUserById(req.user!.id);
     if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
       return res.status(401).json({ error: "Current password is incorrect" });
     }
     const hashed = await bcrypt.hash(newPassword, 10);
     await db.updateUserPassword(user.id, hashed);
     res.json({ success: true });
   });

   app.get("/api/client/messages", authenticateClientToken, async (req, res) => {
     await db.markMessagesReadByClient(req.user!.id);
     res.json(await db.getClientMessages(req.user!.id));
   });

   app.post("/api/client/messages", authenticateClientToken, async (req, res) => {
     const { body } = req.body;
     if (!boundedText(body, 1, 4000)) return res.status(400).json({ error: "Message required" });
     const msg = {
       id: randomUUID(),
       clientId: req.user!.id,
       senderId: req.user!.id,
       senderRole: "client",
       body: body.trim(),
     };
     await db.createClientMessage(msg);
     for (const admin of await db.getAdmins()) {
       if (socketApi) {
         socketApi.notifyUser(admin.id, {
           userId: admin.id,
           type: "message",
           title: "Client message",
           body: body.trim().slice(0, 120),
           link: "/admin/inbox",
           metadata: { clientId: req.user!.id },
         });
       }
     }
     res.status(201).json(msg);
   });

   app.get("/api/blog", async (_req, res) => {
     res.json(await db.getBlogPosts(true));
   });

   app.get("/api/blog/:slug", async (req, res) => {
     const post = await db.getBlogPostBySlug(req.params.slug);
     if (!post || !post.published) return res.status(404).json({ error: "Not found" });
     res.json(post);
   });

   app.get("/api/widgets/:page", async (req, res) => {
     const page = req.params.page;
     if (page !== "home" && page !== "blog") return res.status(400).json({ error: "Invalid page" });
     const postId = typeof req.query.postId === "string" ? req.query.postId : null;
     const widgets = await db.getPageWidgets(page, postId);
     res.json(
       widgets.map((w) => ({
         ...w,
         enabled: Boolean(w.enabled),
       }))
     );
   });

   app.get("/api/portfolios", async (req, res) => {
     const portfolios = await db.getPortfolios();
     res.json(portfolios);
   });

   app.get("/api/portfolios/:slug/projects", async (req, res) => {
     const portfolio = await db.getPortfolioBySlug(req.params.slug);
     if (!portfolio) return res.status(404).json({ error: "Portfolio not found" });
     const projects = await db.getProjectsByPortfolioId(portfolio.id);
     res.json({ portfolio, projects });
   });

   app.get("/api/projects", async (req, res) => {
     const projects = await db.getProjects();
     res.json(projects);
   });

   app.get("/api/services", async (req, res) => {
     const services = await db.getServices();
     res.json(services || []);
   });

   app.get("/api/hero-slides", async (req, res) => {
     const slides = await db.getHeroSlides();
     res.json(slides);
   });

   app.get("/api/locations", async (req, res) => {
     res.json(await db.getSiteLocations());
   });

   app.get("/api/testimonials", async (req, res) => {
     res.json(await db.getTestimonials());
   });

   app.get("/api/client/files", authenticateClientToken, async (req, res) => {
     const userFiles = await db.getClientFiles(req.user.id);
     res.json(userFiles);
   });

   app.post('/api/client/media-requests', authenticateClientToken, async (req, res) => {
     const { category, message, link, requestType: legacyType, requestDetails: legacyDetails } = req.body;
     let requestType: string;
     let requestDetails: string;
     if (category && message) {
       if (!boundedText(message, 3, 2000)) {
         return res.status(400).json({ error: 'Message required (3–2000 characters)' });
       }
       const allowed = ['deliverable', 'retouch', 'album', 'billing', 'scheduling', 'other'];
       if (!allowed.includes(category)) {
         return res.status(400).json({ error: 'Invalid category' });
       }
       if (link && typeof link === 'string' && link.trim() && !/^https?:\/\/.+/i.test(link.trim())) {
         return res.status(400).json({ error: 'Link must be a valid http(s) URL' });
       }
       requestType = 'client_request';
       requestDetails = JSON.stringify({
         category,
         message: String(message).trim(),
         ...(link && String(link).trim() ? { link: String(link).trim() } : {}),
       });
     } else if (legacyType && legacyDetails && boundedText(String(legacyDetails), 3, 2000)) {
       requestType = legacyType;
       requestDetails = String(legacyDetails).trim();
       if (requestType !== 'file' && requestType !== 'external_link' && requestType !== 'client_request') {
         return res.status(400).json({ error: 'Invalid requestType' });
       }
     } else {
       return res.status(400).json({ error: 'Category and message are required' });
     }
     const now = new Date().toISOString();
     const request = await db.createMediaRequest({
       id: randomUUID(),
       clientId: req.user.id,
       requestType,
       requestDetails,
       status: 'open',
       createdAt: now,
       updatedAt: now
     });
     const client = await db.getUserById(req.user.id);
     for (const admin of await db.getAdmins()) {
       const prefs = await db.getNotificationPreferences(admin.id);
       if (prefs.requestAlerts && socketApi) {
         socketApi.notifyUser(admin.id, {
           userId: admin.id,
           type: 'request',
           title: 'New media request',
           body: `${client?.name || 'Client'}: ${requestDetails.trim().slice(0, 80)}`,
           link: '/admin/media-requests',
           metadata: { requestId: request.id },
         });
       }
     }
     res.status(201).json(request);
   });

   app.get('/api/client/media-requests', authenticateClientToken, async (req, res) => {
     const requests = await db.getMediaRequestsByClientId(req.user.id);
     res.json(requests);
   });

   app.get('/api/client/bookings', authenticateClientToken, async (req, res) => {
     const bookings = await db.getBookingsByEmail(req.user.email);
     res.json(bookings);
   });

   app.get('/api/client/notifications', authenticateClientToken, async (req, res) => {
     const rows = await db.getNotificationsByUserId(req.user.id);
     res.json(
       rows.map((row) => ({
         id: row.id,
         userId: row.userId,
         type: row.type,
         title: row.title,
         body: row.body,
         read: row.read === 1,
         link: row.link,
         metadata: row.metadata ? JSON.parse(row.metadata) : null,
         createdAt: row.createdAt,
       }))
     );
   });

   app.get('/api/client/notifications/unread-count', authenticateClientToken, async (req, res) => {
     res.json({ count: await db.getUnreadNotificationCount(req.user.id) });
   });

   app.patch('/api/client/notifications/:id/read', authenticateClientToken, async (req, res) => {
     const row = await db.markNotificationRead(req.params.id, req.user.id);
     if (!row) return res.status(404).json({ error: 'Not found' });
     res.json({ success: true });
   });

   app.post('/api/client/notifications/read-all', authenticateClientToken, async (req, res) => {
     await db.markAllNotificationsRead(req.user.id);
     res.json({ success: true });
   });

   app.delete('/api/client/notifications/:id', authenticateClientToken, async (req, res) => {
     await db.deleteNotification(req.params.id, req.user.id);
     res.status(204).send();
   });

   app.get('/api/client/notification-preferences', authenticateClientToken, async (req, res) => {
     const prefs = await db.getNotificationPreferences(req.user.id);
     res.json({
       emailEnabled: prefs.emailEnabled === 1,
       pushEnabled: prefs.pushEnabled === 1,
       commentAlerts: prefs.commentAlerts === 1,
       approvalAlerts: prefs.approvalAlerts === 1,
       requestAlerts: prefs.requestAlerts === 1,
       mentionAlerts: prefs.mentionAlerts === 1,
     });
   });

   app.put('/api/client/notification-preferences', authenticateClientToken, async (req, res) => {
     const body = asBody(req.body);
     const updated = await db.updateNotificationPreferences(req.user.id, {
       emailEnabled: typeof body.emailEnabled === 'boolean' ? body.emailEnabled : undefined,
       pushEnabled: typeof body.pushEnabled === 'boolean' ? body.pushEnabled : undefined,
       commentAlerts: typeof body.commentAlerts === 'boolean' ? body.commentAlerts : undefined,
       approvalAlerts: typeof body.approvalAlerts === 'boolean' ? body.approvalAlerts : undefined,
       requestAlerts: typeof body.requestAlerts === 'boolean' ? body.requestAlerts : undefined,
       mentionAlerts: typeof body.mentionAlerts === 'boolean' ? body.mentionAlerts : undefined,
     });
     res.json({
       emailEnabled: updated.emailEnabled === 1,
       pushEnabled: updated.pushEnabled === 1,
       commentAlerts: updated.commentAlerts === 1,
       approvalAlerts: updated.approvalAlerts === 1,
       requestAlerts: updated.requestAlerts === 1,
       mentionAlerts: updated.mentionAlerts === 1,
     });
   });

   app.delete('/api/client/media-requests/:id', authenticateClientToken, async (req, res) => {
     const { id } = req.params;
     const request = (await db.getMediaRequestsByClientId(req.user.id)).find((r: { id: string }) => r.id === id);
     if (!request) return res.status(404).json({ error: 'Request not found' });
     await db.deleteMediaRequest(id);
     res.status(204).send();
   });

   // Comment on a client file
   app.post('/api/client/files/:id/comment', authenticateClientToken, async (req, res) => {
     const { id } = req.params;
     const { text } = req.body;
     if (!boundedText(text, 1, 1000)) return res.status(400).json({ error: 'Comment text is required' });
     const file = await db.getClientFileById(id, req.user.id);
     if (!file) return res.status(404).json({ error: 'File not found' });
     const comment = { id: randomUUID(), userId: req.user.id, text, date: new Date().toISOString() };
     const updatedComments = [...(file.comments || []), comment];
     await db.updateClientFile(id, req.user.id, { comments: updatedComments });
     if (socketApi) {
       socketApi.emitFileUpdate(id, { fileId: id, comments: updatedComments });
       for (const admin of await db.getAdmins()) {
         const prefs = await db.getNotificationPreferences(admin.id);
         if (prefs.commentAlerts) {
           socketApi.notifyUser(admin.id, {
             userId: admin.id,
             type: 'comment',
             title: `Comment on ${file.name}`,
             body: text.trim().slice(0, 80),
             link: `/admin/users/${req.user.id}/media`,
             metadata: { fileId: id, commentId: comment.id },
           });
         }
       }
     }
     res.status(201).json(comment);
   });

   // Approve or reject a client file
   app.post('/api/client/files/:id/approve', authenticateClientToken, async (req, res) => {
     const { id } = req.params;
     const { approve } = req.body; // boolean
     const file = await db.getClientFileById(id, req.user.id);
     if (!file) return res.status(404).json({ error: 'File not found' });
     await db.updateClientFile(id, req.user.id, { approved: approve === true });
     const updated = await db.getClientFileById(id, req.user.id);
     if (socketApi) {
       socketApi.emitFileUpdate(id, { fileId: id, approved: approve === true, file: updated });
       for (const admin of await db.getAdmins()) {
         const prefs = await db.getNotificationPreferences(admin.id);
         if (prefs.approvalAlerts) {
           socketApi.notifyUser(admin.id, {
             userId: admin.id,
             type: 'approval',
             title: approve ? 'File approved' : 'File rejected',
             body: `${file.name} — ${req.user.email}`,
             link: `/admin/users/${req.user.id}/media`,
             metadata: { fileId: id, approved: approve === true },
           });
         }
       }
     }
     res.json({ success: true, file: updated });
   });

   // Track downloads and return file URL if available
   app.get('/api/client/files/:id/download', authenticateClientToken, async (req, res) => {
     const { id } = req.params;
     const file = await db.getClientFileById(id, req.user.id);
     if (!file) return res.status(404).json({ error: 'File not found' });
     const updatedDownloadCount = (file.downloadCount || 0) + 1;
     await db.updateClientFile(id, req.user.id, { downloadCount: updatedDownloadCount });
     // Return the file URL if present; caller can use it to initiate download
     res.json({ url: file.url || null, downloadCount: updatedDownloadCount });
   });

  // --- Admin API Routes ---

  app.post("/api/admin/logout", async (req, res) => {
    // In a more secure implementation, we would invalidate the token on the server side
    // For now, we just return success as the client will remove the token
    clearAuthCookies(res);
    res.json({ success: true });
  });

   app.post("/api/admin/login", authRateLimit, async (req, res) => {
     const { email, password } = req.body;
     if (!isValidEmail(email) || !boundedText(password, 1, 128)) {
       return res.status(400).json({ error: "Invalid login payload" });
     }
     const user = await db.getUserByEmail(email);
     if (
       !user ||
       !(await bcrypt.compare(password, user.password)) ||
       (user.role !== 'admin' && user.role !== 'staff')
     ) {
       return res.status(401).json({ error: "Invalid admin credentials" });
     }
     const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, requireJwtSecret(), { expiresIn: '7d' });
     setAuthCookie(res, token, true);
     res.json({ token, adminUser: toPublicAdminUser(user as DbUserRow) });
   });

   app.get("/api/admin/me", authenticateAdminToken, async (req, res) => {
     const user = await db.getUserById(req.admin!.id);
     if (!user || (user.role !== "admin" && user.role !== "staff")) return res.sendStatus(404);
     res.json(toPublicAdminUser(user as DbUserRow));
   });

   app.post("/api/admin/profile/avatar", authenticateAdminToken, async (req, res) => {
     const file = oneFile(req.files?.avatar as UploadedFile | UploadedFile[] | undefined);
     if (!file) return res.status(400).json({ error: "No image uploaded" });
     try {
       const url = await saveMediaFile(file, "avatars");
       await db.updateUserProfile(req.admin!.id, { avatarUrl: url });
       const user = await db.getUserById(req.admin!.id)!;
       res.json(toPublicAdminUser(user as DbUserRow));
     } catch (err: unknown) {
       res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
     }
   });

   app.delete("/api/admin/profile/avatar", authenticateAdminToken, async (req, res) => {
     await db.updateUserProfile(req.admin!.id, { avatarUrl: null });
     const user = await db.getUserById(req.admin!.id)!;
     res.json(toPublicAdminUser(user as DbUserRow));
   });

   app.post("/api/admin/users/:id/avatar", authenticateAdminToken, requireStaffPermission("users"), async (req, res) => {
     const target = await db.getUserById(req.params.id);
     if (!target || target.role !== "client") return res.status(404).json({ error: "Client not found" });
     const file = oneFile(req.files?.avatar as UploadedFile | UploadedFile[] | undefined);
     if (!file) return res.status(400).json({ error: "No image uploaded" });
     try {
       const url = await saveMediaFile(file, "avatars");
       await db.updateUserProfile(target.id, { avatarUrl: url });
       res.json({ id: target.id, name: target.name, email: target.email, avatarUrl: url });
     } catch (err: unknown) {
       res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
     }
   });

   app.put("/api/admin/profile", authenticateAdminToken, async (req, res) => {
     const { name, email } = req.body;
     if (!boundedText(name, 2, 120)) return res.status(400).json({ error: "Invalid name" });
     if (email && !isValidEmail(email)) return res.status(400).json({ error: "Invalid email" });
     const existing = email ? await db.getUserByEmail(email) : null;
     if (existing && existing.id !== req.admin!.id) {
       return res.status(409).json({ error: "Email already in use" });
     }
     await db.updateUserProfile(req.admin!.id, { name: name.trim(), email: email?.trim() });
     const user = await db.getUserById(req.admin!.id)!;
     res.json(toPublicAdminUser(user as DbUserRow));
   });

   app.post("/api/admin/change-password", authenticateAdminToken, authRateLimit, async (req, res) => {
     const { currentPassword, newPassword } = req.body;
     if (!boundedText(currentPassword, 1, 128) || !boundedText(newPassword, 8, 128)) {
       return res.status(400).json({ error: "Password must be at least 8 characters" });
     }
     const user = await db.getUserById(req.admin!.id);
     if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
       return res.status(401).json({ error: "Current password is incorrect" });
     }
     await db.updateUserPassword(user.id, await bcrypt.hash(newPassword, 10));
     res.json({ success: true });
   });

   app.get("/api/admin/staff", authenticateAdminToken, requireAdminRole, async (_req, res) => {
     res.json(await db.getStaffUsers());
   });

   app.post("/api/admin/staff", authenticateAdminToken, requireAdminRole, authRateLimit, async (req, res) => {
     const { email, password, name, permissions } = req.body;
     if (!isValidEmail(email) || !boundedText(password, 8, 128) || !boundedText(name, 2, 120)) {
       return res.status(400).json({ error: "Invalid staff payload" });
     }
     if (await db.getUserByEmail(email)) return res.status(409).json({ error: "Email already exists" });
     const hashed = await bcrypt.hash(password, 10);
     const user = await db.createUser({
       email,
       password: hashed,
       name,
       role: "staff",
       staffPermissions: JSON.stringify(permissions || {}),
     });
     res.status(201).json({
       id: user.id,
       email: user.email,
       name: user.name,
       role: "staff",
       staffPermissions: permissions || {},
     });
   });

   app.delete("/api/admin/staff/:id", authenticateAdminToken, requireAdminRole, async (req, res) => {
     const target = await db.getUserById(req.params.id);
     if (!target || target.role === "admin") return res.status(400).json({ error: "Cannot delete" });
     await db.deleteUsersByIds([req.params.id]);
     res.json({ success: true });
   });

   app.get("/api/admin/inbox", authenticateAdminToken, requireStaffPermission("communications"), async (_req, res) => {
     res.json(await db.getAdminInbox());
   });

   app.get("/api/admin/messages/:clientId", authenticateAdminToken, requireStaffPermission("communications"), async (req, res) => {
     await db.markMessagesReadByStaff(req.params.clientId);
     res.json(await db.getClientMessages(req.params.clientId));
   });

   app.post("/api/admin/messages/:clientId", authenticateAdminToken, requireStaffPermission("communications"), async (req, res) => {
     const { body } = req.body;
     if (!boundedText(body, 1, 4000)) return res.status(400).json({ error: "Message required" });
     const dbUser = await db.getUserById(req.admin!.id);
     const msg = {
       id: randomUUID(),
       clientId: req.params.clientId,
       senderId: req.admin!.id,
       senderRole: dbUser?.role || "admin",
       body: body.trim(),
     };
     await db.createClientMessage(msg);
     if (socketApi) {
       socketApi.notifyUser(req.params.clientId, {
         userId: req.params.clientId,
         type: "message",
         title: "Studio reply",
         body: body.trim().slice(0, 120),
         link: "/dashboard/messages",
         metadata: {},
       });
     }
     res.status(201).json(msg);
   });

   app.get("/api/admin/blog", authenticateAdminToken, requireStaffPermission("blog"), async (_req, res) => {
     res.json(await db.getBlogPosts(false));
   });

   app.post("/api/admin/blog", authenticateAdminToken, requireStaffPermission("blog"), async (req, res) => {
     const { title, excerpt, body, slug, coverImage, published } = req.body;
     if (!boundedText(title, 2, 200) || !boundedText(excerpt, 10, 500) || !boundedText(body, 20, 50000)) {
       return res.status(400).json({ error: "Invalid post" });
     }
     const postSlug =
       (slug && String(slug).trim()) ||
       title
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, "-")
         .replace(/^-|-$/g, "");
     const id = randomUUID();
     await db.createBlogPost({
       id,
       slug: postSlug,
       title,
       excerpt,
       body,
       coverImage,
       authorId: req.admin!.id,
       published: Boolean(published),
     });
     res.status(201).json(await db.getBlogPostById(id));
   });

   app.put("/api/admin/blog/:id", authenticateAdminToken, requireStaffPermission("blog"), async (req, res) => {
     const updates = req.body;
     await db.updateBlogPost(req.params.id, {
       title: updates.title,
       excerpt: updates.excerpt,
       body: updates.body,
       slug: updates.slug,
       coverImage: updates.coverImage,
       published: updates.published,
     });
     res.json(await db.getBlogPostById(req.params.id));
   });

   app.delete("/api/admin/blog/:id", authenticateAdminToken, requireStaffPermission("blog"), async (req, res) => {
     await db.deleteBlogPost(req.params.id);
     res.json({ success: true });
   });

   app.post("/api/admin/blog/bulk-delete", authenticateAdminToken, requireStaffPermission("blog"), async (req, res) => {
     const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string") : [];
     await db.deleteBlogPostsByIds(ids);
     res.json({ success: true, deleted: ids.length });
   });

   app.get("/api/admin/widgets", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const page = req.query.page as string | undefined;
     const widgets =
       page === "home" || page === "blog"
         ? await db.getAllPageWidgets(page)
         : await db.getAllPageWidgets();
     res.json(widgets);
   });

   app.post("/api/admin/widgets", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const { page, postId, type, title, content, sortOrder, enabled } = req.body;
     if (page !== "home" && page !== "blog") return res.status(400).json({ error: "Invalid page" });
     if (!type || typeof type !== "string") return res.status(400).json({ error: "Type required" });
     const id = await db.createPageWidget({
       page,
       postId: postId || null,
       type,
       title: title || "",
       content: typeof content === "string" ? content : JSON.stringify(content || {}),
       sortOrder: Number(sortOrder) || 0,
       enabled: enabled !== false,
     });
     res.status(201).json(await db.getPageWidgetById(id));
   });

   app.put("/api/admin/widgets/:id", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const existing = await db.getPageWidgetById(req.params.id);
     if (!existing) return res.status(404).json({ error: "Not found" });
     const { type, title, content, sortOrder, enabled, postId } = req.body;
     await db.updatePageWidget(req.params.id, {
       type,
       title,
       content: content !== undefined ? (typeof content === "string" ? content : JSON.stringify(content)) : undefined,
       sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
       enabled: enabled !== undefined ? Boolean(enabled) : undefined,
       postId: postId !== undefined ? postId : undefined,
     });
     res.json(await db.getPageWidgetById(req.params.id));
   });

   app.delete("/api/admin/widgets/:id", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     await db.deletePageWidget(req.params.id);
     res.json({ success: true });
   });

   app.post("/api/admin/projects/bulk-delete", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string") : [];
     await db.deleteProjectsByIds(ids);
     res.json({ success: true, deleted: ids.length });
   });

   app.post("/api/admin/services/bulk-delete", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string") : [];
     await db.deleteServicesByIds(ids);
     res.json({ success: true, deleted: ids.length });
   });

   app.post("/api/admin/hero-slides/bulk-delete", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string") : [];
     await db.deleteHeroSlidesByIds(ids);
     res.json({ success: true, deleted: ids.length });
   });

   app.post("/api/admin/media-requests/bulk-delete", authenticateAdminToken, requireStaffPermission("requests"), async (req, res) => {
     const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string") : [];
     await db.deleteMediaRequestsByIds(ids);
     res.json({ success: true, deleted: ids.length });
   });

   app.post("/api/client/media-requests/bulk-delete", authenticateClientToken, async (req, res) => {
     const ids = Array.isArray(req.body.ids) ? req.body.ids.filter((x: unknown) => typeof x === "string") : [];
     const owned = new Set((await db.getMediaRequestsByClientId(req.user!.id)).map((r) => r.id));
     for (const id of ids.filter((item) => owned.has(item))) {
       await db.deleteMediaRequest(id);
     }
     res.json({ success: true });
   });

   // Admin Projects CRUD with file upload
   app.get("/api/admin/projects", authenticateAdminToken, async (req, res) => {
     const projects = await db.getProjects();
     res.json(projects);
   });

   app.get("/api/admin/projects/:id", authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const project = await db.getProjectById(id);
     if (!project) {
       return res.status(404).json({ error: "Project not found" });
     }
     res.json(project);
   });

   app.get("/api/admin/portfolios", authenticateAdminToken, requireStaffPermission("frontend"), async (_req, res) => {
     res.json(await db.getPortfolios());
   });

   app.post("/api/admin/portfolios", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const body = asBody(req.body);
     const title = typeof body.title === "string" ? body.title.trim() : "";
     const slug =
       (typeof body.slug === "string" && body.slug.trim()) ||
       title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
     const description = typeof body.description === "string" ? body.description : "";
     let coverImage = typeof body.coverImage === "string" ? body.coverImage : "";
     if (!title || !slug) return res.status(400).json({ error: "Title and slug required" });
     const coverFile = oneFile(req.files?.coverImage as UploadedFile | UploadedFile[] | undefined);
     if (coverFile) {
       try {
         coverImage = await saveMediaFile(coverFile, "portfolio");
       } catch (err: unknown) {
         return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
       }
     }
     const id = randomUUID();
     await db.createPortfolio({ id, title, slug, description, coverImage: coverImage || "", sortOrder: Number(body.sortOrder) || 0 });
     res.status(201).json(await db.getPortfolioById(id));
   });

   app.put("/api/admin/portfolios/:id", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     const existing = await db.getPortfolioById(req.params.id);
     if (!existing) return res.status(404).json({ error: "Not found" });
     const body = asBody(req.body);
     const updates: Record<string, unknown> = {};
     if (typeof body.title === "string") updates.title = body.title.trim();
     if (typeof body.slug === "string") updates.slug = body.slug.trim();
     if (typeof body.description === "string") updates.description = body.description;
     if (typeof body.sortOrder !== "undefined") updates.sortOrder = Number(body.sortOrder);
     if (typeof body.coverImage === "string") updates.coverImage = body.coverImage;
     const coverFile = oneFile(req.files?.coverImage as UploadedFile | UploadedFile[] | undefined);
     if (coverFile) {
       try {
         updates.coverImage = await saveMediaFile(coverFile, "portfolio");
       } catch (err: unknown) {
         return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
       }
     }
     await db.updatePortfolio(req.params.id, updates as Parameters<typeof db.updatePortfolio>[1]);
     res.json(await db.getPortfolioById(req.params.id));
   });

   app.delete("/api/admin/portfolios/:id", authenticateAdminToken, requireStaffPermission("frontend"), async (req, res) => {
     if (!(await db.getPortfolioById(req.params.id))) return res.status(404).json({ error: "Not found" });
     await db.deletePortfolio(req.params.id);
     res.json({ success: true });
   });

   app.post("/api/admin/projects", authenticateAdminToken, async (req, res) => {
     try {
       const body = asBody(req.body);
       const title = typeof body.title === "string" ? body.title.trim() : "";
       const category = typeof body.category === "string" ? body.category.trim() : "";
       const description = typeof body.description === "string" ? body.description : "";
       const portfolioId =
         typeof body.portfolioId === "string" && body.portfolioId.trim() ? body.portfolioId.trim() : null;
       if (!title || !category) {
         return res.status(400).json({ error: "Title and category are required" });
       }
       
       let images = parseProjectImageUrls(body);
       if (req.files && req.files.images) {
         const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
         for (const file of files) {
           try {
             images.push(await saveMediaFile(file, "portfolio"));
           } catch (err: unknown) {
             return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
           }
         }
       }
       
       const newProject = await db.createProject({
         id: randomUUID(),
         title,
         category,
         description,
         images,
         portfolioId,
       });
       res.status(201).json(newProject);
     } catch (error) {
       console.error("Error creating project:", error);
       res.status(500).json({ error: "Internal server error" });
     }
   });

   app.put("/api/admin/projects/:id", authenticateAdminToken, async (req, res) => {
     try {
       const { id } = req.params;
       const body = asBody(req.body);
       const project = await db.getProjectById(id);
       if (!project) {
         return res.status(404).json({ error: "Project not found" });
       }
       
       let images: string[] = [];
       if (body.images !== undefined) {
         images = parseProjectImageUrls(body);
       } else if (Array.isArray(project.images)) {
         images = project.images.filter((item) => typeof item === "string");
       } else if (typeof project.images === "string") {
         try {
           const parsed = JSON.parse(project.images);
           images = Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
         } catch {
           images = [];
         }
       }
       if (req.files && req.files.images) {
         const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
         for (const file of files) {
           try {
             images.push(await saveMediaFile(file, "portfolio"));
           } catch (err: unknown) {
             return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
           }
         }
       }

       const portfolioId =
         body.portfolioId === "" || body.portfolioId === null
           ? null
           : typeof body.portfolioId === "string"
             ? body.portfolioId.trim() || null
             : undefined;
       
       const updatedProject = await db.updateProject(id, {
         title: typeof body.title === "string" ? body.title : project.title,
         category: typeof body.category === "string" ? body.category : project.category,
         description: typeof body.description === "string" ? body.description : project.description,
         images,
         ...(portfolioId !== undefined ? { portfolioId } : {}),
       });
       res.json(updatedProject);
     } catch (error) {
       console.error("Error updating project:", error);
       res.status(500).json({ error: "Internal server error" });
     }
   });

   app.delete("/api/admin/projects/:id", authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const project = await db.getProjectById(id);
     if (!project) {
       return res.status(404).json({ error: "Project not found" });
     }
     await db.deleteProject(id);
     // Optionally, delete associated files from uploads directory
     // For simplicity, we're not deleting files now to avoid breaking references
     res.status(204).send();
   });

   // Admin Services CRUD
   app.get("/api/admin/services", authenticateAdminToken, async (req, res) => {
     const services = await db.getServices();
     res.json(services);
   });

   app.get("/api/admin/services/:id", authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const service = await db.getServiceById(id);
     if (!service) {
       return res.status(404).json({ error: "Service not found" });
     }
     res.json(service);
   });

   app.post("/api/admin/services", authenticateAdminToken, async (req, res) => {
     const body = asBody(req.body);
     const title = typeof body.title === "string" ? body.title : "";
     const price = typeof body.price === "string" ? body.price : "";
     const description = typeof body.description === "string" ? body.description : "";
     if (!title || !price || !description) {
       return res.status(400).json({ error: "Title, price, and description are required" });
     }
     const newService = await db.createService({
       id: randomUUID(),
       title,
       price,
       description
     });
     res.status(201).json(newService);
   });

   app.put("/api/admin/services/:id", authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const { title, price, description } = req.body;
     const service = await db.getServiceById(id);
     if (!service) {
       return res.status(404).json({ error: "Service not found" });
     }
     const updatedService = await db.updateService(id, {
       title: title !== undefined ? title : service.title,
       price: price !== undefined ? price : service.price,
       description: description !== undefined ? description : service.description
      });
      res.json(updatedService);
    });

    app.delete("/api/admin/services/:id", authenticateAdminToken, async (req, res) => {
      const { id } = req.params;
      const service = await db.getServiceById(id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      await db.deleteService(id);
     res.status(204).send();
   });

   // Admin media library (root media/ with subdirectories)
   app.get("/api/admin/media/subdirs", authenticateAdminToken, async (_req, res) => {
     res.json(MEDIA_SUBDIRS);
   });

   app.get("/api/admin/media/list", authenticateAdminToken, async (req, res) => {
     const subdir = sanitizeSubdir(req.query.subdir);
     res.json(await listMediaFiles(subdir));
   });

   app.post("/api/admin/media/upload", authenticateAdminToken, async (req, res) => {
     try {
       const file = oneFile(req.files?.file);
       if (!file) return res.status(400).json({ error: "file is required" });
       const subdir = sanitizeSubdir(req.body?.subdir ?? "general");
       const url = await saveMediaFile(file, subdir);
       res.status(201).json({ url, subdir });
     } catch (error: unknown) {
       res.status(400).json({ error: error instanceof Error ? error.message : "Upload failed" });
     }
   });

   app.delete("/api/admin/media/file", authenticateAdminToken, async (req, res) => {
     const subdir = sanitizeSubdir(req.query.subdir);
     const name = typeof req.query.name === "string" ? req.query.name : "";
     if (!(await deleteMediaFile(subdir, name))) {
       return res.status(404).json({ error: "File not found" });
     }
     res.status(204).send();
   });

   // Admin Hero Slides CRUD with file upload
   app.get("/api/admin/hero-slides", authenticateAdminToken, async (req, res) => {
     const slides = await db.getHeroSlides();
     res.json(slides);
   });

   app.get("/api/admin/hero-slides/:id", authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const slide = await db.getHeroSlideById(id);
     if (!slide) {
       return res.status(404).json({ error: "Hero slide not found" });
     }
     res.json(slide);
   });

   app.post("/api/admin/hero-slides", authenticateAdminToken, async (req, res) => {
     try {
       const body = asBody(req.body);
       const title = typeof body.title === "string" ? body.title : "";
       const subtitle = typeof body.subtitle === "string" ? body.subtitle : "";
       if (!title || !subtitle) {
         return res.status(400).json({ error: "Title and subtitle are required" });
       }
       
       let image = typeof body.image === "string" ? body.image.trim() : "";
       if (req.files && req.files.image) {
         const file = oneFile(req.files.image);
         if (!file) return res.status(400).json({ error: "Invalid image upload payload" });
         try {
           image = await saveMediaFile(file, "hero");
         } catch (err: unknown) {
           return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
         }
       }
       if (!image) {
         return res.status(400).json({ error: "Image URL or file upload is required" });
       }
       
       const newSlide = await db.createHeroSlide({
         id: randomUUID(),
         title,
         subtitle,
         image
       });
       res.status(201).json(newSlide);
     } catch (error) {
       console.error("Error creating hero slide:", error);
       res.status(500).json({ error: "Internal server error" });
     }
   });

   app.put("/api/admin/hero-slides/:id", authenticateAdminToken, async (req, res) => {
     try {
       const { id } = req.params;
       const { title, subtitle } = req.body;
       const slide = await db.getHeroSlideById(id);
       if (!slide) {
         return res.status(404).json({ error: "Hero slide not found" });
       }
       
       let image = slide.image;
       if (typeof req.body?.image === "string" && req.body.image.trim()) {
         image = req.body.image.trim();
       }
       if (req.files && req.files.image) {
         const file = oneFile(req.files.image);
         if (!file) return res.status(400).json({ error: "Invalid image upload payload" });
         try {
           image = await saveMediaFile(file, "hero");
         } catch (err: unknown) {
           return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
         }
       }
       
       const updatedSlide = await db.updateHeroSlide(id, {
         title: title !== undefined ? title : slide.title,
         subtitle: subtitle !== undefined ? subtitle : slide.subtitle,
         image
       });
       res.json(updatedSlide);
     } catch (error) {
       console.error("Error updating hero slide:", error);
       res.status(500).json({ error: "Internal server error" });
     }
   });

   app.delete("/api/admin/hero-slides/:id", authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const slide = await db.getHeroSlideById(id);
     if (!slide) {
       return res.status(404).json({ error: "Hero slide not found" });
     }
     await db.deleteHeroSlide(id);
     // Optionally, delete associated file from uploads directory
     res.status(204).send();
   });

   // /api/admin/users route
   app.get('/api/admin/users', authenticateAdminToken, async (req, res) => {
     const users = await db.getUsers();
     res.json(users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role })));
   });

   app.get('/api/admin/users/:id/files', authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const user = await db.getUserById(id);
     if (!user || user.role !== 'client') return res.status(404).json({ error: 'Client not found' });
     const files = await db.getClientFilesByUserIdAdmin(id);
     res.json(files);
   });

   app.post('/api/admin/users/:id/files', authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     const user = await db.getUserById(id);
     if (!user || user.role !== 'client') return res.status(404).json({ error: 'Client not found' });
     if (!req.files || !req.files.file) {
       return res.status(400).json({ error: 'file is required' });
     }
     const file = oneFile(req.files.file);
     if (!file) return res.status(400).json({ error: 'Invalid file payload' });
     const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
     if (!allowedTypes.includes(file.mimetype)) {
       return res.status(400).json({ error: "Invalid file type. Only JPEG, PNG, GIF, WebP are allowed." });
     }
     let url: string;
     try {
       url = await saveMediaFile(file, "clients");
     } catch (err: unknown) {
       return res.status(400).json({ error: err instanceof Error ? err.message : "Upload failed" });
     }
     const ext = path.extname(file.name || '');
     const created = await db.createClientFile({
       id: randomUUID(),
       userId: id,
       name: file.name || 'file',
       size: `${Math.max(1, Math.round((file.size || 0) / 1024))} KB`,
       format: ext.replace('.', '').toUpperCase() || 'FILE',
       date: new Date().toISOString(),
       url,
       comments: [],
       downloadCount: 0
     });
     res.status(201).json(created);
   });

   app.delete('/api/admin/users/:userId/files/:fileId', authenticateAdminToken, async (req, res) => {
     const { userId, fileId } = req.params;
     const fileExistsForUser = (await db.getClientFilesByUserIdAdmin(userId)).some((f: { id: string }) => f.id === fileId);
     if (!fileExistsForUser) {
       return res.status(404).json({ error: "File not found for client" });
     }
     await db.deleteClientFileAdmin(fileId);
     res.status(204).send();
   });

   app.get('/api/admin/media-requests', authenticateAdminToken, requireStaffPermission("requests"), async (_req, res) => {
     const rows = await db.getAllMediaRequests();
     const requests = await Promise.all(
       rows.map(async (row) => {
         const client = await db.getUserById(row.clientId);
         return {
           ...row,
           clientName: client?.name ?? 'Unknown client',
           clientEmail: client?.email ?? '',
         };
       })
     );
     res.json(requests);
   });

   app.put('/api/admin/media-requests/:id', authenticateAdminToken, requireStaffPermission("requests"), async (req, res) => {
     const { id } = req.params;
     const { status, responseLink, responseNote } = req.body;
     const validStatuses = ['open', 'in_progress', 'fulfilled', 'rejected', 'cancelled'];
     if (status !== undefined && !validStatuses.includes(status)) {
       return res.status(400).json({ error: 'Invalid status value' });
     }
     if (responseLink !== undefined && responseLink !== null && !boundedText(responseLink, 1, 1024)) {
       return res.status(400).json({ error: 'Invalid responseLink' });
     }
     if (responseNote !== undefined && responseNote !== null && !boundedText(responseNote, 1, 2000)) {
       return res.status(400).json({ error: 'Invalid responseNote' });
     }
     const existing = await db.getMediaRequestById(id);
     if (!existing) return res.status(404).json({ error: 'Request not found' });
     const updated = await db.updateMediaRequest(id, {
       status,
       responseLink,
       responseNote,
       assignedAdminId: req.admin?.id || null,
       updatedAt: new Date().toISOString()
     });
     if (!updated) return res.status(404).json({ error: 'Request not found' });
     const statusLabel = status || updated.status;
     const notePreview = (responseNote || updated.responseNote || '').toString().slice(0, 120);
     await db.createNotification({
       userId: existing.clientId,
       type: 'request',
       title: 'Studio update on your request',
       body: notePreview || `Status changed to ${statusLabel}`,
       link: '/dashboard/requests',
       metadata: { requestId: id, status: statusLabel },
     });
     if (socketApi) {
       socketApi.notifyUser(existing.clientId, {
         userId: existing.clientId,
         type: 'request',
         title: 'Studio update on your request',
         body: notePreview || `Status: ${statusLabel}`,
         link: '/dashboard/requests',
         metadata: { requestId: id },
       });
     }
     res.json(updated);
   });

   app.delete('/api/admin/media-requests/:id', authenticateAdminToken, async (req, res) => {
     const { id } = req.params;
     await db.deleteMediaRequest(id);
     res.status(204).send();
   });

   // Admin Stats Route (expanded)
   app.get("/api/admin/stats", authenticateAdminToken, async (_req, res) => {
     const [projects, services, slides, users, invoices, clientFiles] = await Promise.all([
       db.getProjects(),
       db.getServices(),
       db.getHeroSlides(),
       db.getUsers(),
       db.getAllInvoices(),
       db.getAllClientFiles(),
     ]);
     const totalRevenue = invoices.reduce((sum: number, inv) => sum + (inv.amount || 0) * (inv.paid ? 1 : 0), 0);
     const stats = {
       totalProjects: projects.length,
       totalServices: services.length,
       totalHeroSlides: slides.length,
       totalClients: users.filter((u) => u.role === 'client').length,
       totalAdmins: users.filter((u) => u.role === 'admin').length,
       totalInvoices: invoices.length,
       totalRevenue,
       totalDownloads: clientFiles.reduce((acc: number, f) => acc + (f.downloadCount || 0), 0)
     };
     res.json(stats);
   });

  // Create a checkout / order (mock)
   app.post('/api/checkout', authenticateClientToken, async (req, res) => {
     const { serviceId } = req.body;
     const service = await db.getServiceById(serviceId);
     if (!service) return res.status(400).json({ error: 'Invalid service' });
     const servicePrice = typeof service.price === "string" ? service.price : "";
     const invoice = await db.createInvoice({
       id: randomUUID(),
       userId: req.user.id,
       serviceId,
       amount: Number(servicePrice.replace(/[^0-9.]/g, '')) || 0,
       paid: false,
       createdAt: new Date().toISOString()
     });
     res.status(201).json({ invoice });
   });

  // Client: list invoices
    app.get('/api/invoices', authenticateClientToken, async (req, res) => {
      const invoices = await db.getInvoices(req.user.id);
      res.json(invoices);
    });

  // Client: get invoice by id
    app.get('/api/invoices/:id', authenticateClientToken, async (req, res) => {
      const { id } = req.params;
      const invoice = await db.getInvoiceById(id, req.user.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      res.json(invoice);
    });

  // Admin: list all invoices
  app.get('/api/admin/invoices', authenticateAdminToken, async (req, res) => {
    const invoices = await db.getAllInvoices();
    res.json(invoices);
  });

  // Mock payment webhook / endpoint to mark invoice paid
  app.post('/api/payments/mock', authenticateClientToken, async (req, res) => {
    const { invoiceId } = req.body;
    const invoice = await db.getInvoiceById(invoiceId, req.user!.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
       await db.updateInvoiceByIdAdmin(invoiceId, {
      paid: true,
      paidAt: new Date().toISOString()
    });
    res.json({ success: true, invoice });
  });

  // Referral tracking (simple)
  app.post('/api/referrals', publicWriteRateLimit, async (req, res) => {
    const { referrerId, refereeEmail } = req.body;
    if (!referrerId || !refereeEmail || !isValidEmail(refereeEmail)) return res.status(400).json({ error: 'referrerId and valid refereeEmail required' });
    const referral = await db.createReferral({
      id: randomUUID(),
      referrerId,
      refereeEmail,
      date: new Date().toISOString(),
      converted: false
    });
    res.status(201).json(referral);
  });

  // Admin analytics endpoint
  app.get('/api/admin/analytics', authenticateAdminToken, async (_req, res) => {
    const [clientFiles, invoices, referrals] = await Promise.all([
      db.getAllClientFiles(),
      db.getAllInvoices(),
      db.getReferrals(),
    ]);
    const downloadsByFile = clientFiles.map((f) => ({ id: f.id, name: f.name, downloads: f.downloadCount || 0 }));
    const revenue = invoices.filter((i) => i.paid).reduce((sum: number, inv) => sum + (inv.amount || 0), 0);
    res.json({ downloadsByFile, revenue, referrals });
  });

  // Bookings
  app.post('/api/bookings', publicWriteRateLimit, async (req, res) => {
    const { name, email, date, serviceId } = req.body;
    if (!boundedText(name, 2, 120) || !isValidEmail(email) || !boundedText(date, 4, 64) || !boundedText(serviceId, 1, 128)) {
      return res.status(400).json({ error: 'Missing or invalid booking fields' });
    }
    const booking = await db.createBooking({
      id: randomUUID(),
      name,
      email,
      date,
      serviceId,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    const bookingUser = await db.getUserByEmail(email);
    if (bookingUser && socketApi) {
      socketApi.notifyUser(bookingUser.id, {
        userId: bookingUser.id,
        type: 'booking',
        title: 'Booking received',
        body: `Your session request for ${date} is pending confirmation.`,
        link: '/dashboard',
        metadata: { bookingId: booking.id },
      });
    }
    for (const admin of await db.getAdmins()) {
      if (socketApi) {
        socketApi.notifyUser(admin.id, {
          userId: admin.id,
          type: 'booking',
          title: 'New booking request',
          body: `${name} — ${date}`,
          link: '/admin/dashboard',
          metadata: { bookingId: booking.id },
        });
      }
    }
    res.status(201).json(booking);
  });

  app.get('/api/admin/bookings', authenticateAdminToken, async (req, res) => {
    const bookings = await db.getBookings();
    res.json(bookings);
  });

  // Health check
  app.get("/api/health", async (req, res) => {
    res.json({ status: "ok", vercel: Boolean(process.env.VERCEL), turso: Boolean(process.env.TURSO_DATABASE_URL) });
  });

  // Local dev / self-hosted: Vite or static SPA. On Vercel, static files come from CDN.
  if (!process.env.VERCEL) {
    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", async (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    }
  }

  return app;
}

async function startServer() {
  const app = await createApp();
  const PORT = Number(process.env.PORT) || 3000;
  const httpServer = createHttpServer(app);

  if (!process.env.VERCEL) {
    socketApi = attachSocketServer(httpServer, db as Parameters<typeof attachSocketServer>[1], requireJwtSecret());
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (!process.env.VERCEL) {
      console.log(`Socket.IO ready on ws://localhost:${PORT}`);
    }
  });
}

export { createApp };

if (!process.env.VERCEL) {
  startServer();
}

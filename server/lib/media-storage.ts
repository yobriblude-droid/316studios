import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { UploadedFile } from 'express-fileupload';

export const MEDIA_ROOT = path.join(process.cwd(), 'media');
/** Legacy seeded assets */
export const LEGACY_MEDIA_ROOT = path.join(process.cwd(), 'Media');

export const MEDIA_SUBDIRS = ['hero', 'portfolio', 'clients', 'uploads', 'general', 'avatars'] as const;
export type MediaSubdir = (typeof MEDIA_SUBDIRS)[number];

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ensureMediaDirs(): void {
  if (process.env.VERCEL) return;
  if (!fs.existsSync(MEDIA_ROOT)) {
    fs.mkdirSync(MEDIA_ROOT, { recursive: true });
  }
  for (const sub of MEDIA_SUBDIRS) {
    const dir = path.join(MEDIA_ROOT, sub);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function sanitizeSubdir(subdir: unknown): MediaSubdir {
  const raw = typeof subdir === 'string' ? subdir.trim().toLowerCase() : 'general';
  if ((MEDIA_SUBDIRS as readonly string[]).includes(raw)) {
    return raw as MediaSubdir;
  }
  return 'general';
}

export function validateImageFile(file: UploadedFile): string | null {
  if (!IMAGE_MIMES.includes(file.mimetype)) {
    return `Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP are allowed.`;
  }
  return null;
}

export async function saveMediaFile(file: UploadedFile, subdir: unknown): Promise<string> {
  ensureMediaDirs();
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const safeSub = sanitizeSubdir(subdir);
  const ext = path.extname(file.name || '') || '.jpg';
  const safeName = `${Date.now()}-${randomUUID()}${ext}`;
  const destDir = path.join(MEDIA_ROOT, safeSub);
  const destPath = path.join(destDir, safeName);
  await file.mv(destPath);
  return `/media/${safeSub}/${safeName}`;
}

export function listMediaFiles(subdir: unknown): Array<{ name: string; url: string; size: number; mtime: string }> {
  ensureMediaDirs();
  const safeSub = sanitizeSubdir(subdir);
  const dir = path.join(MEDIA_ROOT, safeSub);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && /\.(jpe?g|png|gif|webp)$/i.test(e.name))
    .map((e) => {
      const full = path.join(dir, e.name);
      const stat = fs.statSync(full);
      return {
        name: e.name,
        url: `/media/${safeSub}/${e.name.split('/').map(encodeURIComponent).join('/')}`,
        size: stat.size,
        mtime: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
}

export function deleteMediaFile(subdir: unknown, filename: unknown): boolean {
  const safeSub = sanitizeSubdir(subdir);
  const name = typeof filename === 'string' ? path.basename(filename) : '';
  if (!name || name.includes('..')) return false;

  const full = path.join(MEDIA_ROOT, safeSub, name);
  if (!fs.existsSync(full)) return false;
  fs.unlinkSync(full);
  return true;
}

export function resolveMediaPathFromUrl(url: string): string | null {
  if (!url.startsWith('/media/')) return null;
  const relative = decodeURIComponent(url.replace(/^\/media\//, ''));
  const full = path.join(MEDIA_ROOT, relative);
  if (!full.startsWith(MEDIA_ROOT)) return null;
  return fs.existsSync(full) ? full : null;
}

export { useBlobStorage } from './media-storage-blob';

export async function saveMediaFileUniversal(file: UploadedFile, subdir: unknown): Promise<string> {
  const { useBlobStorage, saveMediaFileBlob } = await import('./media-storage-blob');
  if (useBlobStorage()) return saveMediaFileBlob(file, subdir);
  return saveMediaFile(file, subdir);
}

export async function listMediaFilesUniversal(subdir: unknown) {
  const { useBlobStorage, listMediaFilesBlob } = await import('./media-storage-blob');
  if (useBlobStorage()) return listMediaFilesBlob(subdir);
  return listMediaFiles(subdir);
}

export async function deleteMediaFileUniversal(subdir: unknown, filename: unknown): Promise<boolean> {
  const { useBlobStorage, deleteMediaFileBlob } = await import('./media-storage-blob');
  if (useBlobStorage() && typeof filename === 'string' && filename.startsWith('http')) {
    return deleteMediaFileBlob(filename);
  }
  if (useBlobStorage()) return false;
  return deleteMediaFile(subdir, filename);
}

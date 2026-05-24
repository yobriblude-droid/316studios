import { put, del, list } from '@vercel/blob';
import { randomUUID } from 'crypto';
import type { UploadedFile } from 'express-fileupload';
import { MEDIA_SUBDIRS, sanitizeSubdir, validateImageFile } from './media-storage';

const IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function useBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveMediaFileBlob(file: UploadedFile, subdir: unknown): Promise<string> {
  const err = validateImageFile(file);
  if (err) throw new Error(err);

  const safeSub = sanitizeSubdir(subdir);
  const ext = (file.name?.match(/\.[a-z0-9]+$/i)?.[0] || '.jpg').toLowerCase();
  const pathname = `media/${safeSub}/${Date.now()}-${randomUUID()}${ext}`;

  const data = file.data?.length ? file.data : undefined;
  if (!data) throw new Error('Empty upload');

  const blob = await put(pathname, data, {
    access: 'public',
    contentType: file.mimetype || 'image/jpeg',
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}

export async function listMediaFilesBlob(subdir: unknown) {
  const safeSub = sanitizeSubdir(subdir);
  const prefix = `media/${safeSub}/`;
  const { blobs } = await list({ prefix, token: process.env.BLOB_READ_WRITE_TOKEN });
  return blobs
    .filter((b) => /\.(jpe?g|png|gif|webp)$/i.test(b.pathname))
    .map((b) => ({
      name: b.pathname.split('/').pop() || b.pathname,
      url: b.url,
      size: b.size,
      mtime: b.uploadedAt.toISOString(),
    }))
    .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
}

export async function deleteMediaFileBlob(urlOrPath: string): Promise<boolean> {
  try {
    await del(urlOrPath, { token: process.env.BLOB_READ_WRITE_TOKEN });
    return true;
  } catch {
    return false;
  }
}

export { MEDIA_SUBDIRS };

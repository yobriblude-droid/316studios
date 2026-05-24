/** Parse image URL list from JSON FormData field or array body */
export function parseImageUrlsFromBody(images: unknown): string[] {
  if (typeof images === 'string') {
    const trimmed = images.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
      }
    } catch {
      return trimmed ? [trimmed] : [];
    }
  }
  if (Array.isArray(images)) {
    return images.filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
  }
  return [];
}

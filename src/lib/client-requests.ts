export const CLIENT_REQUEST_CATEGORIES = [
  { id: 'deliverable', label: 'Deliverable access' },
  { id: 'retouch', label: 'Retouch / revision' },
  { id: 'album', label: 'Album / gallery' },
  { id: 'billing', label: 'Billing question' },
  { id: 'scheduling', label: 'Scheduling' },
  { id: 'other', label: 'Other' },
] as const;

export type ClientRequestCategory = (typeof CLIENT_REQUEST_CATEGORIES)[number]['id'];

export type ClientRequestPayload = {
  category: ClientRequestCategory;
  message: string;
  link?: string;
};

export function formatClientRequestDetails(payload: ClientRequestPayload): string {
  return JSON.stringify(payload);
}

export function parseClientRequestDetails(raw: string): ClientRequestPayload | { message: string } {
  try {
    const parsed = JSON.parse(raw) as ClientRequestPayload;
    if (parsed && typeof parsed.message === 'string') return parsed;
  } catch {
    /* legacy plain text */
  }
  return { category: 'other' as ClientRequestCategory, message: raw };
}

export function categoryLabel(category: string): string {
  return CLIENT_REQUEST_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

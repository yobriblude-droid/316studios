/** Base URL for API (empty = same origin; set VITE_API_URL when API is on another host). */
export function getApiBase(): string {
  const base = import.meta.env.VITE_API_URL as string | undefined;
  return base?.replace(/\/$/, '') ?? '';
}

function resolveApiUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (typeof input !== 'string' || input.startsWith('http')) return input;
  const base = getApiBase();
  return base ? `${base}${input.startsWith('/') ? input : `/${input}`}` : input;
}

/** Shared fetch defaults — session cookies for auth */
export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(resolveApiUrl(input), {
    ...init,
    credentials: 'include',
    headers: {
      ...(init?.headers || {}),
    },
  });
}

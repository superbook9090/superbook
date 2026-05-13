import { ApiClientError, apiJson } from '@/lib/api/http';

function messageFromBody(data: unknown, fallback: string): string {
  if (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as { message: unknown }).message === 'string'
  ) {
    return (data as { message: string }).message;
  }
  return fallback;
}

/** POST favorite; 201/409 are treated as success (already favorited). */
export async function addFavorite(blogId: string): Promise<void> {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blogId }),
    cache: 'no-store',
  });
  if (res.ok || res.status === 409) return;
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  throw new ApiClientError(messageFromBody(data, res.statusText || 'Request failed'), res.status, data);
}

export function removeFavorite(blogId: string): Promise<unknown> {
  return apiJson(`/api/favorites/${blogId}`, { method: 'DELETE' });
}

export type FavoritesListPayload = { favorites: unknown[] };

export function listFavorites(): Promise<FavoritesListPayload> {
  return apiJson<FavoritesListPayload>('/api/favorites', { method: 'GET' });
}

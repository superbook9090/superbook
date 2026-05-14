import { apiJson } from '@/lib/api/http';

/** POST favorite; 201/409 are treated as success (already favorited). */
export async function addFavorite(blogId: string): Promise<void> {
  await apiJson('/api/favorites', {
    method: 'POST',
    body: { blogId },
    acceptStatuses: [409],
  });
}

export function removeFavorite(blogId: string): Promise<unknown> {
  return apiJson(`/api/favorites/${blogId}`, { method: 'DELETE' });
}

export type FavoritesListPayload = { favorites: unknown[] };

export function listFavorites(): Promise<FavoritesListPayload> {
  return apiJson<FavoritesListPayload>('/api/favorites', { method: 'GET' });
}

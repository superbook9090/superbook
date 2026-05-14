import { apiJson, apiJsonData, type ApiResponseMeta } from '@/lib/api/http';

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

export type FavoritesListResult = {
  favorites: unknown[];
  meta?: ApiResponseMeta;
};

export async function listFavorites(
  page: number = 1,
  limit: number = 20
): Promise<FavoritesListResult> {
  const { data, meta } = await apiJsonData<{ favorites: unknown[] }>(
    `/api/favorites?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`
  );
  return { favorites: data.favorites ?? [], meta };
}

/** Lightweight favorite blog ids for session / heart state (no blog bodies). */
export async function listFavoriteIds(): Promise<string[]> {
  const { data } = await apiJsonData<{ ids: string[] }>('/api/favorites?idsOnly=true');
  return data.ids ?? [];
}

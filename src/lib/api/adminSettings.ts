import { apiJson } from '@/lib/api/http';

export function fetchAdminSettings<T = unknown>(): Promise<T> {
  return apiJson<T>('/api/admin/settings', { method: 'GET' });
}

export function patchAdminSettings<T = unknown>(body: unknown): Promise<T> {
  return apiJson<T>('/api/admin/settings', { method: 'PATCH', body });
}

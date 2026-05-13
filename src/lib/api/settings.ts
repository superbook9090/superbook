import { apiJson } from '@/lib/api/http';

export function fetchPublicSettings<T = unknown>(): Promise<T> {
  return apiJson<T>('/api/settings', { method: 'GET' });
}

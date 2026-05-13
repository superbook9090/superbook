import { apiJson } from '@/lib/api/http';

export function fetchAnalytics(type: 'admin' | 'teacher'): Promise<unknown> {
  return apiJson(`/api/analytics?type=${encodeURIComponent(type)}`, { method: 'GET' });
}

import { apiJson } from '@/lib/api/http';

export function fetchAnalytics(type: 'admin' | 'teacher', dateRange?: { startDate: string; endDate: string }): Promise<unknown> {
  const params = new URLSearchParams({ type });
  if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
  if (dateRange?.endDate) params.append('endDate', dateRange.endDate);
  
  return apiJson(`/api/analytics?${params.toString()}`, { method: 'GET' });
}

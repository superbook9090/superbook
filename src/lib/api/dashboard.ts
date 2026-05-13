import type { DashboardData } from '@/app/api/dashboard/route';
import { apiJson } from '@/lib/api/http';

export function fetchDashboard(): Promise<DashboardData> {
  return apiJson<DashboardData>('/api/dashboard', { method: 'GET' });
}

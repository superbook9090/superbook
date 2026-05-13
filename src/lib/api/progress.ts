import { apiJson } from '@/lib/api/http';

export function fetchStudentProgress(): Promise<unknown> {
  return apiJson('/api/progress', { method: 'GET' });
}

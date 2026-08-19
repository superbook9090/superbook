import { apiJson } from '@/lib/api/http';

export interface StudentProgressParams {
  courseId?: string;
  page?: number;
  limit?: number;
}

export interface TeacherProgressParams {
  courseId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AdminProgressParams {
  search?: string;
  page?: number;
  limit?: number;
}

export function fetchStudentProgress(params?: StudentProgressParams): Promise<unknown> {
  const q = new URLSearchParams();
  if (params?.courseId) q.set('course', params.courseId);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  const qs = q.toString();
  return apiJson(`/api/progress${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function fetchTeacherProgress(params?: TeacherProgressParams): Promise<unknown> {
  const q = new URLSearchParams({ role: 'teacher' });
  if (params?.courseId) q.set('course', params.courseId);
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return apiJson(`/api/progress?${q.toString()}`, { method: 'GET' });
}

export function fetchAdminProgress(params?: AdminProgressParams): Promise<unknown> {
  const q = new URLSearchParams({ role: 'admin' });
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));
  return apiJson(`/api/progress?${q.toString()}`, { method: 'GET' });
}

export function fetchStudentProgressDrilldown(
  studentId: string,
  params?: { courseId?: string }
): Promise<unknown> {
  const q = new URLSearchParams({ student: studentId });
  if (params?.courseId) q.set('course', params.courseId);
  return apiJson(`/api/progress?${q.toString()}`, { method: 'GET' });
}

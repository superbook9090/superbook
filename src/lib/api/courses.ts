import { apiJson } from '@/lib/api/http';

const BASE = '/api/courses';

export type CoursesListPayload = { courses: unknown[]; organizationId?: string };

export function listCoursesAdmin(): Promise<CoursesListPayload> {
  return apiJson(BASE, { method: 'GET' });
}

export function listTeacherCoursesSelf(): Promise<CoursesListPayload> {
  return apiJson(`${BASE}?instructor=self`, { method: 'GET' });
}

export function listTeacherCoursesByOrg(orgId: string): Promise<CoursesListPayload> {
  const o = orgId || 'public';
  return apiJson(`${BASE}?orgId=${encodeURIComponent(o)}&instructor=self`, { method: 'GET' });
}

export function listAvailableCoursesByOrg(orgId: string): Promise<CoursesListPayload> {
  const o = orgId || 'public';
  return apiJson(`${BASE}?orgId=${encodeURIComponent(o)}&available=true`, { method: 'GET' });
}

export function createCourse(body: unknown): Promise<unknown> {
  return apiJson(BASE, { method: 'POST', body });
}

export function patchCourse(courseId: string, body: unknown): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}`, { method: 'PATCH', body });
}

export function deleteCourse(courseId: string): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}`, { method: 'DELETE' });
}

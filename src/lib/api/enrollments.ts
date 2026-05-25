import { apiJson } from '@/lib/api/http';

const BASE = '/api/enrollments';

export type EnrollmentsListPayload = { enrollments: unknown[] };

export function listEnrollments(): Promise<EnrollmentsListPayload> {
  return apiJson(BASE, { method: 'GET' });
}

export function enrollInCourse(courseId: string, courseCode?: string): Promise<unknown> {
  return apiJson(BASE, { method: 'POST', body: { courseId, ...(courseCode ? { courseCode } : {}) } });
}

export function joinCourseByCode(courseCode: string): Promise<{ message: string; enrollment: unknown }> {
  return apiJson(`${BASE}/join-by-code`, { method: 'POST', body: { courseCode } });
}

export function dropEnrollment(enrollmentId: string): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(enrollmentId)}`, { method: 'DELETE' });
}

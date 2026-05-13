import { apiJson } from '@/lib/api/http';

const BASE = '/api/enrollments';

export type EnrollmentsListPayload = { enrollments: unknown[] };

export function listEnrollments(): Promise<EnrollmentsListPayload> {
  return apiJson(BASE, { method: 'GET' });
}

export function enrollInCourse(courseId: string): Promise<unknown> {
  return apiJson(BASE, { method: 'POST', body: { courseId } });
}

export function dropEnrollment(enrollmentId: string): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(enrollmentId)}`, { method: 'DELETE' });
}

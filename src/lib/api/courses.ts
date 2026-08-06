import { apiJson } from '@/lib/api/http';

const BASE = '/api/courses';

export type CourseDetail = {
  _id: string;
  title: string;
  description?: string;
  price: number;
  category?: string;
  thumbnail?: string;
  isPublished: boolean;
  locale?: 'en' | 'hi';
  /** Legacy field before `locale` rename; treat as UI language when `locale` is absent. */
  language?: 'en' | 'hi';
  courseCode?: string | null;
  isPrivate?: boolean;
};

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

export function getCourseById(courseId: string): Promise<CourseDetail> {
  return apiJson<CourseDetail>(`${BASE}/${encodeURIComponent(courseId)}`, { method: 'GET' });
}

export type CourseStudentRow = {
  enrollmentId: string;
  student: { _id: string; name: string; email: string; avatar?: string };
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  lessonCompletedCount: number;
  enrolledAt: string;
  completedAt?: string | null;
};

export function listCourseStudents(courseId: string): Promise<{ students: CourseStudentRow[] }> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}/students`, { method: 'GET' });
}

export function createCourse(body: unknown): Promise<unknown> {
  return apiJson(BASE, { method: 'POST', body });
}

export function patchCourse(courseId: string, body: unknown): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}`, { method: 'PATCH', body });
}

export function deleteCourse(courseId: string, reason?: string): Promise<unknown> {
  const url = reason
    ? `${BASE}/${encodeURIComponent(courseId)}?reason=${encodeURIComponent(reason)}`
    : `${BASE}/${encodeURIComponent(courseId)}`;
  return apiJson(url, { method: 'DELETE' });
}

// Curriculum APIs
export function getCourseCurriculum(courseId: string): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}/curriculum`, { method: 'GET' });
}

export function addChapter(courseId: string, body: unknown): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}/curriculum`, { method: 'POST', body });
}

export function updateChapter(chapterId: string, body: unknown): Promise<unknown> {
  return apiJson(`/api/chapters/${encodeURIComponent(chapterId)}`, { method: 'PATCH', body });
}

export function deleteChapter(chapterId: string): Promise<unknown> {
  return apiJson(`/api/chapters/${encodeURIComponent(chapterId)}`, { method: 'DELETE' });
}

export function addLesson(chapterId: string, body: unknown): Promise<unknown> {
  return apiJson(`/api/chapters/${encodeURIComponent(chapterId)}/lessons`, { method: 'POST', body });
}

export function updateLesson(lessonId: string, body: unknown): Promise<unknown> {
  return apiJson(`/api/lessons/${encodeURIComponent(lessonId)}`, { method: 'PATCH', body });
}

export function deleteLesson(lessonId: string): Promise<unknown> {
  return apiJson(`/api/lessons/${encodeURIComponent(lessonId)}`, { method: 'DELETE' });
}

export function reorderCurriculum(courseId: string, body: unknown): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(courseId)}/curriculum/reorder`, { method: 'POST', body });
}

export function getLesson(lessonId: string): Promise<unknown> {
  return apiJson(`/api/lessons/${encodeURIComponent(lessonId)}`, { method: 'GET' });
}

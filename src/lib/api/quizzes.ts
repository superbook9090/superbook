import { apiJson } from '@/lib/api/http';
import { toIdString } from '@/lib/id';

const BASE = '/api/quizzes';

export type QuizzesListPayload = { 
  quizzes: unknown[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function listQuizzesByOrg(orgId: string): Promise<QuizzesListPayload> {
  const o = orgId || 'public';
  return apiJson(`${BASE}?orgId=${encodeURIComponent(o)}`, { method: 'GET' });
}

/** All quizzes for one course (avoids org-wide pagination missing lesson-scoped quizzes). */
export function listQuizzesByCourse(courseId: string): Promise<QuizzesListPayload> {
  const params = new URLSearchParams({
    course: courseId,
    limit: '200',
  });
  return apiJson(`${BASE}?${params.toString()}`, { method: 'GET' });
}

/** GET `/api/quizzes` without org filter (admin all quizzes, teacher client-side filter). */
export function listQuizzesAll(): Promise<QuizzesListPayload> {
  return apiJson(BASE, { method: 'GET' });
}

export function listQuizzesPaginated(params: {
  page?: number;
  limit?: number;
  search?: string;
  course?: string;
  status?: string;
  sort?: string;
}): Promise<QuizzesListPayload> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.search) searchParams.set('search', params.search);
  if (params.course && params.course !== 'all') searchParams.set('course', params.course);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.sort) searchParams.set('sort', params.sort);

  return apiJson(`${BASE}?${searchParams.toString()}`, { method: 'GET' });
}

export function getQuizById(quizId: string): Promise<{ quiz: unknown }> {
  return apiJson<{ quiz: unknown }>(`${BASE}/${encodeURIComponent(quizId)}`, { method: 'GET' });
}

/** Teacher edit: loads quiz + questions with correct answers. */
export type QuizEditQuestion = {
  _id?: string;
  order?: number;
  question: string;
  options: string[];
  correctAnswer?: number;
};

export type QuizEditResponse = {
  quiz: {
    _id: string;
    title: string;
    description?: string;
    timeLimit: number;
    isPublished: boolean;
    course?: string | { _id: string; title?: string };
    chapter?: string | { _id: string; title?: string } | null;
  };
  questions?: QuizEditQuestion[];
};

export function getQuizForEdit(quizId: string): Promise<QuizEditResponse> {
  const qs = new URLSearchParams({ include: 'questions,answers' });
  return apiJson<QuizEditResponse>(
    `${BASE}/${encodeURIComponent(quizId)}?${qs.toString()}`,
    { method: 'GET' }
  );
}

export function createQuiz(body: unknown): Promise<unknown> {
  return apiJson(BASE, { method: 'POST', body });
}

export function patchQuiz(quizId: string, body: unknown): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(quizId)}`, { method: 'PATCH', body });
}

export function deleteQuiz(quizId: unknown): Promise<unknown> {
  const id = toIdString(quizId);
  return apiJson(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

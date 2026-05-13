import { apiJson } from '@/lib/api/http';

const BASE = '/api/quizzes';

export type QuizzesListPayload = { quizzes: unknown[] };

export function listQuizzesByOrg(orgId: string): Promise<QuizzesListPayload> {
  const o = orgId || 'public';
  return apiJson(`${BASE}?orgId=${encodeURIComponent(o)}`, { method: 'GET' });
}

/** GET `/api/quizzes` without org filter (admin all quizzes, teacher client-side filter). */
export function listQuizzesAll(): Promise<QuizzesListPayload> {
  return apiJson(BASE, { method: 'GET' });
}

export function getQuizById(quizId: string): Promise<{ quiz: unknown }> {
  return apiJson<{ quiz: unknown }>(`${BASE}/${encodeURIComponent(quizId)}`, { method: 'GET' });
}

export function createQuiz(body: unknown): Promise<unknown> {
  return apiJson(BASE, { method: 'POST', body });
}

export function patchQuiz(quizId: string, body: unknown): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(quizId)}`, { method: 'PATCH', body });
}

export function deleteQuiz(quizId: string): Promise<unknown> {
  return apiJson(`${BASE}/${encodeURIComponent(quizId)}`, { method: 'DELETE' });
}

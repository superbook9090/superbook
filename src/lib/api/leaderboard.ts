import { apiJson } from '@/lib/api/http';

export function fetchCourseLeaderboard(courseId: string): Promise<unknown> {
  return apiJson(`/api/leaderboard/course/${encodeURIComponent(courseId)}`, { method: 'GET' });
}

export function fetchQuizLeaderboard(quizId: string): Promise<unknown> {
  return apiJson(`/api/leaderboard/quiz/${encodeURIComponent(quizId)}`, { method: 'GET' });
}

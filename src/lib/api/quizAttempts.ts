import { apiJson } from '@/lib/api/http';

const QUIZ_ATTEMPTS = '/api/quiz-attempts';

export type StartQuizAttemptResponse = {
  message: string;
  attempt: { _id: string };
  questions?: unknown[];
};

export type SubmitQuizAttemptInput = {
  quizId: string;
  action: 'submit';
  answers: { questionIndex: number; selectedOption: number }[];
  timeTaken?: number;
  forceSubmit?: boolean;
};

export type SubmitQuizAttemptResponse = {
  message: string;
  attempt: { _id: string };
};

/** POST `{ quizId, action: 'start' }` — returns new attempt id for `/take?attemptId=`. */
export function startQuizAttempt(quizId: string): Promise<StartQuizAttemptResponse> {
  return apiJson<StartQuizAttemptResponse>(QUIZ_ATTEMPTS, {
    method: 'POST',
    body: { quizId, action: 'start' },
  });
}

/** POST submit payload (in-progress attempt must exist). */
export function submitQuizAttempt(input: SubmitQuizAttemptInput): Promise<SubmitQuizAttemptResponse> {
  return apiJson<SubmitQuizAttemptResponse>(QUIZ_ATTEMPTS, {
    method: 'POST',
    body: input,
  });
}

export type QuizAttemptsListResponse = {
  attempts: unknown[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
};

export function listQuizAttempts(): Promise<QuizAttemptsListResponse> {
  return apiJson<QuizAttemptsListResponse>(QUIZ_ATTEMPTS, { method: 'GET' });
}

export function getQuizAttemptByAttemptId(attemptId: string): Promise<QuizAttemptsListResponse> {
  return apiJson<QuizAttemptsListResponse>(
    `${QUIZ_ATTEMPTS}?attemptId=${encodeURIComponent(attemptId)}`,
    { method: 'GET' }
  );
}

export function getQuizAttemptReview(attemptId: string): Promise<unknown> {
  return apiJson(`${QUIZ_ATTEMPTS}/${encodeURIComponent(attemptId)}/review`, { method: 'GET' });
}

/**
 * Quiz API - Centralized API calls for quiz-related operations
 * 
 * All quiz-related network calls should be made through this file.
 * This separates API logic from UI components.
 */

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  instructor: { _id: string; name: string };
  questions: Question[];
  timeLimit: number;
  isPublished: boolean;
}

export interface QuizAttempt {
  _id: string;
  quiz: Quiz;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  attemptNumber: number;
  submittedAt: string;
}

/**
 * Get all quizzes
 */
export async function getQuizzes(): Promise<Quiz[]> {
  const response = await fetch('/api/quizzes');
  if (!response.ok) {
    throw new Error('Failed to fetch quizzes');
  }
  return response.json();
}

/**
 * Get a single quiz by ID
 */
export async function getQuizById(id: string): Promise<Quiz> {
  const response = await fetch(`/api/quizzes/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz');
  }
  return response.json();
}

/**
 * Get quiz attempts for a user
 */
export async function getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
  const response = await fetch(`/api/quizzes/${quizId}/attempts`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz attempts');
  }
  return response.json();
}

/**
 * Get a specific quiz attempt for review
 */
export async function getQuizAttemptReview(attemptId: string): Promise<QuizAttempt> {
  const response = await fetch(`/api/quiz-attempts/${attemptId}/review`);
  if (!response.ok) {
    throw new Error('Failed to fetch quiz attempt review');
  }
  return response.json();
}

/**
 * Start a quiz attempt
 */
export async function startQuizAttempt(quizId: string): Promise<QuizAttempt> {
  const response = await fetch('/api/quiz-attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quizId }),
  });
  if (!response.ok) {
    throw new Error('Failed to start quiz attempt');
  }
  return response.json();
}

/**
 * Submit a quiz attempt
 */
export async function submitQuizAttempt(attemptId: string, answers: number[]): Promise<QuizAttempt> {
  const response = await fetch(`/api/quiz-attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit quiz attempt');
  }
  return response.json();
}

/**
 * Create a new quiz
 */
export async function createQuiz(data: Partial<Quiz>): Promise<Quiz> {
  const response = await fetch('/api/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create quiz');
  }
  return response.json();
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(id: string, data: Partial<Quiz>): Promise<Quiz> {
  const response = await fetch(`/api/quizzes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update quiz');
  }
  return response.json();
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(id: string): Promise<void> {
  const response = await fetch(`/api/quizzes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete quiz');
  }
}

/**
 * Toggle quiz publish status
 */
export async function toggleQuizPublish(id: string, isPublished: boolean): Promise<Quiz> {
  const response = await fetch(`/api/quizzes/${id}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublished }),
  });
  if (!response.ok) {
    throw new Error('Failed to update quiz publish status');
  }
  return response.json();
}

import { getQuizLessonId } from '@/lib/quiz/quizLesson';

/** Normalized chapter id from quiz API payloads (populated or raw). */
export function getQuizChapterId(
  chapter: string | { _id?: string } | null | undefined
): string | null {
  if (!chapter) return null;
  if (typeof chapter === 'string') return chapter;
  return chapter._id ?? null;
}

export function isCourseLevelQuiz(
  chapter: string | { _id?: string } | null | undefined,
  lesson?: string | { _id?: string } | null | undefined
): boolean {
  return getQuizChapterId(chapter) === null && getQuizLessonId(lesson) === null;
}

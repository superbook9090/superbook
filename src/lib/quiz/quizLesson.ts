/** Normalized lesson id from quiz API payloads (populated or raw). */
export function getQuizLessonId(
  lesson: string | { _id?: string } | null | undefined
): string | null {
  if (!lesson) return null;
  if (typeof lesson === 'string') return lesson;
  return lesson._id ?? null;
}

export function isLessonLevelQuiz(
  lesson: string | { _id?: string } | null | undefined
): boolean {
  return getQuizLessonId(lesson) !== null;
}

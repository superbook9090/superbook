export type QuizPlacementParam = 'course' | 'chapter' | 'lesson';

export function buildTeacherCreateQuizUrl(opts: {
  courseId: string;
  placement?: QuizPlacementParam;
  chapterId?: string;
  lessonId?: string;
}): string {
  const params = new URLSearchParams({ course: opts.courseId });
  if (opts.placement) params.set('placement', opts.placement);
  if (opts.chapterId) params.set('chapter', opts.chapterId);
  if (opts.lessonId) params.set('lesson', opts.lessonId);
  return `/dashboard/teacher/quizzes/create?${params.toString()}`;
}

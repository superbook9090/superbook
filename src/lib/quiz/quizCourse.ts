import type { CurriculumQuiz } from '@/lib/curriculum/tree';
import { getQuizChapterId, isCourseLevelQuiz } from '@/lib/quiz/quizChapter';
import { getQuizLessonId, isLessonLevelQuiz } from '@/lib/quiz/quizLesson';

type QuizCourseRef = string | { _id?: string } | null | undefined;

export function getQuizCourseId(course: QuizCourseRef): string | null {
  if (!course) return null;
  if (typeof course === 'string') return course;
  return course._id ?? null;
}

export type QuizWithCourse = {
  _id: string;
  title: string;
  timeLimit: number;
  questionCount?: number;
  isPublished: boolean;
  course: QuizCourseRef;
  chapter?: QuizCourseRef;
  lesson?: QuizCourseRef;
};

export function filterQuizzesByCourse<T extends QuizWithCourse>(
  quizzes: T[],
  courseId: string
): T[] {
  return quizzes.filter((q) => getQuizCourseId(q.course) === courseId);
}

export function splitQuizzesByScope<T extends QuizWithCourse>(quizzes: T[]) {
  return {
    courseLevel: quizzes.filter((q) => isCourseLevelQuiz(q.chapter, q.lesson)),
    chapterScoped: quizzes.filter(
      (q) => !isCourseLevelQuiz(q.chapter, q.lesson) && !isLessonLevelQuiz(q.lesson)
    ),
    lessonScoped: quizzes.filter((q) => isLessonLevelQuiz(q.lesson)),
  };
}

export function toCurriculumQuiz(quiz: QuizWithCourse, courseId: string): CurriculumQuiz {
  return {
    _id: quiz._id,
    title: quiz.title,
    timeLimit: quiz.timeLimit,
    questionCount: quiz.questionCount,
    isPublished: quiz.isPublished,
    course: courseId,
    chapter: getQuizChapterId(quiz.chapter),
    lesson: getQuizLessonId(quiz.lesson),
  };
}

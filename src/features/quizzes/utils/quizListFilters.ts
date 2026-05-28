import type { Quiz } from '@/lib/react-query/hooks';
import { toIdString } from '@/lib/id';

export type QuizStatusFilter = 'all' | 'published' | 'draft';
export type QuizSortOption = 'newest' | 'oldest' | 'titleAsc' | 'titleDesc';

function getQuizCourseId(course: Quiz['course'] | string): string {
  if (typeof course === 'object' && course !== null && '_id' in course) {
    return toIdString(course._id);
  }
  return toIdString(course);
}

export function filterAndSortTeacherQuizzes(
  quizzes: Quiz[],
  opts: {
    search: string;
    status: QuizStatusFilter;
    courseId: string;
    sort: QuizSortOption;
    getCourseTitle: (course: Quiz['course'] | string) => string;
  }
): Quiz[] {
  const term = opts.search.trim().toLowerCase();

  const filtered = quizzes.filter((quiz) => {
    const matchesSearch =
      !term ||
      quiz.title.toLowerCase().includes(term) ||
      (quiz.description ?? '').toLowerCase().includes(term) ||
      opts.getCourseTitle(quiz.course).toLowerCase().includes(term);

    const matchesStatus =
      opts.status === 'all' ||
      (opts.status === 'published' && quiz.isPublished) ||
      (opts.status === 'draft' && !quiz.isPublished);

    const matchesCourse =
      opts.courseId === 'all' || getQuizCourseId(quiz.course) === opts.courseId;

    return matchesSearch && matchesStatus && matchesCourse;
  });

  return [...filtered].sort((a, b) => {
    switch (opts.sort) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'titleAsc':
        return a.title.localeCompare(b.title);
      case 'titleDesc':
        return b.title.localeCompare(a.title);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}

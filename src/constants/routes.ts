/** Centralized app routes for navigation, links, and redirects. */

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  contact: '/contact',
  privacy: '/privacy',
  maintenance: '/maintenance',
  howItWorks: '/how-it-works',
  blogs: '/blogs',
  blog: (slug: string) => `/blogs/${slug}`,
  blogCategory: (topic: string) => `/blogs/category/${topic}`,
  blogFeed: '/blogs/feed.xml',
  courses: '/courses',
  course: (slug: string) => `/courses/${slug}`,
  toolsIndex: '/tools',
  tools: (slug: string) => `/tools/${slug}`,
  dashboard: '/dashboard',
  profile: '/dashboard/profile',
  student: {
    root: '/dashboard/student',
    courses: '/dashboard/student/courses',
    course: (id: string) => `/dashboard/student/courses/${id}`,
    lesson: (courseId: string, lessonId: string) =>
      `/dashboard/student/courses/${courseId}/lessons/${lessonId}`,
    browse: '/dashboard/student/browse',
    files: '/dashboard/student/files',
    blogs: '/dashboard/student/blogs',
    blog: (id: string) => `/dashboard/student/blogs/${id}`,
    favorites: '/dashboard/student/favorites',
    quizzes: '/dashboard/student/quizzes',
    quiz: (id: string) => `/dashboard/student/quizzes/${id}`,
    quizResult: (id: string) => `/dashboard/student/quizzes/${id}/result`,
    quizTake: (attemptId: string) =>
      `/dashboard/student/quizzes/take?attemptId=${encodeURIComponent(attemptId)}`,
    progress: '/dashboard/student/progress',
    certificates: '/dashboard/student/certificates',
    certificate: (id: string) => `/dashboard/student/certificates/${id}`,
    profile: '/dashboard/student/profile',
    notifications: '/dashboard/student/notifications',
    notes: '/dashboard/student/notes',
  },
  teacher: {
    root: '/dashboard/teacher',
    courses: '/dashboard/teacher/courses',
    courseCreate: '/dashboard/teacher/courses/create',
    courseEdit: (id: string) => `/dashboard/teacher/courses/${id}/edit`,
    courseStudents: (id: string) => `/dashboard/teacher/courses/${id}/students`,
    quizzes: '/dashboard/teacher/quizzes',
    quizCreate: '/dashboard/teacher/quizzes/create',
    quizEdit: (id: string) => `/dashboard/teacher/quizzes/${id}/edit`,
    blogs: '/dashboard/teacher/blogs',
    blogCreate: '/dashboard/teacher/blogs/create',
    blogEdit: (id: string) => `/dashboard/teacher/blogs/edit/${id}`,
    analytics: '/dashboard/teacher/analytics',
    profile: '/dashboard/teacher/profile',
    notes: '/dashboard/teacher/notes',
  },
  admin: {
    root: '/dashboard/admin',
    users: '/dashboard/admin/users',
    organizations: '/dashboard/admin/organizations',
    courses: '/dashboard/admin/courses',
    courseStudents: (id: string) => `/dashboard/admin/courses/${id}/students`,
    quizzes: '/dashboard/admin/quizzes',
    blogs: '/dashboard/admin/blogs',
    files: '/dashboard/admin/files',
    analytics: '/dashboard/admin/analytics',
    notifications: '/dashboard/admin/notifications',
    settings: '/dashboard/admin/settings',
    profile: '/dashboard/admin/profile',
    videos: '/dashboard/admin/videos',
    notes: '/dashboard/admin/notes',
  },
} as const;

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
  return `${ROUTES.teacher.quizCreate}?${params.toString()}`;
}

export function loginWithResetSuccess(): string {
  return `${ROUTES.login}?reset=success`;
}

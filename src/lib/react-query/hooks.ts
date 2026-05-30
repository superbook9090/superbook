'use client';

import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import type { DashboardData, TeacherDashboardData } from '@/app/api/dashboard/route';
import { listBlogsPaginated, createBlog, deleteBlog, updateBlog, type CreateBlogInput, type ListBlogsParams } from '@/lib/api/blogs';
import { addFavorite, listFavorites, removeFavorite, type FavoritesListResult } from '@/lib/api/favorites';
import { fetchDashboard } from '@/lib/api/dashboard';
import { 
  listTeacherCoursesByOrg, 
  listAvailableCoursesByOrg, 
  patchCourse,
  deleteCourse,
  getCourseCurriculum,
  addChapter,
  updateChapter,
  deleteChapter,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderCurriculum,
  getLesson
} from '@/lib/api/courses';
import { listQuizzesByOrg, listQuizzesByCourse, listQuizzesPaginated, deleteQuiz } from '@/lib/api/quizzes';
import { toIdString } from '@/lib/id';
import { listTeacherCoursesSelf } from '@/lib/api/courses';
import { listEnrollments, enrollInCourse, joinCourseByCode, dropEnrollment } from '@/lib/api/enrollments';
import { listQuizAttempts, startQuizAttempt, submitQuizAttempt, type SubmitQuizAttemptInput } from '@/lib/api/quizAttempts';
import { queryKeys, favoritesListDefaults } from '@/lib/react-query/query-keys';
import { useSessionStore } from '@/store/useSessionStore';
export type { DashboardData, TeacherDashboardData };

// Centralized query keys for cache management
const QUERY_KEYS = {
  DASHBOARD: ['dashboard'] as const,
  COURSES: (orgId?: string) => ['courses', orgId || 'public'] as const,
  TEACHER_COURSES: (orgId?: string) => ['courses', orgId || 'public', 'teacher'] as const,
  AVAILABLE_COURSES: (orgId?: string) => ['courses', orgId || 'public', 'available'] as const,
  BLOGS: (orgId?: string, includeDrafts?: boolean) => ['blogs', orgId || 'public', includeDrafts] as const,
  QUIZZES: (orgId?: string) => ['quizzes', orgId || 'public'] as const,
  ENROLLMENTS: ['enrollments'] as const,
  QUIZ_ATTEMPTS: ['quizAttempts'] as const,
  FAVORITES: queryKeys.favorites.all,
};

// Types
export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  instructor: { _id: string; name: string; email: string };
  isPublished: boolean;
  enrolledCount?: number;
  createdAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  language: string;
  isPublished: boolean;
  author: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  chapter?: { _id: string; title: string } | string | null;
  lesson?: { _id: string; title: string } | string | null;
  instructor: { _id: string; name: string; email: string };
  isPublished: boolean;
  timeLimit: number;
  questionCount?: number;
  version?: number;
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    thumbnailUrl?: string;
    category?: string;
    price: number;
    instructor: { name: string; email: string };
    isPublished: boolean;
  };
  progress: number;
  status: string;
  enrolledAt: string;
  completedAt?: string;
}

export interface QuizAttempt {
  _id: string;
  quiz: Quiz;
  score: number;
  correctCount: number;
  totalQuestions: number;
  status: string;
  attemptNumber: number;
  submittedAt?: string;
  startedAt: string;
  timeTaken: number;
}

export interface Favorite {
  _id: string;
  user?: string;
  blog: {
    _id: string;
    title: string;
    /** Full HTML when explicitly requested from the API (e.g. after add). */
    content?: string;
    excerpt?: string;
    topic: string;
    language?: string;
    author?: { name: string };
    createdAt: string;
  };
  createdAt: string;
}

export interface Lesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  youtubeVideoId?: string;
  videoEmbedUrl?: string;
  thumbnail?: string;
  duration: number;
  order: number;
  isPublished: boolean;
  isPreview?: boolean;
  notesPdf?: string;
  attachments?: string[];
  course: string;
  chapter: string;
  createdAt: string;
}

export interface Chapter {
  _id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  lessons?: Lesson[];
  quizzes?: Array<{
    _id: string;
    title: string;
    timeLimit: number;
    questionCount?: number;
    isPublished: boolean;
    course: string;
    chapter: string | null;
    lesson: string | null;
  }>;
  subChapters?: Chapter[];
  course: string;
  parentChapter?: string | null;
}

// ============ QUERIES ============

export function useTeacherCourses(orgId?: string) {
  return useQuery({
    queryKey: ['courses', orgId || 'public', 'teacher'],
    queryFn: async () => {
      const data = await listTeacherCoursesByOrg(orgId || 'public');
      return (data.courses || []) as Course[];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useAvailableCourses(orgId?: string) {
  return useQuery({
    queryKey: ['courses', orgId || 'public', 'available'],
    queryFn: async () => {
      const data = await listAvailableCoursesByOrg(orgId || 'public');
      return (data.courses || []) as Course[];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useBlogs(orgId?: string, includeDrafts = false) {
  return useQuery({
    queryKey: ['blogs', orgId || 'public', includeDrafts],
    queryFn: async () => {
      const data = await listBlogsPaginated({
        orgId: orgId || 'public',
        includeDrafts,
        limit: 200,
        page: 1,
      });
      return (data.blogs || []) as Blog[];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function usePaginatedBlogs(params: ListBlogsParams, enabled = true) {
  return useQuery({
    queryKey: ['blogs', 'paginated', params],
    queryFn: async () => {
      const data = await listBlogsPaginated(params);
      return {
        blogs: (data.blogs || []) as Blog[],
        pagination: data.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: 0,
          totalPages: 1,
        },
        stats: data.stats,
      };
    },
    enabled,
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) return undefined;
      const prev = previousQuery.queryKey[2] as ListBlogsParams;
      const filtersChanged =
        prev.search !== params.search ||
        prev.status !== params.status ||
        prev.topic !== params.topic ||
        prev.language !== params.language ||
        prev.limit !== params.limit ||
        prev.includeDrafts !== params.includeDrafts ||
        prev.author !== params.author ||
        prev.orgId !== params.orgId;
      if (filtersChanged) return undefined;
      return previousData;
    },
  });
}

export function useQuizzes(orgId?: string) {
  return useQuery({
    queryKey: ['quizzes', orgId || 'public'],
    queryFn: async () => {
      const data = await listQuizzesByOrg(orgId || 'public');
      return (data.quizzes || []) as Quiz[];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

/** Quizzes for one course, optionally published-only (student views). */
/** Teacher quiz management list (all quizzes filtered to instructor's courses). */
export function useTeacherQuizzesList(enabled = true) {
  return useQuery({
    queryKey: ['quizzes', 'teacher-list'],
    queryFn: async () => {
      const coursesData = await listTeacherCoursesSelf();
      const courses = (coursesData.courses || []) as Course[];
      if (courses.length === 0) {
        return { courses, quizzes: [] as Quiz[] };
      }
      const courseIds = new Set(courses.map((c) => c._id));
      const data = await listQuizzesPaginated({ limit: 200, instructor: 'self' });
      const all = (data.quizzes || []) as Quiz[];
      const quizzes = all.filter((q) => {
        const id =
          typeof q.course === 'object' && q.course !== null && '_id' in q.course
            ? q.course._id
            : String(q.course);
        return id && courseIds.has(id);
      });
      return { courses, quizzes };
    },
    enabled,
    refetchOnMount: 'always',
  });
}

export function useCourseQuizzes(
  courseId: string,
  options?: { orgId?: string; publishedOnly?: boolean }
) {
  const publishedOnly = options?.publishedOnly ?? false;

  const query = useQuery({
    queryKey: ['quizzes', 'course', courseId, publishedOnly],
    queryFn: async () => {
      const data = await listQuizzesByCourse(courseId);
      let quizzes = (data.quizzes || []) as Quiz[];
      if (publishedOnly) {
        quizzes = quizzes.filter((q) => q.isPublished);
      }
      return quizzes;
    },
    enabled: !!courseId,
  });

  return { ...query, quizzes: query.data ?? [] };
}

export function usePaginatedQuizzes(params: {
  page: number;
  limit: number;
  search?: string;
  course?: string;
  status?: string;
  sort?: string;
  instructor?: string;
}) {
  return useQuery({
    queryKey: ['quizzes', 'paginated', params],
    queryFn: async () => {
      const data = await listQuizzesPaginated(params);
      return {
        quizzes: (data.quizzes || []) as Quiz[],
        pagination: data.pagination,
      };
    },
    // Keep previous page data while paginating; clear when filters change
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) return undefined;
      const prev = previousQuery.queryKey[2] as typeof params;
      const filtersChanged =
        prev.search !== params.search ||
        prev.status !== params.status ||
        prev.course !== params.course ||
        prev.sort !== params.sort ||
        prev.limit !== params.limit ||
        prev.instructor !== params.instructor;
      if (filtersChanged) return undefined;
      return previousData;
    },
  });
}

export function useEnrollments() {
  return useQuery({
    queryKey: QUERY_KEYS.ENROLLMENTS,
    queryFn: async () => {
      const data = await listEnrollments();
      return (data.enrollments || []) as Enrollment[];
    },
  });
}

// ============ DASHBOARD QUERIES ============

/**
 * Single source of truth for dashboard data
 * Replaces multiple SWR calls with one React Query call
 * Returns role-based data: student or teacher
 */
export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: QUERY_KEYS.DASHBOARD,
    queryFn: () => fetchDashboard(),
    staleTime: 30 * 1000, // align with server Redis TTL for /api/dashboard
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Type guard to check if dashboard data is for student
 */
export function isStudentDashboard(data: DashboardData): data is Extract<DashboardData, { role: 'student' }> {
  return data.role === 'student';
}

/**
 * Type guard to check if dashboard data is for teacher/admin
 */
export function isTeacherDashboard(data: DashboardData): data is Extract<DashboardData, { role: 'teacher' | 'admin' }> {
  return data.role === 'teacher' || data.role === 'admin';
}

export function usePublishCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ courseId, isPublished }: { courseId: string; isPublished: boolean }) => {
      return patchCourse(courseId, { isPublished }) as Promise<{ organizationId?: string }>;
    },
    onSuccess: (data) => {
      // Invalidate teacher courses cache
      const orgId = data.organizationId || 'public';
      queryClient.invalidateQueries({ queryKey: ['courses', orgId, 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['courses', orgId] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      // Invalidate teacher courses cache
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useQuizAttempts() {
  return useQuery({
    queryKey: ['quizAttempts'],
    queryFn: async () => {
      const data = await listQuizAttempts();
      return (data.attempts || []) as QuizAttempt[];
    },
  });
}

export function useFavorites() {
  const { page, limit } = favoritesListDefaults;
  return useQuery({
    queryKey: queryKeys.favorites.list(page, limit),
    queryFn: () => listFavorites(page, limit),
    staleTime: 60 * 1000,
    select: (res: FavoritesListResult) => ({
      favorites: (res.favorites || []) as Favorite[],
      meta: res.meta,
    }),
  });
}

// ============ BLOG MUTATIONS ============

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlogInput) => createBlog(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      return deleteBlog(blogId);
    },
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      const previousBlogs = queryClient.getQueryData<Blog[]>(['blogs']);
      queryClient.setQueryData<Blog[]>(['blogs'], (old) =>
        (old || []).filter((b) => b._id !== blogId)
      );
      return { previousBlogs };
    },
    onError: (err, blogId, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blogId, data }: { blogId: string; data: Partial<Blog> }) => {
      return updateBlog(blogId, data);
    },
    onMutate: async ({ blogId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      const previousBlogs = queryClient.getQueryData<Blog[]>(['blogs']);
      queryClient.setQueryData<Blog[]>(['blogs'], (old) =>
        (old || []).map((b) => (b._id === blogId ? { ...b, ...data } : b))
      );
      return { previousBlogs };
    },
    onError: (err, variables, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

// ============ ENROLLMENT MUTATIONS ============

export function useDropEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enrollmentId: string) => dropEnrollment(enrollmentId),
    onMutate: async (enrollmentId) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      const previousEnrollments = queryClient.getQueryData<Enrollment[]>(QUERY_KEYS.ENROLLMENTS);
      queryClient.setQueryData<Enrollment[]>(QUERY_KEYS.ENROLLMENTS, (old) =>
        (old || []).filter((e) => e._id !== enrollmentId)
      );
      return { previousEnrollments };
    },
    onError: (err, enrollmentId, context) => {
      if (context?.previousEnrollments) {
        queryClient.setQueryData(QUERY_KEYS.ENROLLMENTS, context.previousEnrollments);
      }
    },
    onSettled: () => {
      // Invalidate all related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, courseCode }: { courseId: string; courseCode?: string }) =>
      enrollInCourse(courseId, courseCode),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useJoinCourseByCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseCode: string) => joinCourseByCode(courseCode),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  const listKey = queryKeys.favorites.list(favoritesListDefaults.page, favoritesListDefaults.limit);

  return useMutation({
    mutationFn: (blogId: string) => removeFavorite(blogId),
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.favorites.all });
      const previous = queryClient.getQueryData<FavoritesListResult>(listKey);
      queryClient.setQueryData<FavoritesListResult>(listKey, (old) => {
        if (!old) return old;
        const next = (old.favorites || []).filter((f) => (f as Favorite).blog._id !== blogId);
        const prevTotal = old.meta?.total ?? next.length + 1;
        return {
          favorites: next,
          meta: old.meta
            ? { ...old.meta, total: Math.max(0, prevTotal - 1), hasMore: old.meta.hasMore }
            : old.meta,
        };
      });
      return { previous };
    },
    onError: (_err, _blogId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
    },
    onSuccess: (_data, blogId) => {
      useSessionStore.getState().removeFavorite(blogId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blogId: string) => addFavorite(blogId),
    onSuccess: (_data, blogId) => {
      useSessionStore.getState().addFavorite(blogId);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
}

export function useStartQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => startQuizAttempt(quizId),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ_ATTEMPTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitQuizAttemptInput) => submitQuizAttempt(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ_ATTEMPTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
}

// ============ CURRICULUM QUERIES & MUTATIONS ============

export function useLesson(lessonId: string) {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: () => getLesson(lessonId) as Promise<Lesson>,
    enabled: !!lessonId,
  });
}

export function useCourseCurriculum(courseId: string) {
  return useQuery({
    queryKey: ['courses', courseId, 'curriculum'],
    queryFn: () => getCourseCurriculum(courseId) as Promise<Chapter[]>,
    enabled: !!courseId,
  });
}



export function useLessonDetails(lessonId: string) {
  return useQuery({
    queryKey: ['lessons', lessonId],
    queryFn: () => getLesson(lessonId) as Promise<Lesson>,
    enabled: !!lessonId,
  });
}

export function useAddChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: Partial<Chapter> }) => 
      addChapter(courseId, data) as Promise<Chapter>,
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: Partial<Chapter>; courseId: string }) =>
      updateChapter(chapterId, data) as Promise<Chapter>,
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
    },
  });
}

export function useDeleteChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chapterId: string) => deleteChapter(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useAddLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ chapterId, data }: { chapterId: string; data: Partial<Lesson> }) => 
      addLesson(chapterId, data) as Promise<Lesson>,
    onSuccess: (data: Lesson) => {
      queryClient.invalidateQueries({ queryKey: ['courses', data.course, 'curriculum'] });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, data }: { lessonId: string; data: Partial<Lesson> }) => 
      updateLesson(lessonId, data) as Promise<Lesson>,
    onSuccess: (data: Lesson) => {
      queryClient.invalidateQueries({ queryKey: ['courses', data.course, 'curriculum'] });
      queryClient.invalidateQueries({ queryKey: ['lessons', data._id] });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useReorderCurriculum() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, data }: { courseId: string; data: unknown }) =>
      reorderCurriculum(courseId, data),
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
    },
  });
}

/** Keep quiz lists and course curriculum in sync after create/update/delete. */
export function invalidateAfterQuizChange(
  queryClient: QueryClient,
  courseId: string,
  orgId = 'public'
) {
  if (!courseId) return;
  queryClient.invalidateQueries({ queryKey: ['quizzes'] });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZZES(orgId) });
  queryClient.invalidateQueries({ queryKey: ['quizzes', 'course', courseId] });
  queryClient.invalidateQueries({ queryKey: ['quizzes', 'teacher-list'] });
  queryClient.invalidateQueries({ queryKey: ['quizzes', 'paginated'] });
  queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      quizId,
      courseId,
      orgId = 'public',
    }: {
      quizId: string;
      courseId: string;
      orgId?: string;
    }) => deleteQuiz(toIdString(quizId)).then(() => ({ courseId, orgId })),
    onSuccess: (_, { courseId, orgId }) => {
      invalidateAfterQuizChange(queryClient, courseId, orgId);
    },
  });
}

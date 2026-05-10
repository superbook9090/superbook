'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DashboardData, StudentDashboardData, TeacherDashboardData } from '@/app/api/dashboard/route';

// Re-export types for convenience
export type { DashboardData, StudentDashboardData, TeacherDashboardData };

// ============ QUERY KEYS ============
// Centralized query keys for cache management
export const QUERY_KEYS = {
  DASHBOARD: ['dashboard'] as const,
  COURSES: (orgId?: string) => ['courses', orgId || 'public'] as const,
  TEACHER_COURSES: (orgId?: string) => ['courses', orgId || 'public', 'teacher'] as const,
  AVAILABLE_COURSES: (orgId?: string) => ['courses', orgId || 'public', 'available'] as const,
  BLOGS: (orgId?: string, includeDrafts?: boolean) => ['blogs', orgId || 'public', includeDrafts] as const,
  QUIZZES: (orgId?: string) => ['quizzes', orgId || 'public'] as const,
  ENROLLMENTS: ['enrollments'] as const,
  QUIZ_ATTEMPTS: ['quizAttempts'] as const,
  FAVORITES: ['favorites'] as const,
};

// Types
export interface Course {
  _id: string;
  id: string; // Alias for _id to match PaymentSummary expectations
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  finalPrice: number;
  hasDiscount: boolean;
  subscriptionType: string;
  lifetimeAccess: boolean;
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
  instructor: { _id: string; name: string; email: string };
  isPublished: boolean;
  timeLimit: number;
  questions: { question: string; options: string[]; correctAnswer: number }[];
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
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
  user: string;
  blog: {
    _id: string;
    title: string;
    content: string;
    topic: string;
    author?: { name: string };
    createdAt: string;
  };
  createdAt: string;
}

// ============ QUERIES ============

export function useCourses(orgId?: string) {
  return useQuery({
    queryKey: ['courses', orgId || 'public'],
    queryFn: async () => {
      const res = await fetch(`/api/courses?orgId=${orgId || 'public'}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      return data.courses || [];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useTeacherCourses(orgId?: string) {
  return useQuery({
    queryKey: ['courses', orgId || 'public', 'teacher'],
    queryFn: async () => {
      const res = await fetch(`/api/courses?orgId=${orgId || 'public'}&instructor=self`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch teacher courses');
      const data = await res.json();
      return data.courses || [];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useAvailableCourses(orgId?: string) {
  return useQuery({
    queryKey: ['courses', orgId || 'public', 'available'],
    queryFn: async () => {
      const res = await fetch(`/api/courses?orgId=${orgId || 'public'}&available=true`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch available courses');
      const data = await res.json();
      return data.courses || [];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useBlogs(orgId?: string, includeDrafts = false) {
  return useQuery({
    queryKey: ['blogs', orgId || 'public', includeDrafts],
    queryFn: async () => {
      const url = includeDrafts 
        ? `/api/blogs?includeDrafts=true&orgId=${orgId || 'public'}`
        : `/api/blogs?orgId=${orgId || 'public'}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch blogs');
      const data = await res.json();
      return data.blogs || [];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useQuizzes(orgId?: string) {
  return useQuery({
    queryKey: ['quizzes', orgId || 'public'],
    queryFn: async () => {
      const res = await fetch(`/api/quizzes?orgId=${orgId || 'public'}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to fetch quizzes');
      const data = await res.json();
      return data.quizzes || [];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function useEnrollments() {
  return useQuery({
    queryKey: QUERY_KEYS.ENROLLMENTS,
    queryFn: async () => {
      const res = await fetch('/api/enrollments', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch enrollments');
      const data = await res.json();
      return data.enrollments || [];
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
    queryFn: async () => {
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      return res.json();
    },
    staleTime: 60 * 1000, // 1 minute
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
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished }),
      });
      if (!res.ok) throw new Error('Failed to update course');
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate teacher courses cache
      const orgId = data.organizationId || 'public';
      queryClient.invalidateQueries({ queryKey: ['courses', orgId, 'teacher'] });
      queryClient.invalidateQueries({ queryKey: ['courses', orgId] });
    },
  });
}

export function useQuizAttempts() {
  return useQuery({
    queryKey: ['quizAttempts'],
    queryFn: async () => {
      const res = await fetch('/api/quiz-attempts', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch quiz attempts');
      const data = await res.json();
      return data.attempts || [];
    },
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      return data.favorites || [];
    },
  });
}

// ============ COURSE MUTATIONS ============

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete course');
      return res.json();
    },
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      const previousCourses = queryClient.getQueryData<Course[]>(['courses']);
      queryClient.setQueryData<Course[]>(['courses'], (old) =>
        (old || []).filter((c) => c._id !== courseId)
      );
      return { previousCourses };
    },
    onError: (err, courseId, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Course>) => {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create course');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, data }: { courseId: string; data: Partial<Course> }) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update course');
      return res.json();
    },
    onMutate: async ({ courseId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['courses'] });
      const previousCourses = queryClient.getQueryData<Course[]>(['courses']);
      queryClient.setQueryData<Course[]>(['courses'], (old) =>
        (old || []).map((c) => (c._id === courseId ? { ...c, ...data } : c))
      );
      return { previousCourses };
    },
    onError: (err, variables, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(['courses'], context.previousCourses);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

// ============ BLOG MUTATIONS ============

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete blog');
      return res.json();
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

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Blog>) => {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create blog');
      return res.json();
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
      const res = await fetch(`/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update blog');
      return res.json();
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
    mutationFn: async (enrollmentId: string) => {
      const res = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to drop enrollment');
      return res.json();
    },
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
    mutationFn: async (courseId: string) => {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Check if payment is required
        if (res.status === 402 && data.requiresPayment) {
          // Redirect to checkout for paid courses
          window.location.href = `/checkout?courseId=${courseId}`;
          throw new Error('Payment required');
        }
        throw new Error(data.message || 'Failed to enroll in course');
      }
      
      return data;
    },
    onSettled: () => {
      // Invalidate all related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      const res = await fetch(`/api/favorites/${blogId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove favorite');
      return res.json();
    },
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: ['favorites'] });
      const previousFavorites = queryClient.getQueryData<Favorite[]>(['favorites']);
      queryClient.setQueryData<Favorite[]>(['favorites'], (old) =>
        (old || []).filter((f) => f.blog._id !== blogId)
      );
      return { previousFavorites };
    },
    onError: (err, blogId, context) => {
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogId }),
      });
      if (!res.ok) throw new Error('Failed to add favorite');
      return res.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { quizId: string; action: string; answers: { questionIndex: number; selectedOption: number }[]; timeTaken?: number }) => {
      const res = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit quiz');
      return res.json();
    },
    onSettled: () => {
      // Invalidate all related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QUIZ_ATTEMPTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ENROLLMENTS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    },
  });
}

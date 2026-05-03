// src/store/useCachedStore.ts
// Enhanced Zustand store with caching, TTL, loading state, error handling, and org-based separation

import { create } from 'zustand';

export interface CacheItem<T> {
  data: T | null;
  lastFetched: number | null;
  loading: boolean;
  error: string | null;
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

interface CachedStoreState {
  // Blogs cache by orgId
  blogs: Record<string, CacheItem<Blog[]>>;
  
  // Courses cache by orgId
  courses: Record<string, CacheItem<Course[]>>;
  
  // Quizzes cache by orgId
  quizzes: Record<string, CacheItem<Quiz[]>>;
  
  // Enrollments cache by userId
  enrollments: Record<string, CacheItem<Enrollment[]>>;
  
  // Quiz attempts cache by userId
  quizAttempts: Record<string, CacheItem<QuizAttempt[]>>;
  
  // Cache time-to-live (5 minutes)
  CACHE_TIME: number;

  // Blogs actions
  fetchBlogs: (orgId?: string) => Promise<void>;
  invalidateBlogs: (orgId?: string) => void;
  
  // Courses actions
  fetchCourses: (orgId?: string) => Promise<void>;
  invalidateCourses: (orgId?: string) => void;
  
  // Quizzes actions
  fetchQuizzes: (orgId?: string) => Promise<void>;
  invalidateQuizzes: (orgId?: string) => void;
  
  // Enrollments actions
  fetchEnrollments: (userId?: string) => Promise<void>;
  invalidateEnrollments: (userId?: string) => void;
  
  // Quiz attempts actions
  fetchQuizAttempts: (userId?: string) => Promise<void>;
  invalidateQuizAttempts: (userId?: string) => void;
}

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

export const useCachedStore = create<CachedStoreState>((set, get) => ({
  // Initial state
  blogs: {},
  courses: {},
  quizzes: {},
  enrollments: {},
  quizAttempts: {},
  CACHE_TIME,

  // Blogs actions
  fetchBlogs: async (orgId = 'public') => {
    const state = get();
    const cache = state.blogs[orgId];
    const now = Date.now();

    // Prevent duplicate calls
    if (cache?.loading) return;

    // Use cache if fresh
    if (cache?.lastFetched && now - cache.lastFetched < CACHE_TIME) {
      return;
    }

    set({
      blogs: {
        ...state.blogs,
        [orgId]: { ...cache, loading: true, error: null },
      },
    });

    try {
      const res = await fetch(`/api/blogs?orgId=${orgId}`);
      const data = await res.json();

      set({
        blogs: {
          ...get().blogs,
          [orgId]: {
            data: data.blogs || [],
            lastFetched: now,
            loading: false,
            error: null,
          },
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch blogs';
      set({
        blogs: {
          ...get().blogs,
          [orgId]: {
            ...cache,
            loading: false,
            error: errorMessage,
          },
        },
      });
    }
  },

  invalidateBlogs: (orgId = 'public') => {
    const state = get();
    const updated = { ...state.blogs };
    delete updated[orgId];
    set({ blogs: updated });
  },

  // Courses actions
  fetchCourses: async (orgId = 'public') => {
    const state = get();
    const cache = state.courses[orgId];
    const now = Date.now();

    if (cache?.loading) return;

    if (cache?.lastFetched && now - cache.lastFetched < CACHE_TIME) {
      return;
    }

    set({
      courses: {
        ...state.courses,
        [orgId]: { ...cache, loading: true, error: null },
      },
    });

    try {
      const res = await fetch(`/api/courses?orgId=${orgId}`);
      const data = await res.json();

      set({
        courses: {
          ...get().courses,
          [orgId]: {
            data: data.courses || [],
            lastFetched: now,
            loading: false,
            error: null,
          },
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch courses';
      set({
        courses: {
          ...get().courses,
          [orgId]: {
            ...cache,
            loading: false,
            error: errorMessage,
          },
        },
      });
    }
  },

  invalidateCourses: (orgId = 'public') => {
    const state = get();
    const updated = { ...state.courses };
    delete updated[orgId];
    set({ courses: updated });
  },

  // Quizzes actions
  fetchQuizzes: async (orgId = 'public') => {
    const state = get();
    const cache = state.quizzes[orgId];
    const now = Date.now();

    if (cache?.loading) return;

    if (cache?.lastFetched && now - cache.lastFetched < CACHE_TIME) {
      return;
    }

    set({
      quizzes: {
        ...state.quizzes,
        [orgId]: { ...cache, loading: true, error: null },
      },
    });

    try {
      const res = await fetch(`/api/quizzes?orgId=${orgId}`);
      const data = await res.json();

      set({
        quizzes: {
          ...get().quizzes,
          [orgId]: {
            data: data.quizzes || [],
            lastFetched: now,
            loading: false,
            error: null,
          },
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quizzes';
      set({
        quizzes: {
          ...get().quizzes,
          [orgId]: {
            ...cache,
            loading: false,
            error: errorMessage,
          },
        },
      });
    }
  },

  invalidateQuizzes: (orgId = 'public') => {
    const state = get();
    const updated = { ...state.quizzes };
    delete updated[orgId];
    set({ quizzes: updated });
  },

  // Enrollments actions
  fetchEnrollments: async (userId?: string) => {
    if (!userId) return;
    
    const state = get();
    const cache = state.enrollments[userId];
    const now = Date.now();

    if (cache?.loading) return;

    if (cache?.lastFetched && now - cache.lastFetched < CACHE_TIME) {
      return;
    }

    set({
      enrollments: {
        ...state.enrollments,
        [userId]: { ...cache, loading: true, error: null },
      },
    });

    try {
      const res = await fetch('/api/enrollments');
      const data = await res.json();

      set({
        enrollments: {
          ...get().enrollments,
          [userId]: {
            data: data.enrollments || [],
            lastFetched: now,
            loading: false,
            error: null,
          },
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      set({
        enrollments: {
          ...get().enrollments,
          [userId]: {
            ...cache,
            loading: false,
            error: errorMessage,
          },
        },
      });
    }
  },

  invalidateEnrollments: (userId?: string) => {
    if (!userId) return;
    const state = get();
    const updated = { ...state.enrollments };
    delete updated[userId];
    set({ enrollments: updated });
  },

  // Quiz attempts actions
  fetchQuizAttempts: async (userId?: string) => {
    if (!userId) return;
    
    const state = get();
    const cache = state.quizAttempts[userId];
    const now = Date.now();

    if (cache?.loading) return;

    if (cache?.lastFetched && now - cache.lastFetched < CACHE_TIME) {
      return;
    }

    set({
      quizAttempts: {
        ...state.quizAttempts,
        [userId]: { ...cache, loading: true, error: null },
      },
    });

    try {
      const res = await fetch('/api/quiz-attempts');
      const data = await res.json();

      set({
        quizAttempts: {
          ...get().quizAttempts,
          [userId]: {
            data: data.attempts || [],
            lastFetched: now,
            loading: false,
            error: null,
          },
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quiz attempts';
      set({
        quizAttempts: {
          ...get().quizAttempts,
          [userId]: {
            ...cache,
            loading: false,
            error: errorMessage,
          },
        },
      });
    }
  },

  invalidateQuizAttempts: (userId?: string) => {
    if (!userId) return;
    const state = get();
    const updated = { ...state.quizAttempts };
    delete updated[userId];
    set({ quizAttempts: updated });
  },
}));

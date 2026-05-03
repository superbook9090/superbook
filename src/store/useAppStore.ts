// src/store/useAppStore.ts
// Global client state management using Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
}

interface FeatureToggles {
  enableBlogs: boolean;
  enableQuizzes: boolean;
  enableCourses: boolean;
  enableAnalytics: boolean;
}

interface PlatformConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultLanguage: 'en' | 'hi';
}

interface Settings {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  featureToggles: FeatureToggles;
  platformConfig: PlatformConfig;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: { _id: string; name: string; email: string };
  isPublished: boolean;
  enrolledCount?: number;
  createdAt: string;
}

interface Blog {
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

interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  instructor: { _id: string; name: string; email: string };
  isPublished: boolean;
  timeLimit: number;
  questions: unknown[];
  createdAt: string;
}

interface Enrollment {
  _id: string;
  course: { _id: string; title: string };
  progress: number;
  status: string;
  enrolledAt: string;
  completedAt?: string;
}

interface QuizAttempt {
  _id: string;
  quiz: { title: string };
  score: number;
  status: string;
  submittedAt?: string;
  startedAt: string;
  timeTaken: number;
}

interface AppStoreState {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;

  // Settings state
  settings: Settings | null;
  setSettings: (settings: Settings | null) => void;
  invalidateSettings: () => void;

  // Courses state
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;

  // Blogs state
  blogs: Blog[];
  setBlogs: (blogs: Blog[]) => void;
  addBlog: (blog: Blog) => void;
  updateBlog: (id: string, updates: Partial<Blog>) => void;
  removeBlog: (id: string) => void;

  // Quizzes state
  quizzes: Quiz[];
  setQuizzes: (quizzes: Quiz[]) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  removeQuiz: (id: string) => void;

  // Enrollments state
  enrollments: Enrollment[];
  setEnrollments: (enrollments: Enrollment[]) => void;
  addEnrollment: (enrollment: Enrollment) => void;
  updateEnrollment: (id: string, updates: Partial<Enrollment>) => void;

  // Quiz attempts state
  quizAttempts: QuizAttempt[];
  setQuizAttempts: (attempts: QuizAttempt[]) => void;
  addQuizAttempt: (attempt: QuizAttempt) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;

  // Clear all data
  clearAll: () => void;
}

export const useAppStore = create<AppStoreState>()(
  persist(
    (set) => ({
      // User state
      user: null,
      setUser: (user) => set({ user }),

      // Settings state
      settings: null,
      setSettings: (settings) => set({ settings }),
      invalidateSettings: () => set({ settings: null }),

      // Courses state
      courses: [],
      setCourses: (courses) => set({ courses }),
      addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
      updateCourse: (id, updates) =>
        set((state) => ({
          courses: state.courses.map((c) => (c._id === id ? { ...c, ...updates } : c)),
        })),
      removeCourse: (id) =>
        set((state) => ({ courses: state.courses.filter((c) => c._id !== id) })),

      // Blogs state
      blogs: [],
      setBlogs: (blogs) => set({ blogs }),
      addBlog: (blog) => set((state) => ({ blogs: [...state.blogs, blog] })),
      updateBlog: (id, updates) =>
        set((state) => ({
          blogs: state.blogs.map((b) => (b._id === id ? { ...b, ...updates } : b)),
        })),
      removeBlog: (id) =>
        set((state) => ({ blogs: state.blogs.filter((b) => b._id !== id) })),

      // Quizzes state
      quizzes: [],
      setQuizzes: (quizzes) => set({ quizzes }),
      addQuiz: (quiz) => set((state) => ({ quizzes: [...state.quizzes, quiz] })),
      updateQuiz: (id, updates) =>
        set((state) => ({
          quizzes: state.quizzes.map((q) => (q._id === id ? { ...q, ...updates } : q)),
        })),
      removeQuiz: (id) =>
        set((state) => ({ quizzes: state.quizzes.filter((q) => q._id !== id) })),

      // Enrollments state
      enrollments: [],
      setEnrollments: (enrollments) => set({ enrollments }),
      addEnrollment: (enrollment) => set((state) => ({ enrollments: [...state.enrollments, enrollment] })),
      updateEnrollment: (id, updates) =>
        set((state) => ({
          enrollments: state.enrollments.map((e) => (e._id === id ? { ...e, ...updates } : e)),
        })),

      // Quiz attempts state
      quizAttempts: [],
      setQuizAttempts: (attempts) => set({ quizAttempts: attempts }),
      addQuizAttempt: (attempt) => set((state) => ({ quizAttempts: [...state.quizAttempts, attempt] })),

      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error state
      error: null,
      setError: (error) => set({ error }),

      // Clear all data
      clearAll: () =>
        set({
          user: null,
          settings: null,
          courses: [],
          blogs: [],
          quizzes: [],
          enrollments: [],
          quizAttempts: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'app-storage',
      // Only persist user and settings, not the large data arrays
      partialize: (state) => ({
        user: state.user,
        settings: state.settings,
      }),
    }
  )
);

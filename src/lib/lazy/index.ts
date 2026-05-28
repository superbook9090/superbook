'use client';

/**
 * Central lazy-loaded modules — import from here instead of heavy feature paths
 * to keep initial JS bundles small and improve Core Web Vitals.
 */

import {
  loadable,
  loadableClient,
  loadableNamed,
  chartSkeleton,
  sidebarSkeleton,
} from '@/lib/lazy/loadable';

// ——— Public / marketing ———
export const LazyContactPage = loadable(
  () => import('@/features/contact/components/ContactPageClient')
);
export const LazyPrivacyPage = loadable(
  () => import('@/features/privacy/components/PrivacyPageClient')
);

// ——— Auth ———
export const LazyLoginForm = loadableClient(
  () => import('@/features/auth/components/LoginForm'),
  'full'
);
export const LazyRegisterForm = loadableClient(
  () => import('@/features/auth/components/RegisterForm'),
  'full'
);
export const LazyForgotPasswordForm = loadableClient(
  () => import('@/features/auth/components/ForgotPasswordForm'),
  'full'
);
export const LazyResetPasswordForm = loadableClient(
  () => import('@/features/auth/components/ResetPasswordForm'),
  'full'
);

// ——— Dashboard chrome ———
export const LazyStudentSidebar = loadable(
  () => import('@/features/dashboard/components/StudentSidebar'),
  { skeleton: sidebarSkeleton() }
);
export const LazyTeacherSidebar = loadable(
  () => import('@/features/dashboard/components/TeacherSidebar'),
  { skeleton: sidebarSkeleton() }
);
export const LazyMobileNav = loadable(
  () => import('@/features/dashboard/components/MobileNav'),
  { skeleton: 'none' }
);
export const LazyMobileBottomNav = loadable(
  () => import('@/features/dashboard/components/MobileBottomNav'),
  { skeleton: 'none' }
);
export const LazyDashboardHeader = loadable(
  () => import('@/features/dashboard/components/DashboardHeader'),
  { skeleton: 'none' }
);
export const LazyPushNotificationManager = loadableClient(
  () => import('@/components/providers/PushNotificationManager'),
  'none'
);

// ——— Dashboard features ———
export const LazyProfile = loadable(
  () => import('@/features/dashboard/components/Profile')
);
export const LazyQuizzesHub = loadable(
  () => import('@/features/dashboard/components/Quizzes')
);

// ——— Courses ———
export const LazyCreateCoursePageContent = loadable(
  () => import('@/features/courses/components/CreateCoursePageContent')
);
export const LazyEditCoursePageContent = loadable(
  () => import('@/features/courses/components/EditCoursePageContent')
);
export const LazyCreateCourseForm = loadableClient(
  () => import('@/features/courses/components/CreateCourseForm'),
  'embed'
);
export const LazyCurriculumEditor = loadableClient(
  () => import('@/features/courses/components/CurriculumEditor'),
  'embed'
);
export const LazyCourseCard = loadable(
  () => import('@/features/courses/components/CourseCard'),
  { skeleton: 'none' }
);
export const LazyCourseFilters = loadable(
  () => import('@/features/courses/components/CourseFilters'),
  { skeleton: 'none' }
);
export const LazyJoinCourseByCode = loadable(
  () => import('@/features/courses/components/JoinCourseByCode'),
  { skeleton: 'none' }
);
export const LazyCourseLeaderboard = loadableClient(
  () => import('@/features/courses/components/CourseLeaderboard'),
  'embed'
);

// ——— Quizzes ———
export const LazyCreateQuizPageContent = loadable(
  () => import('@/features/quizzes/components/CreateQuizPageContent')
);
export const LazyCreateQuizForm = loadableClient(
  () => import('@/features/quizzes/components/CreateQuizForm'),
  'embed'
);
export const LazyQuizCard = loadable(
  () => import('@/features/quizzes/components/QuizCard'),
  { skeleton: 'none' }
);
export const LazyQuizLeaderboard = loadableClient(
  () => import('@/features/quizzes/components/QuizLeaderboard'),
  'embed'
);
export const LazyCurriculumQuizRow = loadable(
  () => import('@/features/quizzes/components/CurriculumQuizRow'),
  { skeleton: 'none' }
);
export const LazyQuizQuestionProgress = loadableNamed(
  () => import('@/features/quizzes/components/QuizQuestionProgress'),
  'QuizQuestionProgress',
  { skeleton: 'embed' }
);
export const LazyQuizResultOverview = loadableNamed(
  () => import('@/features/quizzes/components/QuizResultOverview'),
  'QuizResultOverview'
);
export const LazyQuizComparisonTable = loadableNamed(
  () => import('@/features/quizzes/components/QuizComparisonTable'),
  'QuizComparisonTable',
  { skeleton: 'embed' }
);
export const LazyQuizRankPredictor = loadableNamed(
  () => import('@/features/quizzes/components/QuizRankPredictor'),
  'QuizRankPredictor',
  { skeleton: 'none' }
);
export const LazyQuizStartConfirmModal = loadableNamed(
  () => import('@/features/quizzes/components/QuizStartConfirmModal'),
  'QuizStartConfirmModal',
  { skeleton: 'none' }
);

// ——— Blogs ———
export const LazyBlogEditorForm = loadableClient(
  () => import('@/features/blogs/components/BlogEditorForm'),
  'embed'
);
export const LazyBlogFilters = loadable(
  () => import('@/features/blogs/components/BlogFilters'),
  { skeleton: 'none' }
);

// ——— Files & media ———
export const LazyFileExplorer = loadableClient(
  () => import('@/features/files/components/FileExplorer'),
  'content'
);
export const LazySecurePlayer = loadableClient(
  () => import('@/components/video/SecurePlayer'),
  'embed'
);
export const LazyRichTextEditor = loadableClient(
  () => import('@/components/ui/RichTextEditor'),
  'embed'
);

// ——— Charts ———
export const LazyScoreTrendChart = loadableClient(
  () => import('@/components/charts/ScoreTrendChart'),
  chartSkeleton()
);
export const LazyCourseProgressChart = loadableClient(
  () => import('@/components/charts/CourseProgressChart'),
  chartSkeleton()
);
export const LazyQuizStatusChart = loadableClient(
  () => import('@/components/charts/QuizStatusChart'),
  chartSkeleton()
);
export const LazyAverageScoreChart = loadableClient(
  () => import('@/components/charts/AverageScoreChart'),
  chartSkeleton()
);

// ——— Modals (framer-motion) ———
export const LazyConfirmModal = loadable(
  () => import('@/components/ui/ConfirmModal'),
  { skeleton: 'none' }
);

// src/app/(dashboard)/dashboard/teacher/page.tsx
'use client';

import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useDashboard,
  isTeacherDashboard,
} from '@/lib/react-query/hooks';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageWrapper } from '@/components/layout';
import TeacherHero from './_components/TeacherHero';
import TeacherStats from './_components/TeacherStats';
import TeacherCoursesList from './_components/TeacherCoursesList';
import TeacherQuotas from './_components/TeacherQuotas';
import TeacherQuickActions from './_components/TeacherQuickActions';
import type {
  TeacherCourse,
  TeacherQuiz,
  TeacherBlog,
  TeacherStatsData,
  TeacherLimitsData,
} from './_components/types';

export default function TeacherDashboardPage() {
  const session = useSessionStore((s) => s.session) as {
    user?: { id: string; role: string; name: string };
  };
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const { data, isLoading, error } = useDashboard();
  const dashboardData = data && isTeacherDashboard(data) ? data : null;

  const courses: TeacherCourse[] = dashboardData?.courses || [];
  const allQuizzes: TeacherQuiz[] = dashboardData?.quizzes || [];
  const allBlogs: TeacherBlog[] = dashboardData?.blogs || [];
  const stats: TeacherStatsData = dashboardData?.stats || {
    totalCourses: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalBlogs: 0,
    publishedCourses: 0,
  };
  const limits: TeacherLimitsData = dashboardData?.limits || {
    courses: 5,
    quizzes: 10,
    blogs: 10,
    userLimits: {},
  };

  // Filter quizzes for this teacher's courses
  const courseIds = new Set(courses.map((c) => c._id.toString()));
  const teacherQuizzes = allQuizzes.filter((q) => {
    const quizCourseId =
      typeof q.course === 'object' && q.course !== null
        ? (q.course as { _id?: string })._id?.toString()
        : q.course?.toString();
    return quizCourseId && courseIds.has(quizCourseId);
  });

  // Filter blogs authored by this teacher
  const teacherBlogs = allBlogs.filter((b) => b.author?._id === session?.user?.id);

  const filteredStats: TeacherStatsData = {
    ...stats,
    totalQuizzes: teacherQuizzes.length,
    totalBlogs: teacherBlogs.length,
  };

  const getLimit = (type: 'courses' | 'quizzes' | 'blogs'): number => {
    const userLimit = limits.userLimits?.[type];
    if (typeof userLimit === 'number' && userLimit >= 1) return userLimit;
    return limits[type];
  };

  const courseLimit = getLimit('courses');
  const quizLimit = getLimit('quizzes');
  const blogLimit = getLimit('blogs');

  const isAtCourseLimit = filteredStats.totalCourses >= courseLimit;
  const isAtBlogLimit = filteredStats.totalBlogs >= blogLimit;

  const handleLimitReached = (type: 'courses' | 'blogs', limit: number) => {
    addAlert({
      type: 'error',
      message: t('dashboard.limitReached')
        .replace('{type}', type)
        .replace('{limit}', String(limit)),
    });
  };

  if (error) {
    return (
      <PageWrapper>
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20">
          {error.message || t('errors.failedLoadDashboardData')}
        </div>
      </PageWrapper>
    );
  }

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper className="space-y-6">
      <TeacherHero
        userName={session?.user?.name}
        isAtCourseLimit={isAtCourseLimit}
        isAtBlogLimit={isAtBlogLimit}
        courseLimit={courseLimit}
        blogLimit={blogLimit}
        onLimitReached={handleLimitReached}
      />

      <TeacherStats
        stats={filteredStats}
        courseLimit={courseLimit}
        quizLimit={quizLimit}
        blogLimit={blogLimit}
      />

      <TeacherCoursesList courses={courses} />

      <TeacherQuotas
        stats={filteredStats}
        courseLimit={courseLimit}
        quizLimit={quizLimit}
        blogLimit={blogLimit}
      />

      <TeacherQuickActions
        isAtCourseLimit={isAtCourseLimit}
        isAtBlogLimit={isAtBlogLimit}
      />
    </PageWrapper>
  );
}

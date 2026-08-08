// src/app/(dashboard)/dashboard/teacher/analytics/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { fetchAnalytics } from '@/lib/api/analytics';
import { getApiErrorMessage } from '@/lib/api/http';
import StatCard from '@/components/ui/StatCard';
import { PageWrapper } from '@/components/layout';
import { BookOpen, Radio, Users, HelpCircle, ClipboardList } from 'lucide-react';

interface CourseStat {
  _id: string;
  title: string;
  students: number;
  quizzes: number;
  attempts: number;
  averageScore: number;
  isPublished: boolean;
}

interface TopStudent {
  name: string;
  averageScore: number;
  attempts: number;
}

interface TeacherStats {
  courses: CourseStat[];
  overview: {
    totalCourses: number;
    totalStudents: number;
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    publishedCourses: number;
  };
  topStudents: TopStudent[];
}

/** Traffic-light chip for score values — shared by both sections. */
function scoreChipClass(score: number): string {
  if (score >= 70) return 'bg-[var(--success-light)] text-[var(--success)]';
  if (score >= 50) return 'bg-[var(--warning-light)] text-[var(--warning)]';
  return 'bg-[var(--error-light)] text-[var(--error)]';
}

function ScoreChip({ score }: { score: number }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tabular-nums ${scoreChipClass(score)}`}>
      {score}%
    </span>
  );
}

function VisibilityChip({ isPublished, liveLabel, draftLabel }: { isPublished: boolean; liveLabel: string; draftLabel: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isPublished
        ? 'bg-[var(--success-light)] text-[var(--success)]'
        : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
    }`}>
      {isPublished ? liveLabel : draftLabel}
    </span>
  );
}

/** Presentational body for the page. */
function AnalyticsView({ stats }: { stats: TeacherStats }) {
  const { t } = useTranslation();

  const courseCells: Array<{ key: keyof CourseStat; label: string }> = [
    { key: 'students', label: t('teacherAnalytics.tableEnrolled') },
    { key: 'quizzes', label: t('teacherAnalytics.tableQuizzes') },
    { key: 'attempts', label: t('teacherAnalytics.tableAttempts') },
  ];

  return (
    <PageWrapper>
      {/* Header — the page's one summary number lives here */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="min-w-0">
            <h1 className="heading-xl mb-2">{t('teacherAnalytics.title')}</h1>
            <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base max-w-xl">
              {t('teacherAnalytics.description')}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[var(--card-solid)] p-4 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] sm:min-w-[180px]">
            <div className="text-right flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-muted)]">
                {t('teacherAnalytics.statAvgScore')}
              </p>
              <p className="gradient-text text-3xl font-bold leading-none mt-1 tabular-nums font-[family-name:var(--font-display)]">
                {stats.overview?.averageScore}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Stats — role color for inventory, green for what's live */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[var(--card-gap)]">
        <StatCard
          icon={BookOpen}
          value={stats.overview?.totalCourses}
          label={t('teacherAnalytics.statCourses')}
          color="teacher"
          delay={0.1}
        />
        <StatCard
          icon={Radio}
          value={stats.overview?.publishedCourses}
          label={t('teacherAnalytics.statLiveCourses')}
          color="success"
          delay={0.15}
        />
        <StatCard
          icon={Users}
          value={stats.overview?.totalStudents}
          label={t('teacherAnalytics.statEnrolledStudents')}
          color="teacher"
          delay={0.2}
        />
        <StatCard
          icon={HelpCircle}
          value={stats.overview?.totalQuizzes}
          label={t('teacherAnalytics.statQuizzes')}
          color="teacher"
          delay={0.25}
        />
        <StatCard
          icon={ClipboardList}
          value={stats.overview?.totalAttempts}
          label={t('teacherAnalytics.statQuizAttempts')}
          color="teacher"
          delay={0.3}
        />
      </div>

      {/* Course Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card-panel"
      >
        <div className="card-panel-header">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{t('teacherAnalytics.coursesTitle')}</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('teacherAnalytics.coursesDescription')}</p>
        </div>

        {stats.courses?.length === 0 ? (
          <div className="card-panel-body text-center py-[var(--space-10)]">
            <p className="text-[var(--color-muted-foreground)] mb-4">{t('teacherAnalytics.noCoursesYet')}</p>
            <Link href={ROUTES.teacher.courseCreate} className="btn-premium focus-ring w-full sm:w-auto">
              {t('teacherAnalytics.createCourse')}
            </Link>
          </div>
        ) : (
          <>
            {/* md+: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--border)]">
                <thead className="bg-[var(--color-surface-muted)]">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('teacherAnalytics.tableCourse')}
                    </th>
                    {courseCells.map((cell) => (
                      <th key={cell.key} className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                        {cell.label}
                      </th>
                    ))}
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('teacherAnalytics.tableAvgScore')}
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider">
                      {t('teacherAnalytics.tableVisibility')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {stats.courses?.map((course) => (
                    <tr key={course._id} className="hover:bg-[var(--color-surface-muted)] transition-colors">
                      <td className="px-4 lg:px-6 py-4 max-w-[16rem] lg:max-w-xs">
                        <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{course.title}</p>
                      </td>
                      {courseCells.map((cell) => (
                        <td key={cell.key} className="px-4 lg:px-6 py-4 text-center">
                          <p className="text-sm text-[var(--color-foreground)] tabular-nums">{course[cell.key]}</p>
                        </td>
                      ))}
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <ScoreChip score={course.averageScore} />
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <VisibilityChip
                          isPublished={course.isPublished}
                          liveLabel={t('teacherAnalytics.live')}
                          draftLabel={t('teacherAnalytics.draft')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* mobile: stacked rows */}
            <ul className="md:hidden divide-y divide-[var(--border)]">
              {stats.courses?.map((course) => (
                <li key={course._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[var(--color-foreground)] min-w-0 break-words">{course.title}</p>
                    <VisibilityChip
                      isPublished={course.isPublished}
                      liveLabel={t('teacherAnalytics.live')}
                      draftLabel={t('teacherAnalytics.draft')}
                    />
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    <div className="flex gap-4">
                      {courseCells.map((cell) => (
                        <div key={cell.key}>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">{cell.label}</p>
                          <p className="text-sm font-semibold text-[var(--color-foreground)] tabular-nums mt-0.5">{course[cell.key]}</p>
                        </div>
                      ))}
                    </div>
                    <ScoreChip score={course.averageScore} />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.div>

      {/* Top Students — rank list, no table needed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-panel"
      >
        <div className="card-panel-header">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">{t('teacherAnalytics.studentsTitle')}</h2>
          <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{t('teacherAnalytics.studentsDescription')}</p>
        </div>

        {stats.topStudents?.length === 0 ? (
          <div className="card-panel-body text-center py-[var(--space-10)]">
            <p className="text-[var(--color-muted-foreground)]">{t('teacherAnalytics.noQuizAttempts')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--border)]">
            {stats.topStudents?.map((student, index) => (
              <li key={index} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
                <span
                  className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center font-semibold text-sm tabular-nums ${
                    index < 3
                      ? 'gradient-bg text-white shadow-[var(--shadow-sm)]'
                      : 'bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{student.name}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] tabular-nums">
                    {student.attempts} {t('teacherAnalytics.tableStudentAttempts').toLowerCase()}
                  </p>
                </div>
                <ScoreChip score={student.averageScore} />
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </PageWrapper>
  );
}

export default function TeacherAnalyticsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const data = (await fetchAnalytics('teacher')) as { stats?: TeacherStats };
      setStats(data.stats || null);
    } catch (err) {
      setError(getApiErrorMessage(err, t('teacherAnalytics.errorLoading')));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    // Role-based redirect handled in /dashboard/page.tsx - no redirect here

    fetchStats();
  }, [session, status, router, fetchStats]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  if (!stats) {
    return (
      <div className="card-panel text-center py-10 px-4">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}
        <button onClick={fetchStats} className="btn-premium focus-ring mt-4">
          {t('teacherAnalytics.retry')}
        </button>
      </div>
    );
  }

  return <AnalyticsView stats={stats} />;
}

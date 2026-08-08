// src/app/(dashboard)/dashboard/student/progress/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Circle } from 'lucide-react';
import {
  LazyAverageScoreChart,
  LazyCourseProgressChart,
  LazyQuizStatusChart,
  LazyScoreTrendChart,
} from '@/lib/lazy';
import { fetchStudentProgress } from '@/lib/api/progress';
import { ApiClientError } from '@/lib/api/http';
import { PageWrapper, PageHeader, ResponsiveGrid } from '@/components/layout';

interface CourseProgress {
  enrollment: {
    _id: string;
    progress: number;
    status: string;
    enrolledAt: string;
    completedAt?: string;
  };
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
  };
  quizStats: {
    total: number;
    completed: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  attempts: {
    _id: string;
    quizTitle: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    submittedAt: string;
    attemptNumber: number;
  }[];
}

interface OverallStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalQuizzesTaken: number;
  overallAverageScore: number;
}

export default function StudentProgressPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    fetchProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchProgress = async () => {
    try {
      const data = (await fetchStudentProgress()) as {
        progress?: CourseProgress[];
        overallStats?: OverallStats;
      };
      setProgressData(data.progress || []);
      setOverallStats(data.overallStats || null);
    } catch (err) {
      const errorMsg =
        err instanceof ApiClientError ? err.message : t('progress.errorLoadingProgress');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Process data for charts
  const scoreTrendData = useMemo(() => {
    if (!progressData.length) return [];
    
    const allAttempts = progressData.flatMap(course => course.attempts || []);
    return allAttempts.filter(Boolean).map(attempt => ({
      date: attempt.submittedAt,
      score: attempt.score,
      quizTitle: attempt.quizTitle
    }));
  }, [progressData]);

  const courseProgressData = useMemo(() => {
    if (!progressData.length) return [];
    
    return progressData.map(course => ({
      courseTitle: course.course.title,
      progress: course.enrollment.progress,
      status: (course.enrollment.status === 'completed' ? 'completed' : 
              course.enrollment.status === 'active' ? 'active' : 'inactive') as 'completed' | 'active' | 'inactive'
    }));
  }, [progressData]);

  const quizStatusData = useMemo(() => {
    if (!progressData.length) return [];
    
    const totalQuizzes = progressData.reduce((sum, course) => sum + course.quizStats.total, 0);
    const completedQuizzes = progressData.reduce((sum, course) => sum + course.quizStats.completed, 0);
    const inProgressQuizzes = progressData.reduce((sum, course) => {
      return sum + (course.quizStats.total - course.quizStats.completed);
    }, 0);

    return [
      { 
        name: 'completed', 
        value: completedQuizzes,
        color: 'var(--success)',
        icon: <CheckCircle className="w-4 h-4" />
      },
      { 
        name: 'inProgress', 
        value: inProgressQuizzes,
        color: 'var(--warning)',
        icon: <Clock className="w-4 h-4" />
      },
      { 
        name: 'notStarted', 
        value: Math.max(0, totalQuizzes - completedQuizzes - inProgressQuizzes),
        color: 'var(--color-muted-foreground)',
        icon: <Circle className="w-4 h-4" />
      }
    ];
  }, [progressData]);

  const averageScoreData = useMemo(() => {
    if (!progressData.length) return [];
    
    const allAttempts = progressData.flatMap(course => course.attempts || []).filter(Boolean);
    const groupedByDate = allAttempts.reduce((acc, attempt) => {
      const date = new Date(attempt.submittedAt).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(attempt.score);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(groupedByDate)
      .map(([date, scores]) => {
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
          date,
          averageScore: average,
          movingAverage: average, // Simplified - could be enhanced with actual moving average
          attemptCount: scores.length
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [progressData]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <PageHeader
        title={t('progress.myProgress')}
        description={t('progress.progressDesc')}
      />

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
          className="relative top-0 right-0 left-0 translate-x-0 w-full mt-4 z-10"
        />
      )}

      {/* Overall Stats */}
      {overallStats && (
        <ResponsiveGrid variant="statsWide">
          <div className="stat-tile">
            <p className="text-2xl font-bold text-[var(--student-primary)]">{overallStats.totalCourses}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.coursesEnrolled')}</p>
          </div>
          <div className="stat-tile">
            <p className="text-2xl font-bold text-[var(--success)]">{overallStats.completedCourses}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.completed')}</p>
          </div>
          <div className="stat-tile">
            <p className="text-2xl font-bold text-[var(--warning)]">{overallStats.inProgressCourses}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.inProgress')}</p>
          </div>
          <div className="stat-tile">
            <p className="text-2xl font-bold text-[var(--student-primary)]">{overallStats.averageProgress}%</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.avgProgress')}</p>
          </div>
          <div className="stat-tile">
            <p className="text-2xl font-bold text-[var(--info)]">{overallStats.totalQuizzesTaken}</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.quizzesTaken')}</p>
          </div>
          <div className="stat-tile">
            <p className="text-2xl font-bold text-[var(--student-accent)]">{overallStats.overallAverageScore}%</p>
            <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.avgQuizScore')}</p>
          </div>
        </ResponsiveGrid>
      )}

      {/* Charts Section */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-6">{t('progress.insights')}</h2>
        
        <ResponsiveGrid variant="charts">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <LazyScoreTrendChart data={scoreTrendData} title={t('progress.scoreTrend')} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <LazyCourseProgressChart data={courseProgressData} title={t('progress.courseProgress')} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <LazyQuizStatusChart data={quizStatusData} title={t('progress.quizDistribution')} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <LazyAverageScoreChart data={averageScoreData} title={t('progress.averageScore')} />
          </motion.div>
        </ResponsiveGrid>
      </section>

      {/* Course Progress */}
      <section>
        <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] mb-4">{t('progress.courseProgress')}</h2>

        {progressData.length === 0 ? (
          <div className="card-surface card-body text-center">
            <p className="text-[var(--color-muted-foreground)] mb-4">{t('progress.noProgressData')}</p>
            <Link
              href={ROUTES.student.browse}
              className={`btn-action text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
            >
              {t('progress.browseCourses')}
            </Link>
          </div>
        ) : (
          <div className="card-list">
            {progressData.map((item) => (
              <div
                key={item.enrollment._id}
                className="card-surface overflow-hidden"
              >
                {/* Course Header */}
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {item.course.thumbnail ? (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={item.course.thumbnail}
                            alt={item.course.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] flex items-center justify-center">
                          <span className="text-white text-2xl">📚</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{item.course.title}</h3>
                        <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{item.course.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.enrollment.status === 'completed'
                              ? 'bg-[var(--success-light)] text-[var(--success)]'
                              : item.enrollment.status === 'active'
                              ? 'bg-[var(--info-light)] text-[var(--info)]'
                              : 'bg-[var(--error-light)] text-[var(--error)]'
                          }`}>
                            {item.enrollment.status.charAt(0).toUpperCase() + item.enrollment.status.slice(1)}
                          </span>
                          <span className="text-[var(--color-muted-foreground)]">
                            {t('progress.enrolled')}: {formatDate(item.enrollment.enrolledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-[var(--student-primary)]">{item.enrollment.progress}%</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.complete')}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          item.enrollment.progress >= 100
                            ? 'bg-[var(--success)]'
                            : item.enrollment.progress >= 50
                            ? `bg-gradient-to-r ${theme.gradient}`
                            : 'bg-[var(--warning)]'
                        }`}
                        style={{ width: `${item.enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quiz Stats */}
                  <div className="mt-4 grid grid-cols-4 gap-4 bg-[var(--color-surface-muted)] rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-[var(--color-foreground)]">{item.quizStats.total}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.totalQuizzes')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-[var(--color-foreground)]">{item.quizStats.completed}</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.completed')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-[var(--color-foreground)]">{item.quizStats.averageScore}%</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.avgScore')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-[var(--color-foreground)]">{item.quizStats.highestScore}%</p>
                      <p className="text-xs text-[var(--color-muted-foreground)]">{t('progress.bestScore')}</p>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setSelectedCourse(
                      selectedCourse === item.enrollment._id ? null : item.enrollment._id
                    )}
                    className="mt-4 min-h-[44px] sm:min-h-0 text-[var(--student-primary)] hover:text-[var(--student-primary)]/80 text-sm font-medium"
                  >
                    {selectedCourse === item.enrollment._id ? t('progress.hideDetails') : t('progress.viewQuizHistory')}
                  </button>
                </div>

                {/* Quiz History */}
                {selectedCourse === item.enrollment._id && item.attempts?.length > 0 && (
                  <div className="border-t border-[var(--border)] bg-[var(--color-surface-muted)] px-6 py-4">
                    <h4 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">{t('progress.quizAttempts')}</h4>
                    <div className="space-y-2">
                      {item.attempts?.map((attempt) => (
                        <div
                          key={attempt._id}
                          className="bg-[var(--card-solid)] rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-[var(--color-foreground)]">{attempt.quizTitle}</p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">
                              {t('progress.attempt')} #{attempt.attemptNumber} • {formatTime(attempt.timeTaken)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              attempt.score >= 70 ? 'text-[var(--success)]' : attempt.score >= 50 ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                            }`}>
                              {attempt.score}%
                            </p>
                            <p className="text-xs text-[var(--color-muted-foreground)]">
                              {attempt.correctCount}/{attempt.totalQuestions} {t('progress.correct')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </PageWrapper>
  );
}

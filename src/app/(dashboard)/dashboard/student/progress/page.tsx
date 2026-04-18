// src/app/(dashboard)/dashboard/student/progress/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import Alert from '@/components/ui/Alert';

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
  const { data: session, status } = useSession();
  const { t } = useTranslation();
  const router = useRouter();
  const [progressData, setProgressData] = useState<CourseProgress[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    fetchProgress();
  }, [session, status, router]);

  const fetchProgress = async () => {
    try {
      const response = await fetch('/api/progress');
      const data = await response.json();

      if (response.ok) {
        setProgressData(data.progress || []);
        setOverallStats(data.overallStats || null);
      } else {
        const errorMsg = data.message || t('progress.failedLoadProgress');
        setError(errorMsg);
        setAlertState({ type: 'error', message: errorMsg });
      }
    } catch (err) {
      const errorMsg = t('progress.errorLoadingProgress');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">{t('progress.loadingProgress')}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">{t('progress.myProgress')}</h1>
      <p className="mt-2 text-gray-600">
        {t('progress.progressDesc')}
      </p>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Overall Stats */}
      {overallStats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{overallStats.totalCourses}</p>
            <p className="text-sm text-gray-600">{t('progress.coursesEnrolled')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{overallStats.completedCourses}</p>
            <p className="text-sm text-gray-600">{t('progress.completed')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{overallStats.inProgressCourses}</p>
            <p className="text-sm text-gray-600">{t('progress.inProgress')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{overallStats.averageProgress}%</p>
            <p className="text-sm text-gray-600">{t('progress.avgProgress')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{overallStats.totalQuizzesTaken}</p>
            <p className="text-sm text-gray-600">{t('progress.quizzesTaken')}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{overallStats.overallAverageScore}%</p>
            <p className="text-sm text-gray-600">{t('progress.avgQuizScore')}</p>
          </div>
        </div>
      )}

      {/* Course Progress */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('progress.courseProgress')}</h2>

        {progressData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">{t('progress.noProgressData')}</p>
            <a
              href="/dashboard/student/browse"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              {t('progress.browseCourses')}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {progressData.map((item) => (
              <div
                key={item.enrollment._id}
                className="bg-white rounded-lg shadow overflow-hidden"
              >
                {/* Course Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      {item.course.thumbnail ? (
                        <img
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-2xl">📚</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{item.course.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.course.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.enrollment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : item.enrollment.status === 'active'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.enrollment.status.charAt(0).toUpperCase() + item.enrollment.status.slice(1)}
                          </span>
                          <span className="text-gray-500">
                            {t('progress.enrolled')}: {new Date(item.enrollment.enrolledAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-indigo-600">{item.enrollment.progress}%</p>
                      <p className="text-sm text-gray-500">{t('progress.complete')}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          item.enrollment.progress >= 100
                            ? 'bg-green-500'
                            : item.enrollment.progress >= 50
                            ? 'bg-indigo-600'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${item.enrollment.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quiz Stats */}
                  <div className="mt-4 grid grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{item.quizStats.total}</p>
                      <p className="text-xs text-gray-600">{t('progress.totalQuizzes')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{item.quizStats.completed}</p>
                      <p className="text-xs text-gray-600">{t('progress.completed')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{item.quizStats.averageScore}%</p>
                      <p className="text-xs text-gray-600">{t('progress.avgScore')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-900">{item.quizStats.highestScore}%</p>
                      <p className="text-xs text-gray-600">{t('progress.bestScore')}</p>
                    </div>
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() => setSelectedCourse(
                      selectedCourse === item.enrollment._id ? null : item.enrollment._id
                    )}
                    className="mt-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    {selectedCourse === item.enrollment._id ? t('progress.hideDetails') : t('progress.viewQuizHistory')}
                  </button>
                </div>

                {/* Quiz History */}
                {selectedCourse === item.enrollment._id && item.attempts.length > 0 && (
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">{t('progress.quizAttempts')}</h4>
                    <div className="space-y-2">
                      {item.attempts.map((attempt) => (
                        <div
                          key={attempt._id}
                          className="bg-white rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{attempt.quizTitle}</p>
                            <p className="text-xs text-gray-500">
                              {t('progress.attempt')} #{attempt.attemptNumber} • {formatTime(attempt.timeTaken)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${
                              attempt.score >= 70 ? 'text-green-600' : attempt.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {attempt.score}%
                            </p>
                            <p className="text-xs text-gray-500">
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
      </div>
    </div>
  );
}

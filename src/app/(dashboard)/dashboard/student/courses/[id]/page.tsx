'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEnrollments, useQuizzes, useQuizAttempts, type Enrollment, type Quiz, type QuizAttempt } from '@/lib/react-query/hooks';
import { Play, RotateCcw, Clock, CheckCircle } from 'lucide-react';

export default function CourseDetailPage() {
  const { status } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const courseId = params.id as string;

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { data: allQuizzes = [], isLoading: quizzesLoading } = useQuizzes('public');
  const { data: attempts = [] } = useQuizAttempts();

  const enrollment = enrollments.find((e: Enrollment) => e.course._id === courseId);
  
  // Filter quizzes for this course
  const courseQuizzes = useMemo(() => {
    return allQuizzes.filter((q: Quiz) => q.course?._id === courseId && q.isPublished);
  }, [allQuizzes, courseId]);

  // Get quiz status for each quiz
  const quizStatuses = useMemo(() => {
    const statuses: Record<string, { status: 'completed' | 'in_progress' | 'available'; attempt?: QuizAttempt }> = {};
    
    courseQuizzes.forEach((quiz: Quiz) => {
      const quizAttempts = attempts.filter((a: QuizAttempt) => a.quiz._id === quiz._id);
      const completedAttempt = quizAttempts.find((a: QuizAttempt) => a.status === 'completed');
      const inProgressAttempt = quizAttempts.find((a: QuizAttempt) => a.status === 'in_progress');
      
      if (completedAttempt) {
        statuses[quiz._id] = { status: 'completed', attempt: completedAttempt };
      } else if (inProgressAttempt) {
        statuses[quiz._id] = { status: 'in_progress', attempt: inProgressAttempt };
      } else {
        statuses[quiz._id] = { status: 'available' };
      }
    });
    
    return statuses;
  }, [courseQuizzes, attempts]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleStartQuiz = async (quizId: string) => {
    try {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, action: 'start' }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/student/quizzes/take?attemptId=${data.attempt._id}`);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleContinueQuiz = (attemptId: string) => {
    router.push(`/dashboard/student/quizzes/take?attemptId=${attemptId}`);
  };

  const handleReviewQuiz = (attemptId: string) => {
    router.push(`/dashboard/student/quizzes/${attemptId}/result`);
  };

  if (status === 'loading' || enrollmentsLoading || quizzesLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-8 text-center">
          <p className="text-[var(--color-muted-foreground)] mb-4">{t('errors.courseNotFound') || 'Course not found or not enrolled'}</p>
          <button
            onClick={() => router.push('/dashboard/student/courses')}
            className="min-h-[44px] px-4 py-3 sm:px-4 sm:py-2 bg-[var(--student-primary)] text-white rounded-lg hover:bg-[var(--student-primary)]/90"
          >
            {t('courses.backToCourses') || 'Back to My Courses'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{enrollment.course.title}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{enrollment.course.description}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/student/courses')}
          className="min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
        >
          Back to Courses
        </button>
      </div>

      {/* Progress */}
      <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Progress</span>
          <span className="text-sm font-bold text-[var(--student-primary)]">{enrollment.progress}%</span>
        </div>
        <div className="w-full bg-[var(--color-muted)] rounded-full h-2">
          <div
            className="h-full rounded-full bg-[var(--student-primary)] transition-all"
            style={{ width: `${enrollment.progress}%` }}
          />
        </div>
      </div>

      {/* Quizzes */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)] mb-4">Quizzes</h2>
        {courseQuizzes.length === 0 ? (
          <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-8 text-center">
            <p className="text-[var(--color-muted-foreground)]">No quizzes available for this course yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseQuizzes.map((quiz: Quiz) => {
              const status = quizStatuses[quiz._id];
              return (
                <div key={quiz._id} className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 border border-[var(--border)] hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{quiz.title}</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] mt-1">{quiz.description}</p>
                    </div>
                    {status.status === 'completed' && (
                      <CheckCircle className="w-6 h-6 text-[var(--success)] flex-shrink-0 ml-2" />
                    )}
                    {status.status === 'in_progress' && (
                      <Clock className="w-6 h-6 text-[var(--warning)] flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-[var(--color-muted-foreground)] mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                  </div>

                  {status.status === 'completed' && status.attempt && (
                    <div className="mb-4 p-3 bg-[var(--success-light)] rounded-lg">
                      <p className="text-sm font-medium text-[var(--success)]">
                        Score: {status.attempt.score}%
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {status.status === 'available' && (
                      <button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="flex-1 min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 bg-[var(--student-primary)] text-white py-2 px-4 rounded-lg hover:bg-[var(--student-primary)]/90 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Start Quiz
                      </button>
                    )}
                    {status.status === 'in_progress' && status.attempt && (
                      <button
                        onClick={() => handleContinueQuiz(status.attempt!._id)}
                        className="flex-1 min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 bg-[var(--warning)] text-white py-2 px-4 rounded-lg hover:bg-[var(--warning)]/90 transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Continue
                      </button>
                    )}
                    {status.status === 'completed' && status.attempt && (
                      <button
                        onClick={() => handleReviewQuiz(status.attempt!._id)}
                        className="flex-1 min-h-[44px] sm:min-h-0 flex items-center justify-center gap-2 bg-[var(--color-muted-foreground)] text-white py-2 px-4 rounded-lg hover:bg-[var(--color-muted-foreground)]/90 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

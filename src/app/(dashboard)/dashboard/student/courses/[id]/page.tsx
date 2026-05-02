'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { Skeleton } from '@/components/ui/Skeleton';
import { useEnrollments, useQuizzes, useQuizAttempts, type Enrollment, type Quiz, type QuizAttempt } from '@/lib/react-query/hooks';
import { Play, RotateCcw, Clock, CheckCircle } from 'lucide-react';
import CourseLeaderboard from '@/features/courses/components/CourseLeaderboard';

export default function CourseDetailPage() {
  const { status, session } = useSessionStore();
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
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm border border-[var(--border)] p-8 text-center">
        <div className="w-16 h-16 bg-[var(--color-muted-foreground)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-[var(--color-muted-foreground)] mb-6 text-lg">{t('errors.courseNotFound') || 'Course not found or not enrolled'}</p>
        <button
          onClick={() => router.push('/dashboard/student/courses')}
          className="min-h-[48px] px-6 py-3 bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-primary-light)] text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-medium"
        >
          {t('courses.backToCourses') || 'Back to My Courses'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)]">{enrollment.course.title}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-2">{enrollment.course.description}</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/student/courses')}
          className="min-h-[44px] px-6 py-3 bg-[var(--color-muted-foreground)]/10 hover:bg-[var(--color-muted-foreground)]/20 text-[var(--color-foreground)] border border-[var(--border)] rounded-xl transition-all"
        >
          Back to Courses
        </button>
      </div>

      {/* Progress */}
      <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Course Progress</span>
          <span className="text-sm font-bold text-[var(--student-primary)]">{enrollment.progress}%</span>
        </div>
        <div className="w-full bg-[var(--color-muted)]/30 rounded-full h-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-primary-light)] transition-all duration-500"
            style={{ width: `${enrollment.progress}%` }}
          />
        </div>
      </div>

      {/* Quizzes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">Quizzes</h2>
          <div className="text-sm text-[var(--color-muted-foreground)]">
            {courseQuizzes.length} {courseQuizzes.length === 1 ? 'quiz' : 'quizzes'} available
          </div>
        </div>
        {courseQuizzes.length === 0 ? (
          <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm border border-[var(--border)] p-12 text-center">
            <div className="w-16 h-16 bg-[var(--color-muted-foreground)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-[var(--color-muted-foreground)] text-lg">No quizzes available for this course yet.</p>
            <p className="text-[var(--color-muted-foreground)]/60 text-sm mt-2">Check back later for new quizzes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {courseQuizzes.map((quiz: Quiz) => {
              const status = quizStatuses[quiz._id];
              return (
                <div key={quiz._id} className="bg-[var(--card-solid)] rounded-2xl shadow-sm border border-[var(--border)] hover:shadow-lg hover:border-[var(--student-primary)]/30 transition-all duration-300 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 pr-4">
                      <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">{quiz.title}</h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{quiz.description}</p>
                    </div>
                    {status.status === 'completed' && (
                      <div className="flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-[var(--success)]" />
                      </div>
                    )}
                    {status.status === 'in_progress' && (
                      <div className="flex-shrink-0">
                        <Clock className="w-6 h-6 text-[var(--warning)]" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-sm text-[var(--color-muted-foreground)] mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[var(--color-muted-foreground)]/10 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                      <span>{quiz.timeLimit} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[var(--color-muted-foreground)]/10 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold">?</span>
                      </div>
                      <span>{quiz.questions?.length || 0} questions</span>
                    </div>
                  </div>

                  {status.status === 'completed' && status.attempt && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-[var(--success-light)]/20 to-[var(--success)]/10 border border-[var(--success)]/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[var(--success)]">
                          Score: {status.attempt.score}%
                        </p>
                        <CheckCircle className="w-5 h-5 text-[var(--success)]" />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {status.status === 'available' && (
                      <button
                        onClick={() => handleStartQuiz(quiz._id)}
                        className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-primary-light)] text-white py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-medium"
                      >
                        <Play className="w-4 h-4" />
                        Start Quiz
                      </button>
                    )}
                    {status.status === 'in_progress' && status.attempt && (
                      <button
                        onClick={() => handleContinueQuiz(status.attempt!._id)}
                        className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--warning)] to-orange-500 text-white py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-medium"
                      >
                        <Play className="w-4 h-4" />
                        Continue
                      </button>
                    )}
                    {status.status === 'completed' && status.attempt && (
                      <button
                        onClick={() => handleReviewQuiz(status.attempt!._id)}
                        className="flex-1 min-h-[48px] flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 px-6 rounded-xl hover:shadow-lg hover:from-gray-700 hover:to-gray-800 transform hover:scale-[1.02] transition-all duration-200 font-medium"
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

        {/* Course Leaderboard */}
        <div className="mt-8">
          <div className="bg-[var(--card-solid)] rounded-2xl shadow-sm border border-[var(--border)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">Top Students</h2>
              <div className="text-sm text-[var(--color-muted-foreground)]">Course Rankings</div>
            </div>
            <CourseLeaderboard
              courseId={courseId}
              courseTitle={enrollment.course.title}
              showUserRank={true}
              currentUserId={session?.user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

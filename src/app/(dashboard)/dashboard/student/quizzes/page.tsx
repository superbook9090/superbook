// src/app/(dashboard)/dashboard/student/quizzes/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import QuizCard from '@/components/dashboard/QuizCard';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: { question: string; options: string[]; correctAnswer: number }[];
  course: { _id: string; title: string };
  isPublished: boolean;
}

interface Attempt {
  _id: string;
  quiz: Quiz;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  status: string;
  attemptNumber: number;
  submittedAt?: string;
  startedAt: string;
}

export default function StudentQuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availableQuizzes, setAvailableQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'available' | 'completed'>('available');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role === 'teacher' || session.user?.role === 'admin') {
      router.push('/dashboard/teacher/quizzes');
      return;
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]); // Only re-fetch when user ID changes

  const fetchData = async () => {
    try {
      // Fetch attempts
      const attemptsRes = await fetch('/api/quiz-attempts');
      const attemptsData = await attemptsRes.json();

      if (!attemptsRes.ok) {
        console.error('Quiz attempts error:', attemptsData);
        setError(attemptsData.message || 'Failed to load quiz attempts');
        setIsLoading(false);
        return;
      }

      // Fetch enrollments to get available quizzes
      const enrollmentsRes = await fetch('/api/enrollments');
      const enrollmentsData = await enrollmentsRes.json();

      if (!enrollmentsRes.ok) {
        console.error('Enrollments error:', enrollmentsData);
        setError(enrollmentsData.message || 'Failed to load enrollments');
        setIsLoading(false);
        return;
      }

      const allAttempts = (attemptsData.attempts || []).filter(
        (a: Attempt) => a.quiz && a.quiz._id // Filter out attempts with missing quiz data
      );
      setAttempts(allAttempts);

      // Get quizzes from enrolled courses
      const enrolledCourseIds = (enrollmentsData.enrollments || []).map(
        (e: { course: { _id: string } | string }) => {
          // Handle both populated course object and course ID string
          if (typeof e.course === 'object' && e.course !== null) {
            return e.course._id?.toString();
          }
          return e.course?.toString();
        }
      ).filter(Boolean); // Remove any undefined/null

      console.log('Enrolled course IDs:', enrolledCourseIds);

      // Fetch all available quizzes
      const quizzesRes = await fetch('/api/quizzes');
      const quizzesData = await quizzesRes.json();

      if (!quizzesRes.ok) {
        console.error('Quizzes error:', quizzesData);
        setError(quizzesData.message || 'Failed to load quizzes');
        setIsLoading(false);
        return;
      }

      const allQuizzes = quizzesData.quizzes || [];
      console.log('All quizzes:', allQuizzes);
      console.log('All quizzes count:', allQuizzes.length);

      // Filter for published quizzes from enrolled courses
      const relevantQuizzes = allQuizzes.filter((q: Quiz) => {
        const quizCourseId = q.course?._id?.toString();
        const isEnrolled = quizCourseId && enrolledCourseIds.includes(quizCourseId);
        console.log(`Quiz ${q.title}: isPublished=${q.isPublished}, courseId=${quizCourseId}, isEnrolled=${isEnrolled}`);
        return q.isPublished && isEnrolled;
      });

      console.log('Filtered relevant quizzes:', relevantQuizzes);
      console.log('Filtered quizzes count:', relevantQuizzes.length);

      setAvailableQuizzes(relevantQuizzes);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError('Error loading quizzes: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = useCallback(async (quizId: string) => {
    try {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizId, action: 'start' }),
      });

      const data = await response.json();

      if (response.ok) {
        // Navigate to quiz taking page
        router.push(`/dashboard/student/quizzes/take?attemptId=${data.attempt._id}`);
      } else {
        alert(data.message || 'Failed to start quiz');
      }
    } catch (_err) {
      alert('Error starting quiz');
    }
  }, [router]);

  const completedAttempts = useMemo(() =>
    attempts.filter((a) => a.status === 'completed'),
    [attempts]
  );

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Quizzes</h1>
      <p className="mt-2 text-gray-600">
        Take quizzes and track your progress.
      </p>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="mt-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('available')}
            className={`${
              activeTab === 'available'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Available ({availableQuizzes.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`${
              activeTab === 'completed'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
          >
            Completed ({completedAttempts.length})
          </button>
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'available' ? (
          availableQuizzes.length === 0 ? (
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-8 sm:p-6 text-center">
                <p className="text-gray-500 mb-4">
                  No quizzes available. Enroll in a course to access quizzes.
                </p>
                <a
                  href="/dashboard/student/browse"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Browse Courses
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz._id}
                  quiz={quiz}
                  type="available"
                  onStart={handleStartQuiz}
                />
              ))}
            </div>
          )
        ) : completedAttempts.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500">You haven&apos;t completed any quizzes yet.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedAttempts.map((attempt) => (
              <QuizCard
                key={`${attempt._id}-${attempt.attemptNumber}`}
                quiz={attempt.quiz}
                attempt={attempt}
                type="attempted"
                onStart={handleStartQuiz}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

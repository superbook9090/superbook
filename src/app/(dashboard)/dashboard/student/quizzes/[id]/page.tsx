// src/app/(dashboard)/dashboard/student/quizzes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import QuizLeaderboard from '@/features/quizzes/components/QuizLeaderboard';
import { useStartQuizAttempt } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import { getQuizById } from '@/lib/api/quizzes';
import { Loader } from '@/components/ui/Loader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { motion } from 'framer-motion';
import { HelpCircle, Clock, BookOpen, ArrowLeft, Play } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  QuizStartConfirmModal,
  type QuizStartInfo,
} from '@/features/quizzes/components/QuizStartConfirmModal';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questionCount?: number;
  course: { _id: string; title: string };
  isPublished: boolean;
}

export default function QuizDetailPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { theme } = useRoleTheme();
  const startQuiz = useStartQuizAttempt();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    fetchQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, quizId]);

  const fetchQuiz = async () => {
    try {
      setIsLoading(true);
      const data = await getQuizById(quizId);
      setQuiz(data.quiz as Quiz);
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setError(t('errors.quizNotFound'));
      } else {
        setError(err instanceof ApiClientError ? err.message : t('errors.failedToLoadQuiz'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      const data = await startQuiz.mutateAsync(quizId);
      setShowStartConfirm(false);
      router.push(`/dashboard/student/quizzes/take?attemptId=${data.attempt._id}`);
    } catch (e) {
      setError(
        e instanceof ApiClientError ? e.message : t('errors.errorStartingQuiz')
      );
    }
  };

  const startConfirmQuiz: QuizStartInfo | null = quiz
    ? {
        title: quiz.title,
        questionCount: quiz.questionCount,
        timeLimit: quiz.timeLimit,
        mode: 'start',
      }
    : null;

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div>
        <Alert type="error" message={error} />
        <button
          onClick={() => router.push('/dashboard/student/quizzes')}
          className={`mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:opacity-90`}
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div>
        <p className="text-[var(--error)]">{t('errors.quizNotFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard/student/quizzes')}
        className="inline-flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('common.back')}
      </button>

      {/* Quiz Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} text-white p-6 sm:p-8`}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="default" size="sm" className="bg-[var(--card-solid)]/20 text-white">
              <BookOpen className="w-3 h-3 mr-1" />
              {quiz.course?.title || t('quiz.course')}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-white/80 mb-6 max-w-2xl">{quiz.description || t('quiz.noDescription')}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <span>{quiz.questionCount ?? 0} {t('quiz.questions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{quiz.timeLimit} {t('quiz.min')}</span>
            </div>
          </div>

          {quiz.isPublished && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStartConfirm(true)}
              disabled={startQuiz.isPending}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[var(--card-solid)] text-[var(--primary)] rounded-xl font-semibold hover:bg-[var(--card-solid)]/90 transition-all disabled:opacity-50"
            >
              {startQuiz.isPending ? (
                <Loader size="sm" />
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  {t('quiz.startQuiz')}
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      <QuizStartConfirmModal
        quiz={startConfirmQuiz}
        isOpen={showStartConfirm}
        isLoading={startQuiz.isPending}
        onConfirm={handleStartQuiz}
        onCancel={() => setShowStartConfirm(false)}
      />

      {/* Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <QuizLeaderboard
          quizId={quizId}
          quizTitle={quiz.title}
          showUserRank={!!session?.user?.id}
          currentUserId={session?.user?.id}
        />
      </motion.div>
    </div>
  );
}

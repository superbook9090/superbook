// src/app/(dashboard)/dashboard/student/quizzes/[id]/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { LazyQuizLeaderboard, LazyQuizStartConfirmModal } from '@/lib/lazy';
import { useStartQuizAttempt } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import { getQuizById } from '@/lib/api/quizzes';
import { Loader } from '@/components/ui/Loader';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { motion } from 'framer-motion';
import { HelpCircle, Clock, BookOpen, Play } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import type { QuizStartInfo } from '@/features/quizzes/components/QuizStartConfirmModal';

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
  const startQuiz = useStartQuizAttempt();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const { addAlert } = useAlert();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
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
      router.push(ROUTES.student.quizTake(data.attempt._id));
    } catch (e) {
      addAlert({
        type: 'error',
        message: e instanceof ApiClientError ? e.message : t('errors.errorStartingQuiz'),
      });
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
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 w-full">
          {error}
        </div>
        <BackButton
          href={ROUTES.student.quizzes}
          variant="outline"
          className="mt-4"
        />
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="p-4 rounded-xl bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 w-full">
          {t('errors.quizNotFound')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton
        href={ROUTES.student.quizzes}
      />

      {/* Quiz Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="default" size="sm" className="bg-[var(--primary-soft)] text-[var(--primary)]">
              <BookOpen className="w-3 h-3 mr-1" />
              {quiz.course?.title || t('quiz.course')}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-[var(--color-foreground)]">{quiz.title}</h1>
          <p className="text-[var(--color-muted-foreground)] mb-6 max-w-2xl">{quiz.description || t('quiz.noDescription')}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--color-muted-foreground)]">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--primary)]" />
              <span>{quiz.questionCount ?? 0} {t('quiz.questions')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--primary)]" />
              <span>{quiz.timeLimit} {t('quiz.min')}</span>
            </div>
          </div>

          {quiz.isPublished && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStartConfirm(true)}
              disabled={startQuiz.isPending}
              className="btn-premium mt-6 disabled:opacity-50"
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

      <LazyQuizStartConfirmModal
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
        <LazyQuizLeaderboard
          quizId={quizId}
          quizTitle={quiz.title}
          showUserRank={!!session?.user?.id}
          currentUserId={session?.user?.id}
        />
      </motion.div>
    </div>
  );
}

'use client';
import { ROUTES } from '@/constants/routes';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import {
  HelpCircle,
  Clock,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Loader } from '@/components/ui/Loader';
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

interface QuizCardProps {
  quiz: Quiz;
  attempt?: Attempt;
  type: 'available' | 'attempted' | 'in_progress';
  onStart?: (quizId: string) => Promise<void>;
  onContinue?: (attemptId: string) => void;
  hideCourseBadge?: boolean;
  className?: string;
}

function QuizCard({
  quiz,
  attempt,
  type,
  onStart,
  onContinue,
  hideCourseBadge = false,
  className,
}: QuizCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [confirmQuiz, setConfirmQuiz] = useState<QuizStartInfo | null>(null);

  const openStartConfirm = (mode: 'start' | 'retake') => {
    setConfirmQuiz({
      title: quiz.title,
      questionCount: quiz.questionCount,
      timeLimit: quiz.timeLimit,
      mode,
    });
  };

  const openContinueConfirm = () => {
    setConfirmQuiz({
      title: quiz.title,
      questionCount: quiz.questionCount,
      timeLimit: quiz.timeLimit,
      mode: 'continue',
    });
  };

  const handleConfirm = async () => {
    if (!confirmQuiz) return;

    if (confirmQuiz.mode === 'continue') {
      if (attempt && onContinue) {
        onContinue(attempt._id);
        setConfirmQuiz(null);
      }
      return;
    }

    if (!onStart) return;
    setIsLoading(true);
    try {
      await onStart(quiz._id);
      setConfirmQuiz(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = () => {
    if (attempt) {
      router.push(ROUTES.student.quizResult(attempt._id));
    }
  };

  const handleViewLeaderboard = () => {
    router.push(ROUTES.student.quiz(quiz._id));
  };

  const handleRetake = () => openStartConfirm('retake');

  const getScoreVariant = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  const isCompact = type === 'available';

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--card-solid)] shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)]',
        isCompact ? 'h-auto' : 'h-full min-h-[380px]',
        className
      )}
    >
      {/* Role keyline — replaces the old gradient banner */}
      <div className="h-[3px] w-full shrink-0" style={{ background: 'var(--primary-gradient)' }} aria-hidden />

      <div className={cn('flex flex-col p-3.5 sm:p-4.5', !isCompact && 'flex-1')}>
        {!hideCourseBadge && (
          <div className="mb-2">
            <Badge
              variant="primary"
              size="sm"
              icon={<BookOpen className="w-3 h-3 shrink-0" />}
              className="max-w-full truncate"
            >
              <span className="truncate">{quiz.course?.title || t('quiz.course')}</span>
            </Badge>
          </div>
        )}
        <h3
          className={cn(
            'mb-1 line-clamp-2 text-sm sm:text-base font-bold text-[var(--color-foreground)]',
            !isCompact && 'min-h-[2.5rem]'
          )}
        >
          {quiz.title}
        </h3>
        <p
          className={cn(
            'mb-2.5 line-clamp-2 text-xs sm:text-sm text-[var(--color-muted-foreground)]',
            !isCompact && 'min-h-[2.25rem]'
          )}
        >
          {quiz.description || t('quiz.noDescription')}
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
            <HelpCircle className="h-3 w-3 shrink-0" />
            {quiz.questionCount ?? 0} {t('quiz.questions')}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-xs font-medium text-[var(--color-muted-foreground)]">
            <Clock className="h-3 w-3 shrink-0" />
            {quiz.timeLimit} {t('quiz.min')}
          </span>
        </div>

        {!isCompact && (
          <div className="mb-3 min-h-[6.5rem]">
            {type === 'attempted' && attempt && (
              <div className="rounded-lg bg-[var(--color-surface-muted)]/60 p-2.5 sm:p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Badge variant={getScoreVariant(attempt.score)} size="sm">
                  {attempt.score}% {t('quiz.quizScore')}
                </Badge>
                <span className="shrink-0 text-xs text-[var(--color-muted-foreground)]">
                  {t('quiz.attempt')}
                  {attempt.attemptNumber}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm sm:grid-cols-2 sm:gap-3">
                <div className="flex min-w-0 items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" />
                  <span className="truncate text-[var(--color-muted-foreground)]">
                    {attempt.correctCount}/{attempt.totalQuestions} {t('quiz.correct')}
                  </span>
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-info)]" />
                  <span className="truncate text-[var(--color-muted-foreground)]">
                    {formatDuration(attempt.timeTaken)}
                  </span>
                </div>
              </div>
              {attempt.submittedAt && (
                <p className="mt-1.5 truncate text-[11px] text-[var(--color-muted-foreground)]">
                  {t('quiz.completed')} {formatDateTime(attempt.submittedAt)}
                </p>
              )}
            </div>
          )}

          {type === 'in_progress' && attempt && (
            <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] p-2.5 sm:p-3">
              <Badge variant="warning" size="sm">
                {t('courses.inProgress')}
              </Badge>
              <p className="mt-1.5 truncate text-xs text-[var(--color-muted-foreground)]">
                {t('quiz.started')} {formatDateTime(attempt.startedAt)}
              </p>
            </div>
          )}
        </div>
        )}

        <div
          className={cn(
            'flex flex-col gap-1.5',
            isCompact ? '' : 'mt-auto min-h-[6.5rem] justify-end'
          )}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleViewLeaderboard}
            className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-xs sm:text-sm font-medium text-[var(--color-foreground)] transition-all hover:bg-[var(--color-surface-muted)]/80"
          >
            <Trophy className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t('quiz.viewLeaderboard')}</span>
          </motion.button>

          {type === 'available' ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openStartConfirm('start')}
              disabled={isLoading}
              className="gradient-bg flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t('quiz.startQuiz')}</span>
                </>
              )}
            </motion.button>
          ) : type === 'in_progress' ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={openContinueConfirm}
              className="gradient-bg flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90"
            >
              <Play className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t('courses.continue')}</span>
            </motion.button>
          ) : (
            <div className="flex flex-col gap-1.5 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReview}
                className="gradient-bg flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90"
              >
                <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t('quiz.review')}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetake}
                disabled={isLoading}
                className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--primary-border)] bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary-soft)] disabled:opacity-50 sm:flex-none"
              >
                {isLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{t('quiz.retake')}</span>
                  </>
                )}
              </motion.button>
            </div>
          )}
        </div>
      </div>

      <QuizStartConfirmModal
        quiz={confirmQuiz}
        isOpen={!!confirmQuiz}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmQuiz(null)}
      />
    </motion.div>
  );
}

const QuizCardMemo = memo(QuizCard);
export default QuizCardMemo;

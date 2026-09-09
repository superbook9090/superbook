'use client';
import { ROUTES } from '@/constants/routes';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { HelpCircle, Clock, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  QuizStartConfirmModal,
  type QuizStartInfo,
} from '@/features/quizzes/components/QuizStartConfirmModal';
import {
  QuizCardAttemptDetails,
  type QuizAttemptInfo,
} from '@/features/quizzes/components/QuizCardAttemptDetails';
import { QuizCardActions } from '@/features/quizzes/components/QuizCardActions';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questionCount?: number;
  course: { _id: string; title: string };
  isPublished: boolean;
}

interface QuizCardProps {
  quiz: Quiz;
  attempt?: QuizAttemptInfo;
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

  const isCompact = type === 'available';

  return (
    <motion.div
      whileHover={{ y: -5, rotateX: 1, rotateY: -1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] antigravity-glass antigravity-card transition-all duration-300 hover:shadow-xl hover:border-[var(--student-primary)]/50 transform-3d',
        isCompact ? 'h-auto' : 'h-full min-h-[380px]',
        className
      )}
    >
      {/* Role keyline */}
      <div className="h-[3px] w-full shrink-0 shadow-[0_0_8px_var(--primary)]" style={{ background: 'var(--primary-gradient)' }} aria-hidden />

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

        {!isCompact && attempt && (
          <div className="mb-3 min-h-[6.5rem]">
            <QuizCardAttemptDetails type={type as 'attempted' | 'in_progress'} attempt={attempt} />
          </div>
        )}

        <QuizCardActions
          type={type}
          isCompact={isCompact}
          isLoading={isLoading}
          onStart={() => openStartConfirm('start')}
          onContinue={openContinueConfirm}
          onReview={handleReview}
          onRetake={handleRetake}
          onViewLeaderboard={handleViewLeaderboard}
        />
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

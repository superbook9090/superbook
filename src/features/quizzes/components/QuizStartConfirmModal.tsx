'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, HelpCircle, Info, ShieldAlert } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';

export type QuizStartInfo = {
  title: string;
  questionCount?: number;
  timeLimit?: number;
  mode?: 'start' | 'retake' | 'continue';
};

export function QuizStartConfirmModal({
  quiz,
  isOpen,
  isLoading,
  onConfirm,
  onCancel,
}: {
  quiz: QuizStartInfo | null;
  isOpen: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !quiz) return null;

  const isRetake = quiz.mode === 'retake';
  const isContinue = quiz.mode === 'continue';

  const titleKey = isContinue
    ? 'quiz.confirmContinueTitle'
    : isRetake
      ? 'quiz.confirmRetakeTitle'
      : 'quiz.confirmStartTitle';
  const messageKey = isContinue
    ? 'quiz.confirmContinueMessage'
    : isRetake
      ? 'quiz.confirmRetakeMessage'
      : 'quiz.confirmStartMessage';
  const confirmKey = isContinue
    ? 'courses.continue'
    : isRetake
      ? 'quiz.retake'
      : 'quiz.startQuiz';

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-[var(--color-foreground)]/60"
            onClick={() => !isLoading && onCancel()}
            aria-hidden
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="pointer-events-auto w-full max-w-[320px] sm:max-w-md bg-[var(--card-solid)] rounded-3xl shadow-2xl border border-[var(--color-border)] p-5 sm:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-full bg-[var(--info-light)]">
                <Info className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--info)]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] text-center mb-2">
                {t(titleKey)}
              </h2>

              <p className="text-sm text-[var(--color-muted-foreground)] text-center mb-4">
                {t(messageKey, { title: quiz.title })}
              </p>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 p-4 space-y-3 mb-4">
                <p className="font-semibold text-[var(--color-foreground)]">{quiz.title}</p>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted-foreground)]">
                  <span className="inline-flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 shrink-0" />
                    {quiz.questionCount ?? 0} {t('quiz.questions')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-4 h-4 shrink-0" />
                    {quiz.timeLimit ?? 0} {t('quiz.min')}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)] flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[var(--warning)]" />
                  {t('quiz.confirmStartRules')}
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={onConfirm}
                  disabled={isLoading}
                  isLoading={isLoading}
                >
                  {t(confirmKey)}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

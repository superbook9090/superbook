'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, HelpCircle, Info, ShieldAlert } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';

export type QuizStartInfo = {
  title: string;
  questionCount?: number;
  timeLimit?: number;
  mode?: 'start' | 'retake';
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
            className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="pointer-events-auto w-full sm:max-w-md bg-[var(--card-solid)] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[var(--color-border)] p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--color-border)] sm:hidden" />

              <div className="flex items-center justify-center w-14 h-14 mx-auto mb-4 rounded-full bg-[var(--info-light)]">
                <Info className="w-7 h-7 text-[var(--info)]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] text-center mb-2">
                {isRetake ? t('quiz.confirmRetakeTitle') : t('quiz.confirmStartTitle')}
              </h2>

              <p className="text-sm text-[var(--color-muted-foreground)] text-center mb-4">
                {isRetake
                  ? t('quiz.confirmRetakeMessage', { title: quiz.title })
                  : t('quiz.confirmStartMessage', { title: quiz.title })}
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
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl font-medium bg-[var(--color-surface-muted)] text-[var(--color-foreground)] disabled:opacity-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl font-semibold bg-[var(--color-primary)] text-white disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader size="sm" />
                      {t('common.loading')}
                    </>
                  ) : isRetake ? (
                    t('quiz.retake')
                  ) : (
                    t('quiz.startQuiz')
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

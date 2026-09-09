import React from 'react';
import Button from '@/components/ui/Button';

type Props = {
  currentQuestion: number;
  totalQuestions: number;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  handleSubmit: () => void;
  isSubmitting: boolean;
  t: (key: string) => string;
};

export function QuizNavigation({
  currentQuestion,
  totalQuestions,
  setCurrentQuestion,
  handleSubmit,
  isSubmitting,
  t,
}: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--border)] bg-[var(--card-solid)]/80 backdrop-blur-xl p-3.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-2xl sm:p-0 sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:backdrop-blur-none">
      <div className="max-w-4xl mx-auto flex justify-between items-center gap-3">
        <Button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          variant="outline"
          className="min-h-[42px] px-4 text-xs sm:text-sm font-semibold rounded-xl"
        >
          {t('common.previous')}
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
            className="btn-premium min-h-[42px] px-5 sm:px-6 text-xs sm:text-sm font-bold shadow-md shadow-[var(--student-primary)]/20"
          >
            {t('common.next')}
          </Button>
        ) : (
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="btn-premium min-h-[42px] px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-lg shadow-[var(--student-primary)]/30"
          >
            {t('quiz.submit')}
          </Button>
        )}
      </div>
    </div>
  );
}

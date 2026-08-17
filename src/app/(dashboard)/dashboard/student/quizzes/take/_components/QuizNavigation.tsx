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
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[var(--color-border)] bg-[var(--card-solid)]/95 backdrop-blur-md p-2.5 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] shadow-md sm:p-0 sm:static sm:bg-transparent sm:border-0 sm:shadow-none sm:backdrop-blur-none">
      <div className="max-w-4xl mx-auto flex justify-between items-center gap-2.5">
        <Button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          variant="outline"
          className="min-h-[38px] px-3.5 text-xs sm:text-sm"
        >
          {t('common.previous')}
        </Button>

        {currentQuestion < totalQuestions - 1 ? (
          <Button
            onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
            variant="primary"
            className="min-h-[38px] px-4 sm:px-5 text-xs sm:text-sm"
          >
            {t('common.next')}
          </Button>
        ) : (
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            isLoading={isSubmitting}
            variant="primary"
            className="min-h-[38px] px-4 sm:px-5 text-xs sm:text-sm"
          >
            {t('quiz.submit')}
          </Button>
        )}
      </div>
    </div>
  );
}

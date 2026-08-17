import React from 'react';
import type { Question } from './types';

type Props = {
  currentQuestionIndex: number;
  currentQ: Question | undefined;
  answers: Record<string, number>;
  handleAnswer: (questionId: string, optionIndex: number) => void;
  theme: { gradient: string };
};

export function QuizQuestionCard({
  currentQuestionIndex,
  currentQ,
  answers,
  handleAnswer,
  theme,
}: Props) {
  const currentQid = currentQ?._id;

  return (
    <div className="card-surface card-body mb-3 sm:mb-4">
      <div className="flex items-start gap-2.5 mb-3">
        <span className="shrink-0 inline-flex items-center justify-center min-w-[1.75rem] h-7 px-1.5 rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold">
          {currentQuestionIndex + 1}
        </span>
        <h3 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)] leading-snug">
          {currentQ?.question}
        </h3>
      </div>

      <div className="flex flex-col gap-2 sm:gap-2.5">
        {(currentQ?.options || []).map((option, index) => (
          <button
            key={index}
            onClick={() => currentQid && handleAnswer(currentQid, index)}
            className={`w-full text-left p-2.5 sm:p-3 min-h-[42px] rounded-lg border transition-all flex items-center ${
              currentQid && answers[currentQid] === index
                ? 'border-[var(--primary)] bg-[var(--primary-soft)] shadow-sm'
                : 'border-[var(--border)] bg-[var(--card-solid)] hover:border-[var(--primary)]/50'
            }`}
          >
            <div className="flex items-center w-full">
              <span
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2.5 shrink-0 transition-colors ${
                  currentQid && answers[currentQid] === index
                    ? `bg-gradient-to-r ${theme.gradient} text-white shadow-sm`
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-xs sm:text-sm font-medium text-[var(--color-foreground)] break-words flex-1 leading-relaxed">
                {option}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

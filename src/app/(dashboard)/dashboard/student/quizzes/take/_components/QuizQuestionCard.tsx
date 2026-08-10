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
    <div className="bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="shrink-0 inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-bold">
          {currentQuestionIndex + 1}
        </span>
        <h3 className="text-base sm:text-lg font-medium text-[var(--color-foreground)]">
          {currentQ?.question}
        </h3>
      </div>

      <div className="space-y-3">
        {(currentQ?.options || []).map((option, index) => (
          <button
            key={index}
            onClick={() => currentQid && handleAnswer(currentQid, index)}
            className={`w-full text-left p-4 min-h-[44px] rounded-lg border-2 transition-all ${
              currentQid && answers[currentQid] === index
                ? 'border-[var(--student-primary)] bg-[var(--student-primary)]/10'
                : 'border-[var(--border)] hover:border-[var(--student-primary)]/50'
            }`}
          >
            <div className="flex items-center">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                  currentQid && answers[currentQid] === index
                    ? `bg-gradient-to-r ${theme.gradient} text-white`
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span className="text-[var(--color-foreground)]">{option}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import type { Question } from './types';

type Props = {
  currentQuestionIndex: number;
  currentQ: Question | undefined;
  answers: Record<string, number>;
  handleAnswer: (questionId: string, optionIndex: number) => void;
};

export function QuizQuestionCard({
  currentQuestionIndex,
  currentQ,
  answers,
  handleAnswer,
}: Props) {
  const currentQid = currentQ?._id;

  return (
    <div className="antigravity-glass rounded-3xl p-5 sm:p-7 mb-4 sm:mb-6 shadow-md border border-[var(--border)]">
      <div className="flex items-start gap-3 mb-5">
        <span className="shrink-0 inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-xl bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] text-white text-xs font-black shadow-xs">
          {currentQuestionIndex + 1}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] leading-snug pt-0.5">
          {currentQ?.question}
        </h3>
      </div>

      <div className="flex flex-col gap-3">
        {(currentQ?.options || []).map((option, index) => {
          const isSelected = currentQid ? answers[currentQid] === index : false;
          return (
            <button
              key={index}
              onClick={() => currentQid && handleAnswer(currentQid, index)}
              className={`antigravity-quiz-option group ${isSelected ? 'antigravity-quiz-option--selected' : ''}`}
            >
              <div className="flex items-center w-full">
                <span
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-xs font-bold mr-3 shrink-0 transition-all ${
                    isSelected
                      ? `bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] text-white shadow-sm shadow-[var(--student-primary)]/30`
                      : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] group-hover:text-[var(--student-primary)] group-hover:bg-[var(--student-soft)]'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] break-words flex-1 leading-relaxed">
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

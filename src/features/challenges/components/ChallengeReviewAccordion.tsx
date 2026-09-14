'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { GradedChallengeAnswer, PublicChallengeQuestion } from '../types';

interface ChallengeReviewAccordionProps {
  questions: PublicChallengeQuestion[];
  answers: GradedChallengeAnswer[];
}

export function ChallengeReviewAccordion({ questions, answers }: ChallengeReviewAccordionProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 pt-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
        {t('challenge.reviewBreakdown')}
      </h4>
      {questions.map((q, idx) => {
        const graded = answers.find((a) => a.questionId === q.id);
        const isCorrect = graded?.isCorrect ?? false;
        const selectedOpt = graded?.selectedOption ?? -1;
        const correctOpt = graded?.correctOption ?? -1;

        return (
          <div
            key={q.id}
            className={`p-4 rounded-xl border text-left text-xs ${
              isCorrect
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-rose-500/30 bg-rose-500/5'
            }`}
          >
            <div className="flex items-start gap-2 mb-2 font-semibold text-[var(--color-foreground)]">
              {isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span>
                {t('challenge.questionPromptNumber', { number: String(idx + 1), prompt: q.prompt })}
              </span>
            </div>
            <div className="pl-6 flex flex-col gap-1 text-[11px] text-[var(--color-muted-foreground)]">
              <p>
                <span className="font-semibold text-[var(--color-foreground)]">
                  {t('challenge.yourChoice')}{' '}
                </span>
                {selectedOpt >= 0 && q.options[selectedOpt]
                  ? q.options[selectedOpt]
                  : t('challenge.skipped')}
              </p>
              {correctOpt >= 0 && q.options[correctOpt] && !isCorrect && (
                <p className="text-emerald-400">
                  <span className="font-semibold">{t('challenge.correctAnswer')}{' '}</span>
                  {q.options[correctOpt]}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

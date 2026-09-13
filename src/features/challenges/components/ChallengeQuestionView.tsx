'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Timer } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import type { PublicChallengeQuestion } from '../types';

interface ChallengeQuestionViewProps {
  question: PublicChallengeQuestion;
  currentIndex: number;
  totalQuestions: number;
  selectedOption: number;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  elapsedSeconds: number;
  isLastQuestion: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ChallengeQuestionView({
  question,
  currentIndex,
  totalQuestions,
  selectedOption,
  onSelectOption,
  onNext,
  onPrev,
  elapsedSeconds,
  isLastQuestion,
}: ChallengeQuestionViewProps) {
  const { t } = useTranslation();
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
      {/* Top Header: Progress & Timer */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-[var(--color-border)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
            {t('challenge.questionProgress', {
              current: String(currentIndex + 1),
              total: String(totalQuestions),
            })}
          </span>
          <div className="w-36 sm:w-48 h-1.5 bg-[var(--color-muted)]/30 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-foreground)] shadow-sm">
          <Timer className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>{formatTime(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Question Prompt */}
      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="card-surface p-5 sm:p-6 rounded-2xl border border-[var(--color-border)] shadow-md"
      >
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)] leading-relaxed">
          {question.prompt}
        </h2>
      </motion.div>

      {/* Options Grid */}
      <div className="flex flex-col gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          const label = OPTION_LABELS[idx] || `${idx + 1}`;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-150 active:scale-[0.99] ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-500/10 text-[var(--color-foreground)] shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-indigo-400/40 hover:bg-[var(--color-muted)]/15'
              }`}
            >
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-[var(--color-muted)]/30 text-[var(--color-muted-foreground)]'
                }`}
              >
                {label}
              </span>

              <span className="flex-1 text-xs sm:text-sm font-medium leading-normal">
                {option}
              </span>

              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between gap-3 pt-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('challenge.previousQuestion')}
        </Button>

        <Button
          type="button"
          variant="primary"
          onClick={onNext}
          disabled={selectedOption === -1}
          className={`flex items-center gap-2 py-2.5 px-6 text-xs sm:text-sm font-semibold rounded-xl text-white border-0 shadow-md ${
            isLastQuestion
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-orange-500/20'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
          }`}
        >
          <span>{isLastQuestion ? t('challenge.submitAndCompare') : t('challenge.nextQuestion')}</span>
          {!isLastQuestion && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}

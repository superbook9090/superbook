'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Trophy,
  BookOpen,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { SampleQuizQuestion } from '@/data/seo-guides';

interface PublicInteractiveQuizProps {
  title: string;
  subtitle: string;
  questions: SampleQuizQuestion[];
  compact?: boolean;
}

export function PublicInteractiveQuiz({
  title,
  subtitle,
  questions,
  compact = false,
}: PublicInteractiveQuizProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  if (questions.length === 0) return null;

  const current = questions[currentIdx];
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === current.correctIndex;
  const accuracy = Math.round((score / questions.length) * 100);

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    if (idx === current.correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <section
      aria-label={title}
      className={`rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] shadow-[var(--shadow-sm)] overflow-hidden ${
        compact ? 'p-5 sm:p-6' : 'p-6 sm:p-8'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[var(--border)]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            <span>Interactive Practice • No Sign-Up Required</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-foreground)] mt-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] tabular-nums">
            {isFinished
              ? `Score: ${score}/${questions.length}`
              : `Question ${currentIdx + 1} / ${questions.length}`}
          </span>
        </div>
      </div>

      {isFinished ? (
        <div className="py-8 text-center space-y-5 max-w-lg mx-auto">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-[var(--color-foreground)]">
              You scored {score} out of {questions.length} ({accuracy}%)
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              {accuracy >= 80
                ? 'Strong accuracy! Ready to practice full-length timed mock tests and track your mastery.'
                : 'Good warm-up! Review the explanations by retrying or explore full topic courses on Quiz Do.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-muted-strong)] text-sm font-bold text-[var(--color-foreground)] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Practice Set</span>
            </button>
            <Link
              href={ROUTES.courses}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Free Courses</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="pt-5 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]">
              {current.subject}
            </span>
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)] tabular-nums">
              Correct so far: {score}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] leading-snug">
            {current.question}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {current.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isRightOption = idx === current.correctIndex;

              let optionCls =
                'border-[var(--border)] bg-[var(--color-surface)] hover:border-[var(--primary)]/50 hover:bg-[var(--surface-muted)]/50 text-[var(--color-foreground)]';
              if (isAnswered) {
                if (isRightOption) {
                  optionCls =
                    'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
                } else if (isSelected) {
                  optionCls = 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300';
                } else {
                  optionCls =
                    'border-[var(--border)] bg-[var(--color-surface)] opacity-60 text-[var(--color-muted-foreground)]';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelect(idx)}
                  className={`flex items-center justify-between gap-3 p-3.5 min-h-[48px] rounded-xl border text-left text-sm font-medium transition-all ${optionCls} ${
                    isAnswered ? 'cursor-default' : 'cursor-pointer'
                  }`}
                >
                  <span className="flex items-start gap-2.5 min-w-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[var(--surface-muted)] text-xs font-bold shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </span>
                  {isAnswered && isRightOption && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  )}
                  {isAnswered && isSelected && !isRightOption && (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="p-4 rounded-2xl bg-[var(--surface-muted)]/60 border border-[var(--border)] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                {isCorrect ? (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Correct Answer!
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    Incorrect — Correct option is {String.fromCharCode(65 + current.correctIndex)}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed">
                {current.explanation}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <span>
                    {currentIdx + 1 < questions.length ? 'Next Question' : 'View Score Summary'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

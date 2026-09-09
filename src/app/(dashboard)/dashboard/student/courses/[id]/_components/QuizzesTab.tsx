import React from 'react';
import type { Quiz } from '@/lib/react-query/hooks';
import { Target, Sparkles, HelpCircle } from 'lucide-react';

type Props = {
  courseQuizzes: Quiz[];
  courseLevelQuizzes: Quiz[];
  chapterScopedQuizzes: Quiz[];
  lessonScopedQuizzes: Quiz[];
  renderQuizCard: (quiz: Quiz) => React.ReactNode;
  t: (key: string) => string;
};

export function QuizzesTab({
  courseQuizzes,
  courseLevelQuizzes,
  chapterScopedQuizzes,
  lessonScopedQuizzes,
  renderQuizCard,
  t,
}: Props) {
  if (courseQuizzes.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto antigravity-glass rounded-2xl border border-[var(--border)] p-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1">
          {t('courses.noQuizzes')}
        </h3>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Quizzes and assessments will appear here as you progress through the modules.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      {courseLevelQuizzes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              {t('courses.courseLevelQuizzes')}
            </h3>
            <span className="text-xs font-bold text-[var(--student-primary)] bg-[var(--student-soft)] px-2.5 py-0.5 rounded-full">
              {courseLevelQuizzes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 perspective-1000">
            {courseLevelQuizzes.map(renderQuizCard)}
          </div>
        </section>
      )}

      {chapterScopedQuizzes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              {t('courses.chapterQuizzes')}
            </h3>
            <span className="text-xs font-bold text-[var(--student-primary)] bg-[var(--student-soft)] px-2.5 py-0.5 rounded-full">
              {chapterScopedQuizzes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 perspective-1000">
            {chapterScopedQuizzes.map(renderQuizCard)}
          </div>
        </section>
      )}

      {lessonScopedQuizzes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              {t('courses.lessonQuizzes')}
            </h3>
            <span className="text-xs font-bold text-[var(--student-primary)] bg-[var(--student-soft)] px-2.5 py-0.5 rounded-full">
              {lessonScopedQuizzes.length}
            </span>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 perspective-1000">
            {lessonScopedQuizzes.map(renderQuizCard)}
          </div>
        </section>
      )}
    </div>
  );
}

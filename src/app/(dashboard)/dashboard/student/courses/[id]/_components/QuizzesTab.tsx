import React from 'react';
import type { Quiz } from '@/lib/react-query/hooks';

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
  return (
    <div className="mx-auto w-full max-w-6xl stack-page">
      <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('nav.quizzes')}</h2>
      {courseQuizzes.length === 0 ? (
        <div className="py-16 text-center text-sm opacity-60">{t('courses.noQuizzes')}</div>
      ) : (
        <div className="stack-page">
          {courseLevelQuizzes.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('courses.courseLevelQuizzes')}
              </h3>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {courseLevelQuizzes.map(renderQuizCard)}
              </div>
            </div>
          )}
          {chapterScopedQuizzes.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('courses.chapterQuizzes')}
              </h3>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {chapterScopedQuizzes.map(renderQuizCard)}
              </div>
            </div>
          )}
          {lessonScopedQuizzes.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                {t('courses.lessonQuizzes')}
              </h3>
              <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {lessonScopedQuizzes.map(renderQuizCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

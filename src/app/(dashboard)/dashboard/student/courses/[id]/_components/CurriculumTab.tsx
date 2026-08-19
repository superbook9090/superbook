'use client';

import React from 'react';
import { Play, ChevronDown, HelpCircle, Layers, ChevronsUpDown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { CurriculumChapterNode, CurriculumLesson } from '@/lib/curriculum/tree';

export type ChapterWithQuizzes = CurriculumChapterNode & {
  quizzes?: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>;
  subChapters?: Array<CurriculumChapterNode & {
    quizzes?: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>;
  }>;
};

type Props = {
  curriculumWithQuizzes: ChapterWithQuizzes[];
  courseLevelQuizzes: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>;
  expandedChapters: Record<string, boolean>;
  toggleChapter: (chapterId: string) => void;
  toggleAllChapters?: () => void;
  allExpanded?: boolean;
  renderLessonRow: (lesson: CurriculumLesson) => React.ReactNode;
  renderChapterQuizzes: (quizzes?: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>) => React.ReactNode;
  allLessons: Array<{ _id: string; title?: string }>;
  handleStartLesson: (lessonId: string) => void;
  enrollmentProgress: number;
  t: (key: string) => string;
};

export function CurriculumTab({
  curriculumWithQuizzes,
  courseLevelQuizzes,
  expandedChapters,
  toggleChapter,
  toggleAllChapters,
  allExpanded,
  renderLessonRow,
  renderChapterQuizzes,
  allLessons,
  handleStartLesson,
  enrollmentProgress,
  t,
}: Props) {
  const isComplete = enrollmentProgress === 100;
  const isStarted = enrollmentProgress > 0;
  const firstLesson = allLessons[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--student-primary)]" />
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              {t('courses.courseContent')}
            </h2>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
            {curriculumWithQuizzes.length} {curriculumWithQuizzes.length === 1 ? 'Module' : 'Modules'} • {allLessons.length} {allLessons.length === 1 ? 'Lesson' : 'Lessons'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {toggleAllChapters && (
            <button
              onClick={toggleAllChapters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted-strong)] transition-all"
            >
              <ChevronsUpDown className="w-3.5 h-3.5" />
              <span>{allExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
          )}

          {firstLesson && (
            <Button
              onClick={() => handleStartLesson(firstLesson._id)}
              className="btn-premium min-h-[40px] px-5 text-xs sm:text-sm"
            >
              {isComplete ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  <span>{t('courses.review')}</span>
                </>
              ) : isStarted ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                  <span>{t('courses.continue')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current mr-1.5" />
                  <span>{t('courses.start')}</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Chapters Accordion List */}
      <div className="space-y-4">
        {curriculumWithQuizzes.map((chapter, idx) => {
          const isExpanded = !!expandedChapters[chapter._id];
          const lessonCount = chapter.lessons?.length || 0;
          const quizCount = chapter.quizzes?.length || 0;

          return (
            <div
              key={chapter._id}
              className={cn(
                'rounded-2xl border transition-all duration-300 overflow-hidden bg-[var(--card-solid)]',
                isExpanded
                  ? 'border-[var(--student-primary)]/40 shadow-md ring-1 ring-[var(--student-primary)]/15'
                  : 'border-[var(--border)] hover:border-[var(--student-primary)]/30 hover:shadow-sm'
              )}
            >
              <button
                onClick={() => toggleChapter(chapter._id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors hover:bg-[var(--color-surface-muted)]/40"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all',
                      isExpanded
                        ? 'bg-[var(--student-primary)] text-white shadow-sm'
                        : 'bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]'
                    )}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate">
                      {chapter.title}
                    </h3>
                    <div className="flex items-center gap-2.5 text-xs text-[var(--color-muted-foreground)] mt-0.5">
                      <span>{lessonCount} {lessonCount === 1 ? 'Lesson' : 'Lessons'}</span>
                      {quizCount > 0 && (
                        <span>• {quizCount} {quizCount === 1 ? 'Quiz' : 'Quizzes'}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200',
                    isExpanded ? 'rotate-180 bg-[var(--student-soft)] text-[var(--student-primary)]' : 'text-[var(--color-muted-foreground)]'
                  )}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[var(--border)] divide-y divide-[var(--border)] bg-[var(--color-surface-muted)]/20">
                  {chapter.lessons?.map(renderLessonRow)}
                  {renderChapterQuizzes(chapter.quizzes)}

                  {chapter.subChapters?.map((sub) => (
                    <div key={sub._id} className="bg-[var(--color-surface-muted)]/40">
                      <button
                        type="button"
                        onClick={() => toggleChapter(sub._id)}
                        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[var(--color-surface-muted)] transition-colors"
                      >
                        <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] pl-8 truncate">
                          {sub.title}
                        </p>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-[var(--color-muted-foreground)] transition-transform shrink-0 ml-2',
                            expandedChapters[sub._id] && 'rotate-180'
                          )}
                        />
                      </button>
                      {expandedChapters[sub._id] && (
                        <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                          {sub.lessons?.map(renderLessonRow)}
                          {renderChapterQuizzes(sub.quizzes)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Course-level Quizzes / Assessments */}
        {courseLevelQuizzes.length > 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] overflow-hidden shadow-sm">
            <div className="border-b border-[var(--border)] px-5 py-3.5 bg-[var(--student-soft)]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--student-primary)]" />
                <h3 className="font-bold text-sm text-[var(--color-foreground)]">
                  {t('courses.courseLevelQuizzes')}
                </h3>
              </div>
              <span className="text-xs font-bold text-[var(--student-primary)]">
                {courseLevelQuizzes.length} {courseLevelQuizzes.length === 1 ? 'Assessment' : 'Assessments'}
              </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {renderChapterQuizzes(courseLevelQuizzes)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';
import type { PublicChapterCurriculumItem } from '@/lib/courses/public';

interface Props {
  chapters: PublicChapterCurriculumItem[];
  totalLessons: number;
}

export default function PublicCourseCurriculum({ chapters, totalLessons }: Props) {
  // Default first 2 chapters open
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    chapters.forEach((ch, idx) => {
      init[ch._id] = idx < 2;
    });
    return init;
  });

  const toggleChapter = (id: string) => {
    setOpenMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!chapters.length) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--color-surface)] p-6 text-center text-sm text-[var(--color-muted-foreground)]">
        Curriculum details are being populated. Check back shortly!
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
            Course Curriculum & Syllabus
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {chapters.length} Chapters • {totalLessons} Lessons with Interactive Quizzes
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const allOpen = Object.values(openMap).every(Boolean);
            const next: Record<string, boolean> = {};
            chapters.forEach((ch) => {
              next[ch._id] = !allOpen;
            });
            setOpenMap(next);
          }}
          className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
        >
          {Object.values(openMap).every(Boolean) ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter, chIdx) => {
          const isOpen = Boolean(openMap[chapter._id]);
          return (
            <div
              key={chapter._id}
              className="rounded-xl border border-[var(--border)] bg-[var(--color-surface)] overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggleChapter(chapter._id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-surface-hover)] transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--student-soft)] text-xs font-bold text-[var(--color-primary)] border border-[var(--student-border)]">
                    {chIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)] truncate">
                      {chapter.title}
                    </h3>
                    {chapter.summary && (
                      <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1 mt-0.5">
                        {chapter.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-[var(--color-muted-foreground)] hidden sm:inline">
                    {chapter.lessons.length} {chapter.lessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-[var(--border)] bg-[var(--color-surface-muted)]/40 p-3 sm:p-4 space-y-2">
                  {chapter.lessons.length === 0 ? (
                    <p className="text-xs text-[var(--color-muted-foreground)] italic px-2">
                      Lessons being structured for this chapter.
                    </p>
                  ) : (
                    chapter.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson._id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-[var(--color-surface)] border border-[var(--border)]/70 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                          <span className="font-medium text-[var(--color-foreground)] truncate">
                            {lIdx + 1}. {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {lesson.duration > 0 && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted-foreground)]">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}m
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Notes + Quiz
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

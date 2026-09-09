'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';

interface NavigationItem {
  id: string;
  title: string;
}

interface LessonViewerFooterProps {
  prev: NavigationItem | null;
  next: NavigationItem | null;
  onGoToLesson: (lessonId: string) => void;
  onFinishCourse: () => void;
  t: (key: string) => string;
}

export function LessonViewerFooter({
  prev,
  next,
  onGoToLesson,
  onFinishCourse,
  t,
}: LessonViewerFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-[var(--border)]">
      {prev ? (
        <button
          onClick={() => onGoToLesson(prev.id)}
          className="w-full sm:w-auto flex-1 flex items-center justify-between p-5 antigravity-glass border border-[var(--border)] rounded-2xl hover:border-[var(--student-primary)]/40 hover:-translate-y-1 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-0.5">
                {t('courses.previousLesson')}
              </span>
              <span className="block text-sm font-bold text-[var(--color-foreground)] line-clamp-1">
                {prev.title}
              </span>
            </div>
          </div>
        </button>
      ) : (
        <div className="hidden sm:block flex-1" />
      )}

      {next ? (
        <button
          onClick={() => onGoToLesson(next.id)}
          className="w-full sm:w-auto flex-1 flex items-center justify-between p-5 antigravity-glass border border-[var(--border)] rounded-2xl hover:border-[var(--student-primary)]/40 hover:-translate-y-1 hover:shadow-lg transition-all group text-right"
        >
          <div className="flex-1 mr-3.5">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-0.5">
              {t('courses.nextLesson')}
            </span>
            <span className="block text-sm font-bold text-[var(--color-foreground)] line-clamp-1">
              {next.title}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--student-primary)] text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-[var(--student-primary)]/30">
            <ChevronRight className="w-5 h-5" />
          </div>
        </button>
      ) : (
        <Button
          onClick={onFinishCourse}
          variant="primary"
          className="btn-premium w-full sm:w-auto flex-1 p-5 rounded-2xl shadow-lg hover:shadow-xl transition-all text-center font-bold"
        >
          {t('courses.finishCourse')}
        </Button>
      )}
    </div>
  );
}

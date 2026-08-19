'use client';

import React from 'react';
import { PlayCircle, BookOpen, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LazyCurriculumQuizRow } from '@/lib/lazy';
import type { CurriculumLesson } from '@/lib/curriculum/tree';

interface CurriculumLessonRowProps {
  lesson: CurriculumLesson;
  onStartLesson: (lessonId: string) => void;
  getQuizStatus: (quizId: string) => { status: 'available' | 'in_progress' | 'completed'; attempt?: { score?: number; _id: string } };
  onQuizAction: (quiz: { _id: string; title: string; timeLimit: number; questionCount?: number }) => void;
  startingQuizId: string | null;
  confirmQuizId: string | undefined;
}

export default function CurriculumLessonRow({
  lesson,
  onStartLesson,
  getQuizStatus,
  onQuizAction,
  startingQuizId,
  confirmQuizId,
}: CurriculumLessonRowProps) {
  return (
    <div className="divide-y divide-[var(--border)] group/lesson">
      <div
        onClick={() => onStartLesson(lesson._id)}
        className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[var(--student-soft)]/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-all',
              lesson.videoUrl
                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
            )}
          >
            {lesson.videoUrl ? <PlayCircle className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] group-hover/lesson:text-[var(--student-primary)] transition-colors truncate">
              {lesson.title}
            </p>
            <span className="text-[11px] text-[var(--color-muted-foreground)]">
              {lesson.videoUrl ? 'Video Lesson' : 'Reading Material'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[var(--student-primary)] opacity-0 group-hover/lesson:opacity-100 transition-opacity">
            <Play className="w-3 h-3 fill-current" />
            <span>Open</span>
          </span>
          <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover/lesson:translate-x-1 group-hover/lesson:text-[var(--student-primary)] transition-all" />
        </div>
      </div>

      {lesson.quizzes?.map((quiz) => {
        const statusInfo = getQuizStatus(quiz._id);
        return (
          <LazyCurriculumQuizRow
            key={quiz._id}
            title={quiz.title}
            timeLimit={quiz.timeLimit}
            questionCount={quiz.questionCount}
            status={statusInfo.status}
            score={statusInfo.attempt?.score}
            isLoading={startingQuizId === quiz._id || confirmQuizId === quiz._id}
            onAction={() => onQuizAction(quiz)}
          />
        );
      })}
    </div>
  );
}

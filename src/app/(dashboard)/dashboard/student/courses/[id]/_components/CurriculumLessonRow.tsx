'use client';

import React from 'react';
import { PlayCircle, BookOpen, ChevronRight, Play, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LazyCurriculumQuizRow } from '@/lib/lazy';
import type { CurriculumLesson } from '@/lib/curriculum/tree';

interface CurriculumLessonRowProps {
  lesson: CurriculumLesson;
  onStartLesson: (lessonId: string) => void;
  getQuizStatus: (quizId: string) => {
    status: 'available' | 'in_progress' | 'completed';
    attempt?: { score?: number; _id: string };
  };
  onQuizAction: (quiz: { _id: string; title: string; timeLimit: number; questionCount?: number }) => void;
  startingQuizId: string | null;
  confirmQuizId: string | undefined;
  isSuperAdmin?: boolean;
  onOpenAiModal?: (
    action: 'add-chapter' | 'add-lesson' | 'add-quiz',
    chapter?: { _id: string; title: string },
    lesson?: { _id: string; title: string }
  ) => void;
  chapterId?: string;
  chapterTitle?: string;
}

export default function CurriculumLessonRow({
  lesson,
  onStartLesson,
  getQuizStatus,
  onQuizAction,
  startingQuizId,
  confirmQuizId,
  isSuperAdmin,
  onOpenAiModal,
  chapterId,
  chapterTitle,
}: CurriculumLessonRowProps) {
  const isVideo = !!lesson.videoUrl;

  return (
    <div className="divide-y divide-[var(--border)] group/lesson">
      <div
        onClick={() => onStartLesson(lesson._id)}
        className="flex items-center justify-between p-4 sm:p-4.5 hover:bg-[var(--student-soft)]/35 hover:pl-5.5 transition-all duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover/lesson:scale-110',
              isVideo
                ? 'bg-gradient-to-br from-sky-500/20 to-blue-500/10 text-sky-500 border border-sky-500/20'
                : 'bg-gradient-to-br from-[var(--student-primary)]/15 to-[var(--student-accent)]/10 text-[var(--student-primary)] border border-[var(--student-primary)]/20'
            )}
          >
            {isVideo ? <PlayCircle className="w-4.5 h-4.5" /> : <BookOpen className="w-4.5 h-4.5" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] group-hover/lesson:text-[var(--student-primary)] transition-colors truncate">
              {lesson.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-medium text-[var(--color-muted-foreground)]">
                {isVideo ? 'Video Lesson' : 'Reading Material'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSuperAdmin && onOpenAiModal && (
            <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  onOpenAiModal(
                    'add-quiz',
                    chapterId ? { _id: chapterId, title: chapterTitle || '' } : undefined,
                    { _id: lesson._id, title: lesson.title }
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                title="Add practice quiz to this lesson using AI"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>add quiz using AI</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  onOpenAiModal(
                    'add-lesson',
                    chapterId ? { _id: chapterId, title: chapterTitle || '' } : undefined,
                    { _id: lesson._id, title: lesson.title }
                  )
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                title="Generate notes & quiz for this lesson using AI"
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                <span>add lesson using AI</span>
              </button>
            </div>
          )}

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] shadow-xs opacity-0 group-hover/lesson:opacity-100 group-hover/lesson:translate-x-0 translate-x-2 transition-all">
            <Play className="w-3 h-3 fill-current" />
            <span>Open</span>
          </span>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] group-hover/lesson:text-[var(--student-primary)] group-hover/lesson:bg-[var(--student-soft)] transition-colors">
            <ChevronRight className="w-4 h-4 group-hover/lesson:translate-x-0.5 transition-transform" />
          </div>
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

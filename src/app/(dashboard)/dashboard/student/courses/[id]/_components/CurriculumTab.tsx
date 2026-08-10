import React from 'react';
import { Play, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import type { CurriculumChapterNode, CurriculumLesson } from '@/lib/curriculum/tree';

// Define the type for the chapter quizzes since it is not exported from tree.ts
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
  renderLessonRow: (lesson: CurriculumLesson) => React.ReactNode;
  renderChapterQuizzes: (quizzes?: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>) => React.ReactNode;
  allLessons: Array<{ _id: string }>;
  handleStartLesson: (lessonId: string) => void;
  enrollmentProgress: number;
  t: (key: string) => string;
};

export function CurriculumTab({
  curriculumWithQuizzes,
  courseLevelQuizzes,
  expandedChapters,
  toggleChapter,
  renderLessonRow,
  renderChapterQuizzes,
  allLessons,
  handleStartLesson,
  enrollmentProgress,
  t,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto stack-page">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('courses.courseContent')}</h2>
        <Button 
          onClick={() => allLessons[0] && handleStartLesson(allLessons[0]._id)}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {enrollmentProgress > 0 ? t('courses.continue') : t('courses.start')}
        </Button>
      </div>

      <div className="stack-page--compact">
        {curriculumWithQuizzes.map((chapter, idx) => (
          <div key={chapter._id} className="group/chapter">
            <div className={cn(
              "rounded-xl border transition-all duration-200",
              expandedChapters[chapter._id] ? "bg-[var(--card-solid)] border-[var(--student-primary)]/30 shadow-sm" : "bg-[var(--color-surface-muted)]/30 border-[var(--border)] hover:border-[var(--student-primary)]/20"
            )}>
              <button 
                onClick={() => toggleChapter(chapter._id)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                    expandedChapters[chapter._id] ? "bg-[var(--student-primary)] text-white" : "bg-[var(--card-solid)] text-[var(--color-muted-foreground)] border border-[var(--border)]"
                  )}>
                    {idx + 1}
                  </div>
                  <h3 className="font-semibold text-[var(--color-foreground)]">{chapter.title}</h3>
                </div>
                <ChevronDown className={cn("w-4 h-4 transition-transform", expandedChapters[chapter._id] && "rotate-180")} />
              </button>

              {expandedChapters[chapter._id] && (
                <div className="border-t border-[var(--border)] divide-y divide-[var(--border)] bg-[var(--card-solid)] rounded-b-xl overflow-hidden">
                  {chapter.lessons?.map(renderLessonRow)}
                  {renderChapterQuizzes(chapter.quizzes)}
                  {chapter.subChapters?.map((sub) => (
                    <div key={sub._id} className="bg-[var(--color-surface-muted)]/40">
                      <button
                        type="button"
                        onClick={() => toggleChapter(sub._id)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-surface-muted)] transition-colors"
                      >
                        <p className="text-sm font-semibold text-[var(--color-foreground)] pl-12">{sub.title}</p>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform',
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
          </div>
        ))}

        {courseLevelQuizzes.length > 0 && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] overflow-hidden">
            <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
              <h3 className="font-semibold text-[var(--color-foreground)]">
                {t('courses.courseLevelQuizzes')}
              </h3>
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

'use client';

import { useMemo } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Video, FileText, Clock, PlusCircle, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Lesson } from '@/lib/react-query/hooks';
import type { CurriculumLesson, CurriculumQuiz } from '@/lib/curriculum/tree';
import { CurriculumQuizBlock } from './CurriculumQuizBlock';
import { sortableId } from '@/lib/curriculum/sortable';
import { cn } from '@/lib/utils';
import { DragHandleButton, RowEditDeleteActions } from './shared';
import type { AiActionType } from '@/app/(dashboard)/dashboard/student/courses/[id]/_components/AiCourseActionModal';

function SortableLessonRow({
  lesson,
  chapterId,
  onEdit,
  onDelete,
  onOpenAiModal,
}: {
  lesson: Lesson;
  chapterId: string;
  onEdit: () => void;
  onDelete: () => void;
  onOpenAiModal?: (
    action: AiActionType,
    chapter?: { _id: string; title: string } | null,
    lesson?: { _id: string; title: string } | null
  ) => void;
}) {
  const id = sortableId('lesson', lesson._id);
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-2 p-2 sm:p-3 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)]/30 transition-all group',
        isDragging && 'opacity-40 shadow-lg ring-2 ring-[var(--color-primary)]/40'
      )}
    >
      <DragHandleButton attributes={attributes} listeners={listeners} label="Drag lesson" />
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {lesson.videoUrl ? (
          <Video className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
        ) : (
          <FileText className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
        )}
        <span className="text-sm font-medium text-[var(--color-foreground)] truncate">{lesson.title}</span>
        {lesson.duration > 0 && (
          <span className="text-[10px] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded text-[var(--color-muted-foreground)] flex items-center gap-1 shrink-0">
            <Clock className="w-2.5 h-2.5" />
            {lesson.duration}m
          </span>
        )}
      </div>

      {onOpenAiModal && (
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onOpenAiModal('add-quiz', { _id: chapterId, title: '' }, lesson)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors shadow-sm"
            title="add quiz using AI"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">add quiz using AI</span>
            <span className="sm:hidden">+Quiz AI</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAiModal('add-lesson', { _id: chapterId, title: '' }, lesson)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors shadow-sm"
            title="add lesson using AI"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">add lesson using AI</span>
            <span className="sm:hidden">+Lesson AI</span>
          </button>
        </div>
      )}

      <RowEditDeleteActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export function LessonList({
  chapterId,
  courseId,
  lessons,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
  onDeleteQuiz,
  onOpenAiModal,
}: {
  chapterId: string;
  courseId: string;
  lessons: Array<Lesson & Partial<Pick<CurriculumLesson, 'quizzes'>>>;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onAddLesson: (chapterId: string) => void;
  onDeleteQuiz: (quiz: CurriculumQuiz) => void;
  onOpenAiModal?: (
    action: AiActionType,
    chapter?: { _id: string; title: string } | null,
    lesson?: { _id: string; title: string } | null
  ) => void;
}) {
  const { t } = useTranslation();
  const ids = useMemo(() => lessons.map((l) => sortableId('lesson', l._id)), [lessons]);

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="space-y-2 min-h-[8px]">
        {lessons.map((lesson) => (
          <div key={lesson._id} className="space-y-2">
            <SortableLessonRow
              lesson={lesson}
              chapterId={chapterId}
              onEdit={() => onEditLesson(lesson)}
              onDelete={() => onDeleteLesson(lesson._id)}
              onOpenAiModal={onOpenAiModal}
            />
            <div className="ml-6 sm:ml-8">
              <CurriculumQuizBlock
                courseId={courseId}
                quizzes={lesson.quizzes ?? []}
                placement="lesson"
                lessonId={lesson._id}
                compact
                onDeleteQuiz={onDeleteQuiz}
              />
            </div>
          </div>
        ))}
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => onAddLesson(chapterId)}
            className="flex-1 flex items-center justify-center gap-2 p-3 min-h-[44px] border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{t('curriculum.addLesson')}</span>
          </button>
          {onOpenAiModal && (
            <button
              type="button"
              onClick={() => onOpenAiModal('add-lesson', { _id: chapterId, title: '' })}
              className="flex items-center justify-center gap-2 px-4 py-3 min-h-[44px] border-2 border-dashed border-purple-500/40 bg-purple-500/5 rounded-xl text-purple-300 hover:text-purple-200 hover:border-purple-500 hover:bg-purple-500/15 transition-all font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              add lesson using AI
            </button>
          )}
        </div>
      </div>
    </SortableContext>
  );
}

'use client';

import { useMemo } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Video, FileText, Clock, PlusCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Lesson } from '@/lib/react-query/hooks';
import { sortableId } from '@/lib/curriculum/sortable';
import { cn } from '@/lib/utils';
import { DragHandleButton, RowEditDeleteActions } from './shared';

function SortableLessonRow({
  lesson,
  onEdit,
  onDelete,
}: {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
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
      <RowEditDeleteActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

export function LessonList({
  chapterId,
  lessons,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
}: {
  chapterId: string;
  lessons: Lesson[];
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onAddLesson: (chapterId: string) => void;
}) {
  const { t } = useTranslation();
  const ids = useMemo(() => lessons.map((l) => sortableId('lesson', l._id)), [lessons]);

  return (
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
      <div className="space-y-2 min-h-[8px]">
        {lessons.map((lesson) => (
          <SortableLessonRow
            key={lesson._id}
            lesson={lesson}
            onEdit={() => onEditLesson(lesson)}
            onDelete={() => onDeleteLesson(lesson._id)}
          />
        ))}
        <button
          type="button"
          onClick={() => onAddLesson(chapterId)}
          className="w-full flex items-center justify-center gap-2 p-3 min-h-[44px] border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{t('curriculum.addLesson')}</span>
        </button>
      </div>
    </SortableContext>
  );
}

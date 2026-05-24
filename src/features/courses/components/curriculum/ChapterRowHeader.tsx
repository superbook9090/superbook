'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { useTranslation } from '@/hooks/useTranslation';
import type { Chapter } from '@/lib/react-query/hooks';
import { cn } from '@/lib/utils';
import { ChapterTitleEditor } from './ChapterTitleEditor';
import { DragHandleButton, ExpandToggleButton, RowEditDeleteActions } from './shared';

export function ChapterRowHeader({
  chapter,
  courseId,
  editingId,
  setEditingId,
  expanded,
  onToggle,
  onDelete,
  dragLabel,
  lessonCount,
  attributes,
  listeners,
  variant = 'topic',
  editLabel,
  deleteLabel,
  expandLabel,
}: {
  chapter: Chapter;
  courseId: string;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  dragLabel: string;
  lessonCount: number;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  variant?: 'topic' | 'subtopic';
  editLabel?: string;
  deleteLabel?: string;
  expandLabel?: string;
}) {
  const { t } = useTranslation();

  if (editingId === chapter._id) {
    return (
      <>
        <DragHandleButton attributes={attributes} listeners={listeners} label={dragLabel} />
        <ChapterTitleEditor chapter={chapter} courseId={courseId} onDone={() => setEditingId(null)} />
      </>
    );
  }

  return (
    <>
      <DragHandleButton attributes={attributes} listeners={listeners} label={dragLabel} />
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex-1 text-left min-h-[44px] flex items-center text-[var(--color-foreground)]',
          variant === 'topic' ? 'font-semibold' : 'text-sm font-semibold'
        )}
      >
        {chapter.title}
        <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">
          ({lessonCount} {t('curriculum.lessons')})
        </span>
      </button>
      <RowEditDeleteActions
        onEdit={() => setEditingId(chapter._id)}
        onDelete={onDelete}
        editLabel={editLabel ?? t('curriculum.editChapter')}
        deleteLabel={deleteLabel ?? t('curriculum.deleteChapterTitle')}
      />
      <ExpandToggleButton expanded={expanded} onClick={onToggle} label={expandLabel ?? t('curriculum.toggleChapter')} />
    </>
  );
}

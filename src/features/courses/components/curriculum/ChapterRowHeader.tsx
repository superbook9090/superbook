'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Chapter } from '@/lib/react-query/hooks';
import { cn } from '@/lib/utils';
import { ChapterTitleEditor } from './ChapterTitleEditor';
import { DragHandleButton, ExpandToggleButton, RowEditDeleteActions } from './shared';
import type { AiActionType } from '@/app/(dashboard)/dashboard/student/courses/[id]/_components/AiCourseActionModal';

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
  onOpenAiModal,
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
  onOpenAiModal?: (
    action: AiActionType,
    chapter?: { _id: string; title: string } | null,
    lesson?: { _id: string; title: string } | null
  ) => void;
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
          'flex-1 text-left min-h-[44px] flex items-center text-[var(--color-foreground)] min-w-0 pr-2',
          variant === 'topic' ? 'font-semibold' : 'text-sm font-semibold'
        )}
      >
        <span className="truncate">{chapter.title}</span>
        <span className="ml-2 text-xs font-normal text-[var(--color-muted)] shrink-0">
          ({lessonCount} {t('curriculum.lessons')})
        </span>
      </button>

      {onOpenAiModal && (
        <div className="flex items-center gap-1.5 shrink-0 mx-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiModal('add-lesson', chapter);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors shadow-sm"
            title="add lesson using AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">add lesson using AI</span>
            <span className="xl:hidden">+Lesson AI</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiModal('add-chapter', chapter);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors shadow-sm"
            title="add chapter using AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">add chapter using AI</span>
            <span className="xl:hidden">+Chapter AI</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAiModal('add-quiz', chapter);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 transition-colors shadow-sm"
            title="add quiz using AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden xl:inline">add quiz using AI</span>
            <span className="xl:hidden">+Quiz AI</span>
          </button>
        </div>
      )}

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

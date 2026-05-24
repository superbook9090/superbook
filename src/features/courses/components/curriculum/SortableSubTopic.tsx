'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from '@/hooks/useTranslation';
import type { Chapter, Lesson } from '@/lib/react-query/hooks';
import { sortableId } from '@/lib/curriculum/sortable';
import { cn } from '@/lib/utils';
import { ChapterRowHeader } from './ChapterRowHeader';
import { LessonList } from './LessonList';

export function SortableSubTopic({
  sub,
  courseId,
  expanded,
  onToggle,
  editingId,
  setEditingId,
  onDelete,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
}: {
  sub: Chapter;
  courseId: string;
  expanded: boolean;
  onToggle: () => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  onDelete: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (id: string) => void;
  onAddLesson: (chapterId: string) => void;
}) {
  const { t } = useTranslation();
  const id = sortableId('subtopic', sub._id);
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({ id });

  return (
    <div
      className={cn(
        'ml-4 sm:ml-6 border-l-2 border-[var(--color-primary)]/20 pl-3 sm:pl-4',
        isDragging && 'opacity-50'
      )}
    >
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Transform.toString(transform), transition }}
        className="flex items-center gap-2 p-2 bg-[var(--color-surface-muted)]/40 border border-[var(--color-border)] rounded-xl mb-2"
      >
        <ChapterRowHeader
          chapter={sub}
          courseId={courseId}
          editingId={editingId}
          setEditingId={setEditingId}
          expanded={expanded}
          onToggle={onToggle}
          onDelete={onDelete}
          dragLabel={t('curriculum.dragSubTopic')}
          lessonCount={sub.lessons?.length ?? 0}
          attributes={attributes}
          listeners={listeners}
          variant="subtopic"
          deleteLabel={t('curriculum.deleteSubTopicTitle')}
        />
      </div>
      {expanded && (
        <div className="overflow-hidden mb-3">
          <LessonList
            chapterId={sub._id}
            lessons={sub.lessons ?? []}
            onEditLesson={onEditLesson}
            onDeleteLesson={onDeleteLesson}
            onAddLesson={onAddLesson}
          />
        </div>
      )}
    </div>
  );
}

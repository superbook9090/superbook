'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useCourseCurriculum,
  useAddChapter,
  useDeleteChapter,
  useDeleteLesson,
  useReorderCurriculum,
  type Chapter,
  type Lesson,
} from '@/lib/react-query/hooks';
import { findDragLabel } from '@/lib/curriculum/dndTree';
import { sortableId } from '@/lib/curriculum/sortable';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import { SortableTopic } from './SortableTopic';
import { toggleExpanded } from './shared';
import { useCurriculumDnd } from './useCurriculumDnd';

const EMPTY_CURRICULUM: Chapter[] = [];

interface CurriculumTreeEditorProps {
  courseId: string;
  onEditLesson: (lesson: Lesson) => void;
  onAddLesson: (chapterId: string) => void;
}

type DeleteTarget =
  | { type: 'topic'; id: string }
  | { type: 'subtopic'; id: string }
  | { type: 'lesson'; id: string };

export default function CurriculumTreeEditor({
  courseId,
  onEditLesson,
  onAddLesson,
}: CurriculumTreeEditorProps) {
  const { t } = useTranslation();
  const { data: serverTree, isLoading, dataUpdatedAt } = useCourseCurriculum(courseId);
  const resolvedServerTree = serverTree ?? EMPTY_CURRICULUM;
  const addChapter = useAddChapter();
  const deleteChapter = useDeleteChapter();
  const deleteLesson = useDeleteLesson();
  const reorderCurriculum = useReorderCurriculum();

  const [localTree, setLocalTree] = useState<Chapter[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);

  const tree = localTree ?? resolvedServerTree;

  const { isDraggingRef, handleDragStart, handleDragOver, handleDragEnd } = useCurriculumDnd({
    courseId,
    tree,
    serverTree: resolvedServerTree,
    setLocalTree,
    setActiveId,
    reorderCurriculum,
  });

  useEffect(() => {
    if (!isDraggingRef.current) {
      setLocalTree(null);
    }
  }, [dataUpdatedAt, isDraggingRef]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const topicIds = useMemo(() => tree.map((topic) => sortableId('topic', topic._id)), [tree]);
  const activeLabel = activeId ? findDragLabel(tree, activeId) : null;

  const handleAddTopic = () => {
    addChapter.mutate({
      courseId,
      data: { title: t('curriculum.newChapterTitle') || 'New Topic' },
    });
  };

  const handleAddSubTopic = (parentTopicId: string) => {
    addChapter.mutate({
      courseId,
      data: { title: t('curriculum.newSubTopicTitle') || 'New Sub-topic', parentChapter: parentTopicId },
    });
    setExpanded((prev) => ({ ...prev, [parentTopicId]: true }));
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'lesson') {
      deleteLesson.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
    } else {
      deleteChapter.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
    }
  };

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">{t('curriculum.title')}</h2>
        <Button onClick={handleAddTopic} disabled={addChapter.isPending} size="sm" className="min-h-[44px]">
          <Plus className="w-4 h-4 mr-2" />
          {t('curriculum.addTopic')}
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {tree.map((topic) => (
              <SortableTopic
                key={topic._id}
                topic={topic}
                courseId={courseId}
                expanded={!!expanded[topic._id]}
                onToggle={() => toggleExpanded(setExpanded, topic._id)}
                editingId={editingId}
                setEditingId={setEditingId}
                isExpanded={(id) => !!expanded[id]}
                toggleExpanded={(id) => toggleExpanded(setExpanded, id)}
                onDelete={() => setConfirmDelete({ type: 'topic', id: topic._id })}
                onDeleteSub={(subId) => setConfirmDelete({ type: 'subtopic', id: subId })}
                onAddSubTopic={handleAddSubTopic}
                onEditLesson={onEditLesson}
                onDeleteLesson={(id) => setConfirmDelete({ type: 'lesson', id })}
                onAddLesson={onAddLesson}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeId && activeLabel ? (
            <div className="px-4 py-3 bg-[var(--card-solid)] border-2 border-[var(--color-primary)] rounded-xl shadow-xl text-sm font-semibold text-[var(--color-foreground)]">
              {activeLabel}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={
          confirmDelete?.type === 'lesson'
            ? t('curriculum.deleteLessonTitle')
            : confirmDelete?.type === 'subtopic'
              ? t('curriculum.deleteSubTopicTitle')
              : t('curriculum.deleteChapterTitle')
        }
        message={
          confirmDelete?.type === 'lesson'
            ? t('curriculum.deleteLessonMessage')
            : confirmDelete?.type === 'subtopic'
              ? t('curriculum.deleteSubTopicMessage')
              : t('curriculum.deleteChapterMessage')
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmText={t('common.delete')}
        type="danger"
        isLoading={deleteChapter.isPending || deleteLesson.isPending}
      />
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
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
import Link from 'next/link';
import { Plus, Target } from 'lucide-react';
import { buildTeacherCreateQuizUrl } from '@/lib/quiz/buildCreateQuizUrl';
import { useTranslation } from '@/hooks/useTranslation';
import {
  useCourseCurriculum,
  useAddChapter,
  useDeleteChapter,
  useDeleteLesson,
  useDeleteQuiz,
  useReorderCurriculum,
  useCourseQuizzes,
  type Chapter,
  type Lesson,
} from '@/lib/react-query/hooks';
import {
  attachQuizzesToCurriculumTree,
  type CurriculumChapterNode,
  type CurriculumQuiz,
} from '@/lib/curriculum/tree';
import { splitQuizzesByScope, toCurriculumQuiz } from '@/lib/quiz/quizCourse';
import { toIdString } from '@/lib/id';
import { CurriculumQuizBlock } from './CurriculumQuizBlock';
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
  | { type: 'lesson'; id: string }
  | { type: 'quiz'; id: string; title: string };

export default function CurriculumTreeEditor({
  courseId,
  onEditLesson,
  onAddLesson,
}: CurriculumTreeEditorProps) {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { quizzes: courseQuizzes } = useCourseQuizzes(courseId, { orgId });
  const { data: serverTree, isLoading, dataUpdatedAt } = useCourseCurriculum(courseId);
  const resolvedServerTree = serverTree ?? EMPTY_CURRICULUM;
  const addChapter = useAddChapter();
  const deleteChapter = useDeleteChapter();
  const deleteLesson = useDeleteLesson();
  const deleteQuiz = useDeleteQuiz();
  const reorderCurriculum = useReorderCurriculum();

  const [localTree, setLocalTree] = useState<Chapter[] | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<DeleteTarget | null>(null);

  const baseTree = localTree ?? resolvedServerTree;

  const { courseLevel: courseLevelQuizzes } = useMemo(
    () => splitQuizzesByScope(courseQuizzes),
    [courseQuizzes]
  );

  const displayTree = useMemo(
    () =>
      attachQuizzesToCurriculumTree(
        baseTree as unknown as CurriculumChapterNode[],
        courseQuizzes
      ) as unknown as Chapter[],
    [baseTree, courseQuizzes]
  );

  const { isDraggingRef, handleDragStart, handleDragOver, handleDragEnd } = useCurriculumDnd({
    courseId,
    tree: baseTree,
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

  const topicIds = useMemo(
    () => displayTree.map((topic) => sortableId('topic', topic._id)),
    [displayTree]
  );
  const activeLabel = activeId ? findDragLabel(baseTree, activeId) : null;

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
    } else if (confirmDelete.type === 'quiz') {
      deleteQuiz.mutate(
        { quizId: confirmDelete.id, courseId, orgId },
        { onSuccess: () => setConfirmDelete(null) }
      );
    } else {
      deleteChapter.mutate(confirmDelete.id, { onSuccess: () => setConfirmDelete(null) });
    }
  };

  const handleRequestDeleteQuiz = (quiz: CurriculumQuiz) => {
    setConfirmDelete({
      type: 'quiz',
      id: toIdString(quiz._id),
      title: quiz.title,
    });
  };

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">{t('curriculum.title')}</h2>
        <div className="flex flex-wrap gap-2">
          <Link
            href={buildTeacherCreateQuizUrl({ courseId, placement: 'course' })}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold border border-violet-200 text-violet-700 hover:bg-violet-50 transition-colors"
          >
            <Target className="w-4 h-4" />
            {t('curriculum.addQuiz')}
          </Link>
          <Button onClick={handleAddTopic} disabled={addChapter.isPending} size="sm" className="min-h-[44px]">
            <Plus className="w-4 h-4 mr-2" />
            {t('curriculum.addTopic')}
          </Button>
        </div>
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
            {displayTree.map((topic) => (
              <SortableTopic
                key={topic._id}
                topic={topic as Chapter & CurriculumChapterNode}
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
                onDeleteQuiz={handleRequestDeleteQuiz}
              />
            ))}

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <h3 className="text-sm font-semibold text-[var(--color-foreground)] mb-3">
                {t('curriculum.courseLevelQuizzes')}
              </h3>
              <CurriculumQuizBlock
                courseId={courseId}
                quizzes={courseLevelQuizzes.map((q) => toCurriculumQuiz(q, courseId))}
                placement="course"
                compact
                onDeleteQuiz={handleRequestDeleteQuiz}
              />
            </div>
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
            : confirmDelete?.type === 'quiz'
              ? t('curriculum.deleteQuizTitle')
              : confirmDelete?.type === 'subtopic'
                ? t('curriculum.deleteSubTopicTitle')
                : t('curriculum.deleteChapterTitle')
        }
        message={
          confirmDelete?.type === 'lesson'
            ? t('curriculum.deleteLessonMessage')
            : confirmDelete?.type === 'quiz'
              ? `${t('curriculum.deleteQuizMessage')} "${confirmDelete.title}"`
              : confirmDelete?.type === 'subtopic'
                ? t('curriculum.deleteSubTopicMessage')
                : t('curriculum.deleteChapterMessage')
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        type="danger"
        isLoading={deleteChapter.isPending || deleteLesson.isPending || deleteQuiz.isPending}
      />
    </div>
  );
}

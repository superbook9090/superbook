'use client';

import { useCallback, useRef } from 'react';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import type { Chapter } from '@/lib/react-query/hooks';
import {
  buildReorderPayload,
  findLessonContainer,
  moveLessonBetweenContainers,
  reorderInContainer,
  resolveLessonDropContainer,
} from '@/lib/curriculum/reorderPayload';
import { curriculumSnapshot, getBaseTree } from '@/lib/curriculum/dndTree';
import { parseSortableId, sortableId, subtopicContainerId, TOPICS_CONTAINER } from '@/lib/curriculum/sortable';

type ReorderMutate = (args: { courseId: string; data: ReturnType<typeof buildReorderPayload> }) => void;

export function useCurriculumDnd({
  courseId,
  tree,
  serverTree,
  setLocalTree,
  setActiveId,
  reorderCurriculum,
}: {
  courseId: string;
  tree: Chapter[];
  serverTree: Chapter[];
  setLocalTree: React.Dispatch<React.SetStateAction<Chapter[] | null>>;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  reorderCurriculum: { mutate: ReorderMutate };
}) {
  const isDraggingRef = useRef(false);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      isDraggingRef.current = true;
      setActiveId(String(event.active.id));
    },
    [setActiveId]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeSortableId = String(active.id);
      const overSortableId = String(over.id);
      const activeParsed = parseSortableId(activeSortableId);
      if (activeParsed?.type !== 'lesson') return;

      const fromContainer = findLessonContainer(tree, activeSortableId);
      const toContainer = resolveLessonDropContainer(tree, overSortableId);
      if (!fromContainer || !toContainer || fromContainer === toContainer) return;

      setLocalTree((prev) => {
        const base = getBaseTree(prev, serverTree);
        const next = moveLessonBetweenContainers(
          base,
          activeParsed.entityId,
          fromContainer,
          toContainer,
          overSortableId
        );
        if (curriculumSnapshot(base) === curriculumSnapshot(next)) return prev;
        return next;
      });
    },
    [tree, serverTree, setLocalTree]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      isDraggingRef.current = false;
      setActiveId(null);
      if (!over || active.id === over.id) return;

      const activeSortableId = String(active.id);
      const overSortableId = String(over.id);
      const activeParsed = parseSortableId(activeSortableId);
      if (!activeParsed) return;

      const commit = (nextTree: Chapter[]) => {
        reorderCurriculum.mutate({ courseId, data: buildReorderPayload(nextTree) });
        return nextTree;
      };

      if (activeParsed.type === 'lesson') {
        setLocalTree((prev) => {
          const base = getBaseTree(prev, serverTree);
          const container = findLessonContainer(base, activeSortableId);
          const nextTree =
            container && active.id !== over.id
              ? reorderInContainer(base, container, activeSortableId, overSortableId)
              : base;
          return commit(nextTree);
        });
        return;
      }

      if (activeParsed.type === 'topic') {
        setLocalTree((prev) => {
          const base = getBaseTree(prev, serverTree);
          return commit(reorderInContainer(base, TOPICS_CONTAINER, activeSortableId, overSortableId));
        });
        return;
      }

      if (activeParsed.type === 'subtopic') {
        setLocalTree((prev) => {
          const base = getBaseTree(prev, serverTree);
          for (const topic of base) {
            if (!topic.subChapters?.some((s) => sortableId('subtopic', s._id) === activeSortableId)) continue;
            return commit(
              reorderInContainer(base, subtopicContainerId(topic._id), activeSortableId, overSortableId)
            );
          }
          return prev;
        });
      }
    },
    [courseId, serverTree, setActiveId, setLocalTree, reorderCurriculum]
  );

  return { isDraggingRef, handleDragStart, handleDragOver, handleDragEnd };
}

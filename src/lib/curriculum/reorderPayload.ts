import type { Chapter, Lesson } from '@/lib/react-query/hooks';
import { findParentTopicId } from '@/lib/curriculum/dndTree';
import {
  lessonContainerId,
  parseSortableId,
  subtopicContainerId,
  TOPICS_CONTAINER,
} from '@/lib/curriculum/sortable';

export type ReorderPayload = {
  chapters: { id: string; order: number; parentChapter: string | null }[];
  lessons: { id: string; order: number; chapterId: string }[];
};

/** Build a bulk reorder payload from the current in-memory tree. */
export function buildReorderPayload(tree: Chapter[]): ReorderPayload {
  const chapters: ReorderPayload['chapters'] = [];
  const lessons: ReorderPayload['lessons'] = [];

  tree.forEach((topic, topicIndex) => {
    chapters.push({
      id: topic._id,
      order: topicIndex,
      parentChapter: null,
    });

    topic.lessons?.forEach((lesson, lessonIndex) => {
      lessons.push({
        id: lesson._id,
        order: lessonIndex,
        chapterId: topic._id,
      });
    });

    topic.subChapters?.forEach((sub, subIndex) => {
      chapters.push({
        id: sub._id,
        order: subIndex,
        parentChapter: topic._id,
      });

      sub.lessons?.forEach((lesson, lessonIndex) => {
        lessons.push({
          id: lesson._id,
          order: lessonIndex,
          chapterId: sub._id,
        });
      });
    });
  });

  return { chapters, lessons };
}

export function findLessonContainer(tree: Chapter[], sortableId: string): string | null {
  const parsed = parseSortableId(sortableId);
  if (!parsed) {
    if (sortableId.startsWith('lessons:')) return sortableId;
    if (sortableId.startsWith('subtopics:')) return null;
    return null;
  }

  if (parsed.type === 'lesson') {
    for (const topic of tree) {
      if (topic.lessons?.some((l) => l._id === parsed.entityId)) {
        return lessonContainerId(topic._id);
      }
      for (const sub of topic.subChapters ?? []) {
        if (sub.lessons?.some((l) => l._id === parsed.entityId)) {
          return lessonContainerId(sub._id);
        }
      }
    }
  }

  if (parsed.type === 'subtopic') {
    return subtopicContainerId(findParentTopicId(tree, parsed.entityId) ?? '');
  }

  return null;
}

/** Move a lesson between chapter containers in local tree state. */
export function moveLessonBetweenContainers(
  tree: Chapter[],
  lessonId: string,
  fromContainer: string,
  toContainer: string,
  overSortableId?: string
): Chapter[] {
  if (fromContainer === toContainer) return tree;

  const toChapterId = toContainer.replace('lessons:', '');

  let movedLesson: Lesson | undefined;
  const without = tree.map((topic) => {
    const strip = (lessons: Lesson[] = []) =>
      lessons.filter((l) => {
        if (l._id === lessonId) {
          movedLesson = l;
          return false;
        }
        return true;
      });

    return {
      ...topic,
      lessons: strip(topic.lessons ?? []),
      subChapters: topic.subChapters?.map((sub) => ({
        ...sub,
        lessons: strip(sub.lessons ?? []),
      })),
    };
  });

  if (!movedLesson) return tree;

  const insertAt = (lessons: NonNullable<Chapter['lessons']>, overId?: string) => {
    if (!overId) return [...lessons, movedLesson!];
    const parsed = parseSortableId(overId);
    if (parsed?.type === 'lesson') {
      const idx = lessons.findIndex((l) => l._id === parsed.entityId);
      if (idx >= 0) {
        const next = [...lessons];
        next.splice(idx, 0, movedLesson!);
        return next;
      }
    }
    return [...lessons, movedLesson!];
  };

  return without.map((topic) => {
    if (topic._id === toChapterId) {
      return { ...topic, lessons: insertAt(topic.lessons ?? [], overSortableId) };
    }
    return {
      ...topic,
      subChapters: topic.subChapters?.map((sub) =>
        sub._id === toChapterId
          ? { ...sub, lessons: insertAt(sub.lessons ?? [], overSortableId) }
          : sub
      ),
    };
  });
}

/** Reorder items within a single sortable list. */
export function reorderInContainer(
  tree: Chapter[],
  containerId: string,
  activeId: string,
  overId: string
): Chapter[] {
  if (activeId === overId) return tree;

  const parsedActive = parseSortableId(activeId);
  const parsedOver = parseSortableId(overId);
  if (!parsedActive || !parsedOver || parsedActive.type !== parsedOver.type) return tree;

  if (containerId === TOPICS_CONTAINER && parsedActive.type === 'topic') {
    const ids = tree.map((t) => t._id);
    return reorderByIds(tree, ids, parsedActive.entityId, parsedOver.entityId);
  }

  if (containerId.startsWith('subtopics:') && parsedActive.type === 'subtopic') {
    const topicId = containerId.replace('subtopics:', '');
    return tree.map((topic) => {
      if (topic._id !== topicId || !topic.subChapters) return topic;
      const ids = topic.subChapters.map((s) => s._id);
      return {
        ...topic,
        subChapters: reorderByIds(topic.subChapters, ids, parsedActive.entityId, parsedOver.entityId),
      };
    });
  }

  if (containerId.startsWith('lessons:') && parsedActive.type === 'lesson') {
    const chapterId = containerId.replace('lessons:', '');
    return tree.map((topic) => {
      if (topic._id === chapterId && topic.lessons) {
        const ids = topic.lessons.map((l) => l._id);
        return { ...topic, lessons: reorderByIds(topic.lessons, ids, parsedActive.entityId, parsedOver.entityId) };
      }
      return {
        ...topic,
        subChapters: topic.subChapters?.map((sub) => {
          if (sub._id === chapterId && sub.lessons) {
            const ids = sub.lessons.map((l) => l._id);
            return { ...sub, lessons: reorderByIds(sub.lessons, ids, parsedActive.entityId, parsedOver.entityId) };
          }
          return sub;
        }),
      };
    });
  }

  return tree;
}

function reorderByIds<T extends { _id: string }>(
  items: T[],
  ids: string[],
  activeId: string,
  overId: string
): T[] {
  const oldIndex = ids.indexOf(activeId);
  const newIndex = ids.indexOf(overId);
  if (oldIndex < 0 || newIndex < 0) return items;

  const next = [...items];
  const [removed] = next.splice(oldIndex, 1);
  next.splice(newIndex, 0, removed);
  return next;
}

/** Resolve drop target lesson container from any sortable/droppable id. */
export function resolveLessonDropContainer(tree: Chapter[], overId: string): string | null {
  if (overId.startsWith('lessons:')) return overId;

  const parsed = parseSortableId(overId);
  if (!parsed) return null;

  if (parsed.type === 'lesson') {
    return findLessonContainer(tree, overId);
  }
  if (parsed.type === 'subtopic' || parsed.type === 'topic') {
    return lessonContainerId(parsed.entityId);
  }

  return null;
}

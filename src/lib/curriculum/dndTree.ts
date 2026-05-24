import type { Chapter } from '@/lib/react-query/hooks';
import { buildReorderPayload } from '@/lib/curriculum/reorderPayload';
import { parseSortableId } from '@/lib/curriculum/sortable';

export function cloneTree(tree: Chapter[]): Chapter[] {
  return tree.map((topic) => ({
    ...topic,
    lessons: topic.lessons ? [...topic.lessons] : [],
    subChapters: topic.subChapters?.map((sub) => ({
      ...sub,
      lessons: sub.lessons ? [...sub.lessons] : [],
    })),
  }));
}

export function curriculumSnapshot(tree: Chapter[]): string {
  return JSON.stringify(buildReorderPayload(tree));
}

export function getBaseTree(localTree: Chapter[] | null, serverTree: Chapter[]): Chapter[] {
  return localTree ?? cloneTree(serverTree);
}

/** Title for drag overlay from active sortable id. */
export function findDragLabel(tree: Chapter[], activeId: string): string | null {
  const parsed = parseSortableId(activeId);
  if (!parsed) return null;

  if (parsed.type === 'topic') {
    return tree.find((topic) => topic._id === parsed.entityId)?.title ?? null;
  }

  if (parsed.type === 'subtopic') {
    for (const topic of tree) {
      const sub = topic.subChapters?.find((s) => s._id === parsed.entityId);
      if (sub) return sub.title;
    }
    return null;
  }

  for (const topic of tree) {
    const lesson = topic.lessons?.find((l) => l._id === parsed.entityId);
    if (lesson) return lesson.title;
    for (const sub of topic.subChapters ?? []) {
      const subLesson = sub.lessons?.find((l) => l._id === parsed.entityId);
      if (subLesson) return subLesson.title;
    }
  }

  return null;
}

export function findParentTopicId(tree: Chapter[], subChapterId: string): string | null {
  for (const topic of tree) {
    if (topic.subChapters?.some((s) => s._id === subChapterId)) {
      return topic._id;
    }
  }
  return null;
}

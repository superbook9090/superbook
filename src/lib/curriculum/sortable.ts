export type SortableKind = 'topic' | 'subtopic' | 'lesson';

export type ParsedSortableId = {
  type: SortableKind;
  entityId: string;
};

export const TOPICS_CONTAINER = 'topics';

export function sortableId(type: SortableKind, id: string): string {
  return `${type}:${id}`;
}

export function parseSortableId(id: string): ParsedSortableId | null {
  const [type, entityId] = id.split(':');
  if (!entityId) return null;
  if (type === 'topic' || type === 'subtopic' || type === 'lesson') {
    return { type, entityId };
  }
  return null;
}

export function lessonContainerId(chapterId: string): string {
  return `lessons:${chapterId}`;
}

export function subtopicContainerId(topicId: string): string {
  return `subtopics:${topicId}`;
}

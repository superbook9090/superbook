import type { Types } from 'mongoose';

export interface CurriculumLesson {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  youtubeVideoId?: string;
  duration: number;
  order: number;
  isPublished: boolean;
  isPreview?: boolean;
  course: string;
  chapter: string;
}

export interface CurriculumChapterNode {
  _id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  course: string;
  parentChapter?: string | null;
  lessons: CurriculumLesson[];
  subChapters: CurriculumChapterNode[];
}

type RawChapter = {
  _id: Types.ObjectId | string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  course: Types.ObjectId | string;
  parentChapter?: Types.ObjectId | string | null;
};

type RawLesson = CurriculumLesson & {
  chapter: Types.ObjectId | string;
};

function toId(value: Types.ObjectId | string): string {
  return value.toString();
}

function sortByOrder<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

/** Build a two-level topic tree from flat chapter on lessons. */
export function buildCurriculumTree(
  chapters: RawChapter[],
  lessons: RawLesson[]
): CurriculumChapterNode[] {
  const lessonsByChapter = new Map<string, CurriculumLesson[]>();

  for (const lesson of lessons) {
    const chapterId = toId(lesson.chapter);
    const normalized: CurriculumLesson = {
      ...lesson,
      _id: toId(lesson._id),
      course: toId(lesson.course),
      chapter: chapterId,
    };
    const bucket = lessonsByChapter.get(chapterId) ?? [];
    bucket.push(normalized);
    lessonsByChapter.set(chapterId, bucket);
  }

  const nodeMap = new Map<string, CurriculumChapterNode>();

  for (const chapter of chapters) {
    const id = toId(chapter._id);
    nodeMap.set(id, {
      _id: id,
      title: chapter.title,
      summary: chapter.summary,
      order: chapter.order,
      lessonCount: chapter.lessonCount,
      course: toId(chapter.course),
      parentChapter: chapter.parentChapter ? toId(chapter.parentChapter) : null,
      lessons: sortByOrder(lessonsByChapter.get(id) ?? []),
      subChapters: [],
    });
  }

  const roots: CurriculumChapterNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentChapter) {
      const parent = nodeMap.get(node.parentChapter);
      if (parent) {
        parent.subChapters.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  for (const node of nodeMap.values()) {
    node.subChapters = sortByOrder(node.subChapters);
  }

  return sortByOrder(roots);
}

/** Flatten all lessons in curriculum order (topic → lessons → sub-topic → lessons). */
export function flattenCurriculumLessons<T extends { _id: string }>(
  tree: Array<{
    lessons?: T[];
    subChapters?: Array<{ lessons?: T[] }>;
  }>
): T[] {
  const result: T[] = [];

  for (const topic of tree) {
    result.push(...(topic.lessons ?? []));
    for (const sub of topic.subChapters ?? []) {
      result.push(...(sub.lessons ?? []));
    }
  }

  return result;
}

/** Count lessons in a topic including sub-topics. */
export function countTopicLessons(topic: {
  lessons?: { _id: string }[];
  subChapters?: Array<{ lessons?: { _id: string }[] }>;
}): number {
  const subTotal = (topic.subChapters ?? []).reduce(
    (sum, sub) => sum + (sub.lessons?.length ?? 0),
    0
  );
  return (topic.lessons?.length ?? 0) + subTotal;
}

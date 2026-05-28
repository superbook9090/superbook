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
  quizzes: CurriculumQuiz[];
}

/** Quiz metadata attached to curriculum nodes (full attempt flow unchanged). */
export interface CurriculumQuiz {
  _id: string;
  title: string;
  description?: string;
  timeLimit: number;
  questionCount?: number;
  isPublished: boolean;
  course: string;
  chapter: string | null;
  lesson: string | null;
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
  quizzes: CurriculumQuiz[];
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
      quizzes: [],
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
      quizzes: [],
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

type RawQuiz = {
  _id: Types.ObjectId | string;
  title: string;
  description?: string;
  timeLimit: number;
  questionCount?: number;
  isPublished: boolean;
  course: Types.ObjectId | string | { _id: Types.ObjectId | string };
  chapter?: Types.ObjectId | string | { _id: Types.ObjectId | string } | null;
  lesson?: Types.ObjectId | string | { _id: Types.ObjectId | string } | null;
};

function normalizeRawQuiz(quiz: RawQuiz): CurriculumQuiz {
  const chapterId = quiz.chapter
    ? toId(
        typeof quiz.chapter === 'object' && quiz.chapter !== null && '_id' in quiz.chapter
          ? quiz.chapter._id
          : quiz.chapter
      )
    : null;
  const lessonId = quiz.lesson
    ? toId(
        typeof quiz.lesson === 'object' && quiz.lesson !== null && '_id' in quiz.lesson
          ? quiz.lesson._id
          : quiz.lesson
      )
    : null;

  return {
    _id: toId(quiz._id),
    title: quiz.title,
    description: quiz.description,
    timeLimit: quiz.timeLimit,
    questionCount: quiz.questionCount,
    isPublished: quiz.isPublished,
    course: toId(
      typeof quiz.course === 'object' && quiz.course !== null && '_id' in quiz.course
        ? quiz.course._id
        : quiz.course
    ),
    chapter: chapterId,
    lesson: lessonId,
  };
}

function mergeCurriculumQuizzes(
  existing: CurriculumQuiz[] = [],
  incoming: CurriculumQuiz[] = []
): CurriculumQuiz[] {
  if (!incoming.length) return existing;
  const byId = new Map(existing.map((q) => [q._id, q]));
  for (const q of incoming) byId.set(q._id, q);
  return Array.from(byId.values());
}

/** Attach quizzes to chapter/subtopic nodes and to lessons (course-level excluded). */
export function attachQuizzesToCurriculumTree(
  tree: CurriculumChapterNode[],
  quizzes: RawQuiz[]
): CurriculumChapterNode[] {
  const quizzesByChapter = new Map<string, CurriculumQuiz[]>();
  const quizzesByLesson = new Map<string, CurriculumQuiz[]>();

  for (const quiz of quizzes) {
    const normalized = normalizeRawQuiz(quiz);
    if (normalized.lesson) {
      const bucket = quizzesByLesson.get(normalized.lesson) ?? [];
      bucket.push(normalized);
      quizzesByLesson.set(normalized.lesson, bucket);
      continue;
    }
    if (!normalized.chapter) continue;
    const bucket = quizzesByChapter.get(normalized.chapter) ?? [];
    bucket.push(normalized);
    quizzesByChapter.set(normalized.chapter, bucket);
  }

  const attachLessons = (lessons: CurriculumLesson[]): CurriculumLesson[] =>
    lessons.map((lesson) => ({
      ...lesson,
      quizzes: mergeCurriculumQuizzes(
        lesson.quizzes,
        quizzesByLesson.get(lesson._id) ?? []
      ),
    }));

  const attachToNode = (node: CurriculumChapterNode): CurriculumChapterNode => ({
    ...node,
    quizzes: mergeCurriculumQuizzes(node.quizzes, quizzesByChapter.get(node._id) ?? []),
    lessons: attachLessons(node.lessons),
    subChapters: node.subChapters.map(attachToNode),
  });

  return tree.map(attachToNode);
}

export type ChapterSelectOption = { id: string; label: string };
export type LessonSelectOption = { id: string; label: string };

/** Flatten topic + sub-topic rows for chapter dropdowns in teacher forms. */
export function flattenChapterSelectOptions(
  tree: Array<{
    _id: string;
    title: string;
    subChapters?: Array<{ _id: string; title: string }>;
  }>
): ChapterSelectOption[] {
  const options: ChapterSelectOption[] = [];
  for (const topic of tree) {
    options.push({ id: topic._id, label: topic.title });
    for (const sub of topic.subChapters ?? []) {
      options.push({ id: sub._id, label: `↳ ${sub.title}` });
    }
  }
  return options;
}

/** Flatten lessons under topics and subtopics for lesson-scoped quiz assignment. */
export function flattenLessonSelectOptions(
  tree: Array<{
    _id: string;
    title: string;
    lessons?: Array<{ _id: string; title: string }>;
    subChapters?: Array<{
      _id: string;
      title: string;
      lessons?: Array<{ _id: string; title: string }>;
    }>;
  }>
): LessonSelectOption[] {
  const options: LessonSelectOption[] = [];

  for (const topic of tree) {
    for (const lesson of topic.lessons ?? []) {
      options.push({
        id: lesson._id,
        label: `${topic.title} › ${lesson.title}`,
      });
    }
    for (const sub of topic.subChapters ?? []) {
      for (const lesson of sub.lessons ?? []) {
        options.push({
          id: lesson._id,
          label: `${topic.title} › ${sub.title} › ${lesson.title}`,
        });
      }
    }
  }

  return options;
}

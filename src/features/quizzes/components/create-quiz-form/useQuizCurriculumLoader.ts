'use client';

import { useState, useEffect } from 'react';
import { getCourseCurriculum } from '@/lib/api/courses';
import {
  flattenChapterSelectOptions,
  flattenLessonSelectOptions,
  type ChapterSelectOption,
  type LessonSelectOption,
} from '@/lib/curriculum/tree';
import type { Chapter } from '@/lib/react-query/hooks';

export function useQuizCurriculumLoader(courseId: string) {
  const [chapterOptions, setChapterOptions] = useState<ChapterSelectOption[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonSelectOption[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);

  useEffect(() => {
    if (!courseId) {
      setChapterOptions([]);
      setLessonOptions([]);
      return;
    }

    let cancelled = false;
    const loadChapters = async () => {
      setChaptersLoading(true);
      try {
        const tree = (await getCourseCurriculum(courseId)) as Chapter[];
        if (!cancelled) {
          setChapterOptions(flattenChapterSelectOptions(tree));
          setLessonOptions(flattenLessonSelectOptions(tree));
        }
      } catch {
        if (!cancelled) {
          setChapterOptions([]);
          setLessonOptions([]);
        }
      } finally {
        if (!cancelled) setChaptersLoading(false);
      }
    };

    void loadChapters();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  return { chapterOptions, lessonOptions, chaptersLoading };
}

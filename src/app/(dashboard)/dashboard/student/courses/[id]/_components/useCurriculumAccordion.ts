'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

export function useCurriculumAccordion(curriculum: Array<{ _id: string }> = []) {
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (curriculum.length > 0 && Object.keys(expandedChapters).length === 0) {
      const initial: Record<string, boolean> = {};
      curriculum.forEach((ch, idx) => {
        initial[ch._id] = idx === 0 || curriculum.length <= 4;
      });
      setExpandedChapters(initial);
    }
  }, [curriculum, expandedChapters]);

  const allExpanded = useMemo(() => {
    if (!curriculum.length) return false;
    return curriculum.every((ch) => expandedChapters[ch._id]);
  }, [curriculum, expandedChapters]);

  const toggleAllChapters = useCallback(() => {
    const nextState = !allExpanded;
    const updated: Record<string, boolean> = {};
    curriculum.forEach((ch) => {
      updated[ch._id] = nextState;
    });
    setExpandedChapters(updated);
  }, [allExpanded, curriculum]);

  const toggleChapter = useCallback((chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  }, []);

  return { expandedChapters, allExpanded, toggleAllChapters, toggleChapter };
}

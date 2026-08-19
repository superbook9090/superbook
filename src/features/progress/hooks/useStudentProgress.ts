'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchStudentProgress } from '@/lib/api/progress';
import { ApiClientError } from '@/lib/api/http';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import type { StudentCourseItem, StudentOverallStats } from '../types';

export function useStudentProgress() {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [progressData, setProgressData] = useState<StudentCourseItem[]>([]);
  const [overallStats, setOverallStats] = useState<StudentOverallStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest_progress' | 'lowest_progress' | 'highest_score'>('recent');
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<StudentCourseItem | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = (await fetchStudentProgress()) as {
        progress?: StudentCourseItem[];
        overallStats?: StudentOverallStats;
      };
      setProgressData(data.progress || []);
      setOverallStats(data.overallStats || null);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : t('progress.errorLoadingProgress');
      addAlert({ type: 'error', message: msg, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [addAlert, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredCourses = useMemo(() => {
    let list = [...progressData];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((item) =>
        item.course.title.toLowerCase().includes(q) ||
        (item.course.category && item.course.category.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter((item) => item.enrollment.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === 'highest_progress') return b.enrollment.progress - a.enrollment.progress;
      if (sortBy === 'lowest_progress') return a.enrollment.progress - b.enrollment.progress;
      if (sortBy === 'highest_score') return b.quizStats.averageScore - a.quizStats.averageScore;
      return new Date(b.enrollment.enrolledAt).getTime() - new Date(a.enrollment.enrolledAt).getTime();
    });

    return list;
  }, [progressData, searchQuery, statusFilter, sortBy]);

  const scoreTrendData = useMemo(() => {
    if (!progressData.length) return [];
    const allAttempts = progressData.flatMap((c) => c.attempts || []);
    return allAttempts.map((att) => ({
      date: att.submittedAt,
      score: att.score,
      quizTitle: att.quizTitle,
    }));
  }, [progressData]);

  const courseProgressData = useMemo(() => {
    if (!progressData.length) return [];
    return progressData.map((c) => ({
      courseTitle: c.course.title,
      progress: c.enrollment.progress,
      status: (c.enrollment.status === 'completed'
        ? 'completed'
        : c.enrollment.status === 'active'
        ? 'active'
        : 'inactive') as 'completed' | 'active' | 'inactive',
    }));
  }, [progressData]);

  const quizStatusData = useMemo(() => {
    if (!progressData.length) return [];
    const total = progressData.reduce((sum, c) => sum + (c.quizStats?.total || 0), 0);
    const completed = progressData.reduce((sum, c) => sum + (c.quizStats?.completed || 0), 0);
    return [
      { name: 'completed', value: completed, color: 'var(--success)' },
      { name: 'inProgress', value: Math.max(0, total - completed), color: 'var(--warning)' },
    ];
  }, [progressData]);

  const averageScoreData = useMemo(() => {
    if (!progressData.length) return [];
    const allAttempts = progressData.flatMap((c) => c.attempts || []).filter(Boolean);
    const grouped = allAttempts.reduce((acc, att) => {
      const d = new Date(att.submittedAt).toLocaleDateString();
      if (!acc[d]) acc[d] = [];
      acc[d].push(att.score);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(grouped)
      .map(([date, scores]) => ({
        date,
        averageScore: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
        movingAverage: Math.round(scores.reduce((s, x) => s + x, 0) / scores.length),
        attemptCount: scores.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [progressData]);

  return {
    progressData,
    overallStats,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    selectedCourseForModal,
    setSelectedCourseForModal,
    filteredCourses,
    scoreTrendData,
    courseProgressData,
    quizStatusData,
    averageScoreData,
    refetch: loadData,
  };
}

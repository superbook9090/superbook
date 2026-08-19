'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchTeacherProgress, fetchStudentProgressDrilldown } from '@/lib/api/progress';
import { ApiClientError } from '@/lib/api/http';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import type {
  TeacherCourseOption,
  TeacherStudentRow,
  TeacherOverallStats,
  StudentCourseItem,
  StudentOverallStats,
} from '../types';

export function useTeacherProgress() {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [courses, setCourses] = useState<TeacherCourseOption[]>([]);
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [overallStats, setOverallStats] = useState<TeacherOverallStats | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'struggling' | 'in_progress' | 'completed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Student Drilldown Modal State
  const [drilldownStudent, setDrilldownStudent] = useState<{ id: string; name: string } | null>(null);
  const [drilldownCourses, setDrilldownCourses] = useState<StudentCourseItem[]>([]);
  const [drilldownStats, setDrilldownStats] = useState<StudentOverallStats | null>(null);
  const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = (await fetchTeacherProgress({
        courseId: selectedCourseId || undefined,
        search: searchQuery || undefined,
      })) as {
        courses?: TeacherCourseOption[];
        students?: TeacherStudentRow[];
        overallStats?: TeacherOverallStats;
      };

      setCourses(data.courses || []);
      setStudents(data.students || []);
      setOverallStats(data.overallStats || null);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : t('progress.errorLoadingProgress');
      addAlert({ type: 'error', message: msg, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseId, searchQuery, addAlert, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStudents = useMemo(() => {
    let list = [...students];

    if (statusFilter === 'struggling') {
      list = list.filter((s) => s.progress < 25);
    } else if (statusFilter === 'in_progress') {
      list = list.filter((s) => s.progress >= 25 && s.progress < 100);
    } else if (statusFilter === 'completed') {
      list = list.filter((s) => s.progress >= 100 || s.status === 'completed');
    }

    return list;
  }, [students, statusFilter]);

  const inspectStudent = async (studentId: string, studentName: string) => {
    setDrilldownStudent({ id: studentId, name: studentName });
    setIsDrilldownLoading(true);
    try {
      const res = (await fetchStudentProgressDrilldown(studentId, {
        courseId: selectedCourseId || undefined,
      })) as {
        progress?: StudentCourseItem[];
        overallStats?: StudentOverallStats;
      };
      setDrilldownCourses(res.progress || []);
      setDrilldownStats(res.overallStats || null);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : t('progress.errorLoadingProgress');
      addAlert({ type: 'error', message: msg, duration: 4000 });
    } finally {
      setIsDrilldownLoading(false);
    }
  };

  const closeDrilldown = () => {
    setDrilldownStudent(null);
    setDrilldownCourses([]);
    setDrilldownStats(null);
  };

  return {
    courses,
    students: filteredStudents,
    rawStudentsCount: students.length,
    overallStats,
    selectedCourseId,
    setSelectedCourseId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    isLoading,
    drilldownStudent,
    drilldownCourses,
    drilldownStats,
    isDrilldownLoading,
    inspectStudent,
    closeDrilldown,
    refetch: loadData,
  };
}

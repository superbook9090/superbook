'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchAdminProgress, fetchStudentProgressDrilldown } from '@/lib/api/progress';
import { ApiClientError } from '@/lib/api/http';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import type {
  AdminOverallStats,
  AdminCourseHealth,
  TeacherStudentRow,
  StudentCourseItem,
  StudentOverallStats,
} from '../types';

export function useAdminProgress() {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [overallStats, setOverallStats] = useState<AdminOverallStats | null>(null);
  const [courseHealth, setCourseHealth] = useState<AdminCourseHealth[]>([]);
  const [students, setStudents] = useState<TeacherStudentRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Drilldown
  const [drilldownStudent, setDrilldownStudent] = useState<{ id: string; name: string } | null>(null);
  const [drilldownCourses, setDrilldownCourses] = useState<StudentCourseItem[]>([]);
  const [drilldownStats, setDrilldownStats] = useState<StudentOverallStats | null>(null);
  const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = (await fetchAdminProgress({
        search: searchQuery || undefined,
      })) as {
        overallStats?: AdminOverallStats;
        courseHealth?: AdminCourseHealth[];
        students?: TeacherStudentRow[];
      };

      setOverallStats(data.overallStats || null);
      setCourseHealth(data.courseHealth || []);
      setStudents(data.students || []);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : t('progress.errorLoadingProgress');
      addAlert({ type: 'error', message: msg, duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, addAlert, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const inspectStudent = async (studentId: string, studentName: string) => {
    setDrilldownStudent({ id: studentId, name: studentName });
    setIsDrilldownLoading(true);
    try {
      const res = (await fetchStudentProgressDrilldown(studentId)) as {
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
    overallStats,
    courseHealth,
    students,
    searchQuery,
    setSearchQuery,
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

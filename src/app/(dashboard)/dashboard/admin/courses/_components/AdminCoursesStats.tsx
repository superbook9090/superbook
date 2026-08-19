'use client';

import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Course } from '@/types';

interface AdminCoursesStatsProps {
  courses: Course[];
}

export default function AdminCoursesStats({ courses }: AdminCoursesStatsProps) {
  const { t } = useTranslation();

  const totalCourses = courses.length;
  const publishedCount = courses.filter((c) => c.isPublished).length;
  const draftCount = courses.filter((c) => !c.isPublished).length;
  const totalEnrollments = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={BookOpen}
        value={totalCourses}
        label={t('admin.totalCourses')}
        color="info"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={publishedCount}
        label={t('common.published')}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Clock}
        value={draftCount}
        label={t('common.draft')}
        color="warning"
        delay={0.15}
      />
      <StatCard
        icon={Users}
        value={totalEnrollments}
        label={t('admin.enrollments')}
        color="student"
        delay={0.2}
      />
    </ResponsiveGrid>
  );
}

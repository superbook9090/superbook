'use client';

import { BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { ResponsiveGrid } from '@/components/layout';
import { useTranslation } from '@/hooks/useTranslation';
import type { Course } from '@/lib/react-query/hooks';

interface TeacherCoursesStatsProps {
  courses: Course[];
}

export default function TeacherCoursesStats({ courses }: TeacherCoursesStatsProps) {
  const { t } = useTranslation();

  const totalCourses = courses.length;
  const publishedCount = courses.filter((c) => c.isPublished).length;
  const draftCount = courses.filter((c) => !c.isPublished).length;
  const totalStudents = courses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  return (
    <ResponsiveGrid variant="cards">
      <StatCard
        icon={BookOpen}
        value={totalCourses}
        label={t('teacherCourses.totalCourses')}
        color="teacher"
        delay={0.05}
      />
      <StatCard
        icon={CheckCircle}
        value={publishedCount}
        label={t('teacherCourses.publishedCourses')}
        color="success"
        delay={0.1}
      />
      <StatCard
        icon={Clock}
        value={draftCount}
        label={t('teacherCourses.draftCourses')}
        color="warning"
        delay={0.15}
      />
      <StatCard
        icon={Users}
        value={totalStudents}
        label={t('teacherCourses.totalStudents')}
        color="student"
        delay={0.2}
      />
    </ResponsiveGrid>
  );
}

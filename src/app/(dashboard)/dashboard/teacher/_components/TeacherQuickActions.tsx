'use client';

import {
  BookOpen,
  HelpCircle,
  BarChart3,
  Plus,
  PenTool,
  Notebook,
  Trophy,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { useFeature } from '@/contexts/AppSettingsContext';
import { ResponsiveGrid } from '@/components/layout';
import QuickActionCard from '@/components/ui/QuickActionCard';

interface TeacherQuickActionsProps {
  isAtCourseLimit: boolean;
  isAtBlogLimit: boolean;
}

export default function TeacherQuickActions({
  isAtCourseLimit,
  isAtBlogLimit,
}: TeacherQuickActionsProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableAnalytics = useFeature('enableAnalytics');
  const enableBlogs = useFeature('enableBlogs');
  const enableNotes = useFeature('enableNotes');
  const enableContests = useFeature('enableContests');

  return (
    <section aria-labelledby="teacher-quick-actions-heading" className="space-y-3 sm:space-y-4">
      <div>
        <h2
          id="teacher-quick-actions-heading"
          className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
        >
          {t('dashboard.quickActions')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
          {t('dashboard.manageContent')}
        </p>
      </div>

      <ResponsiveGrid variant="cards">
        {enableCourses && (
          <QuickActionCard
            icon={BookOpen}
            title={t('dashboard.manageCourses')}
            description={t('dashboard.viewAndEdit')}
            href={ROUTES.teacher.courses}
            color="teacher"
            delay={0.04}
          />
        )}

        {enableQuizzes && (
          <QuickActionCard
            icon={HelpCircle}
            title={t('dashboard.manageQuizzes')}
            description={t('dashboard.createAndReview')}
            href={ROUTES.teacher.quizzes}
            color="success"
            delay={0.08}
          />
        )}

        {enableContests && (
          <QuickActionCard
            icon={Trophy}
            title={t('common.contests')}
            description={t('contest.teacherContestsDesc')}
            href={ROUTES.teacher.contests}
            color="error"
            delay={0.12}
          />
        )}

        {enableAnalytics && (
          <QuickActionCard
            icon={BarChart3}
            title={t('dashboard.analytics')}
            description={t('dashboard.viewInsights')}
            href={ROUTES.teacher.analytics}
            color="info"
            delay={0.16}
          />
        )}

        <QuickActionCard
          icon={TrendingUp}
          title={t('common.progress')}
          description={t('progress.teacherProgressDesc')}
          href={ROUTES.teacher.progress}
          color="teacher"
          delay={0.2}
        />

        {enableCourses && (
          <QuickActionCard
            icon={Plus}
            title={t('dashboard.createCourse')}
            description={t('dashboard.addNewContent')}
            href={ROUTES.teacher.courseCreate}
            color="warning"
            disabled={isAtCourseLimit}
            delay={0.24}
          />
        )}

        {enableBlogs && (
          <QuickActionCard
            icon={PenTool}
            title={t('dashboard.createBlog')}
            description={t('dashboard.writeNewContent')}
            href={ROUTES.teacher.blogCreate}
            color="admin"
            disabled={isAtBlogLimit}
            delay={0.28}
          />
        )}

        {enableNotes && (
          <QuickActionCard
            icon={Notebook}
            title={t('dashboard.myNotes')}
            description={t('dashboard.notesDesc')}
            href={ROUTES.teacher.notes}
            color="teacher"
            delay={0.32}
          />
        )}
      </ResponsiveGrid>
    </section>
  );
}

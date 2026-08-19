'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  BookOpen,
  HelpCircle,
  BarChart3,
  Plus,
  PenTool,
  Notebook,
} from 'lucide-react';
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      aria-labelledby="teacher-quick-actions-heading"
      className="space-y-3 sm:space-y-4"
    >
      <div>
        <h2 id="teacher-quick-actions-heading" className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
          {t('dashboard.quickActions')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('dashboard.learningHubDesc')}
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
            delay={0.1}
          />
        )}

        {enableQuizzes && (
          <QuickActionCard
            icon={HelpCircle}
            title={t('dashboard.manageQuizzes')}
            description={t('dashboard.createAndReview')}
            href={ROUTES.teacher.quizzes}
            color="student"
            delay={0.15}
          />
        )}

        {enableAnalytics && (
          <QuickActionCard
            icon={BarChart3}
            title={t('dashboard.analytics')}
            description={t('dashboard.viewInsights')}
            href={ROUTES.teacher.analytics}
            color="info"
            delay={0.2}
          />
        )}

        {enableCourses && (
          <QuickActionCard
            icon={Plus}
            title={t('dashboard.createCourse')}
            description={t('dashboard.addNewContent')}
            href={ROUTES.teacher.courseCreate}
            color="warning"
            disabled={isAtCourseLimit}
            delay={0.25}
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
            delay={0.3}
          />
        )}

        {enableNotes && (
          <QuickActionCard
            icon={Notebook}
            title={t('dashboard.myNotes')}
            description={t('dashboard.notesDesc')}
            href={ROUTES.teacher.notes}
            color="teacher"
            delay={0.35}
          />
        )}
      </ResponsiveGrid>
    </motion.section>
  );
}

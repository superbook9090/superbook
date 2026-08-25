'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  Compass,
  HelpCircle,
  Notebook,
  TrendingUp,
  Award,
  Newspaper,
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { ResponsiveGrid } from '@/components/layout';
import QuickActionCard from '@/components/ui/QuickActionCard';

export default function StudentQuickLinks() {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableNotes = useFeature('enableNotes');
  const enableBlogs = useFeature('enableBlogs');

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      aria-labelledby="learning-hub-heading"
      className="space-y-3 sm:space-y-4"
    >
      <div>
        <h2 id="learning-hub-heading" className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
          {t('dashboard.learningHub')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('dashboard.learningHubDesc')}
        </p>
      </div>

      <ResponsiveGrid variant="cards">
        {enableCourses && (
          <QuickActionCard
            icon={Compass}
            title={t('dashboard.exploreCourses')}
            description={t('common.browse')}
            href={ROUTES.student.browse}
            color="student"
            delay={0.1}
          />
        )}

        {enableQuizzes && (
          <QuickActionCard
            icon={HelpCircle}
            title={t('dashboard.takeQuiz')}
            description={t('quiz.quizzesDesc')}
            href={ROUTES.student.quizzes}
            color="success"
            delay={0.15}
          />
        )}

        {enableNotes && (
          <QuickActionCard
            icon={Notebook}
            title={t('dashboard.studyNotes')}
            description={t('dashboard.notesDesc')}
            href={ROUTES.student.notes}
            color="warning"
            delay={0.2}
          />
        )}

        <QuickActionCard
          icon={TrendingUp}
          title={t('common.progress')}
          description={t('dashboard.averageProgress')}
          href={ROUTES.student.progress}
          color="info"
          delay={0.25}
        />

        {enableCourses && (
          <QuickActionCard
            icon={Award}
            title={t('dashboard.viewCertificates')}
            description={t('dashboard.certificatesDesc')}
            href={ROUTES.student.certificates}
            color="student"
            delay={0.3}
          />
        )}

        {enableBlogs && (
          <QuickActionCard
            icon={Newspaper}
            title={t('dashboard.readBlogs')}
            description={t('dashboard.readBlogsDesc')}
            href={ROUTES.student.blogs}
            color="admin"
            delay={0.35}
          />
        )}
      </ResponsiveGrid>
    </motion.section>
  );
}

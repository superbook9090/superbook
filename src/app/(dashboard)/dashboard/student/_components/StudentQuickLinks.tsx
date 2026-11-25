'use client';

import {
  Compass,
  HelpCircle,
  Notebook,
  TrendingUp,
  Award,
  Newspaper,
  Trophy,
  BookMarked,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { useFeature } from '@/contexts/AppSettingsContext';
import { ResponsiveGrid } from '@/components/layout';
import QuickActionCard from '@/components/ui/QuickActionCard';

export default function StudentQuickLinks() {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableNotes = useFeature('enableNotes');
  const enableBlogs = useFeature('enableBlogs');
  const enableContests = useFeature('enableContests');

  return (
    <section aria-labelledby="learning-hub-heading" className="space-y-3 sm:space-y-4">
      <div>
        <h2
          id="learning-hub-heading"
          className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
        >
          {t('dashboard.learningHub')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
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
            delay={0.04}
          />
        )}

        {enableQuizzes && (
          <QuickActionCard
            icon={HelpCircle}
            title={t('dashboard.takeQuiz')}
            description={t('quiz.quizzesDesc')}
            href={ROUTES.student.quizzes}
            color="success"
            delay={0.08}
          />
        )}

        {enableContests && (
          <QuickActionCard
            icon={Trophy}
            title={t('common.contests')}
            description={t('contest.contestsHubDesc')}
            href={ROUTES.student.contests}
            color="error"
            delay={0.12}
          />
        )}

        <QuickActionCard
          icon={BookMarked}
          title={t('common.mistakes')}
          description={t('studentUi.mistakesHubDesc')}
          href={ROUTES.student.mistakes}
          color="warning"
          delay={0.16}
        />

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
          delay={0.24}
        />

        {enableCourses && (
          <QuickActionCard
            icon={Award}
            title={t('dashboard.viewCertificates')}
            description={t('dashboard.certificatesDesc')}
            href={ROUTES.student.certificates}
            color="student"
            delay={0.28}
          />
        )}

        {enableBlogs && (
          <QuickActionCard
            icon={Newspaper}
            title={t('dashboard.readBlogs')}
            description={t('dashboard.readBlogsDesc')}
            href={ROUTES.student.blogs}
            color="admin"
            delay={0.32}
          />
        )}
      </ResponsiveGrid>
    </section>
  );
}

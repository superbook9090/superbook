'use client';

import { Edit2, Trophy, HelpCircle } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import CreateQuizForm from '@/features/quizzes/components/CreateQuizForm';
import { LazyQuizLeaderboard } from '@/lib/lazy';
import { useTranslation } from '@/hooks/useTranslation';
import { useUrlTab } from '@/hooks/useUrlTab';
import { useSessionStore } from '@/store/useSessionStore';
import { isAdmin } from '@/lib/roles';
import { PageWrapper } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { TeacherTabs } from '@/features/teacher/components/TeacherTabs';

export default function CreateQuizPageContent({ quizId }: { quizId?: string }) {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const isAdminUser = isAdmin(session?.user?.role);
  const isEdit = Boolean(quizId);
  const [activeTab, setActiveTab] = useUrlTab<'edit' | 'leaderboard'>(
    ['edit', 'leaderboard'],
    'edit'
  );

  const backHref = isAdminUser ? ROUTES.admin.quizzes : ROUTES.teacher.quizzes;

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={HelpCircle}
        eyebrow={t('common.quizzes')}
        title={
          isEdit
            ? activeTab === 'leaderboard'
              ? t('quiz.leaderboard.title')
              : t('createQuizPage.editTitle')
            : t('createQuizPage.title')
        }
        description={
          isEdit
            ? activeTab === 'leaderboard'
              ? t('quiz.firstAttemptResults')
              : t('createQuizPage.editDescription')
            : t('createQuizPage.description')
        }
        backHref={backHref}
        backLabel={t('common.back')}
      />

      {isEdit && (
        <div className="flex items-center justify-between">
          <TeacherTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              {
                id: 'edit',
                label: t('createQuizPage.editTitle'),
                icon: <Edit2 className="w-4 h-4" />,
              },
              {
                id: 'leaderboard',
                label: t('quiz.leaderboard.title'),
                icon: <Trophy className="w-4 h-4" />,
                tone: 'warning',
              },
            ]}
          />
        </div>
      )}

      {isEdit && activeTab === 'leaderboard' ? (
        <div className="teacher-panel p-4 sm:p-6 md:p-7">
          <LazyQuizLeaderboard quizId={quizId!} />
        </div>
      ) : (
        <CreateQuizForm
          quizId={quizId}
          onViewLeaderboard={isEdit ? () => setActiveTab('leaderboard') : undefined}
        />
      )}
    </PageWrapper>
  );
}

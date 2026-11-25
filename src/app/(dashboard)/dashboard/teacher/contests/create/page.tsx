'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';

export default function CreateTeacherContestPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={Trophy}
        eyebrow={t('common.contests')}
        title={t('contest.createContestTitle')}
        description={t('contest.createContestDesc')}
        backHref={ROUTES.teacher.contests}
        backLabel={t('contest.backToContests')}
      />

      <TeacherContestForm />
    </PageWrapper>
  );
}

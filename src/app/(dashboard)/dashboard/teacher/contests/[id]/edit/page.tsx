'use client';

import React, { use } from 'react';
import { Trophy } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';

export default function EditTeacherContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={Trophy}
        eyebrow={t('common.contests')}
        title={t('contest.editContestTitle')}
        description={t('contest.editContestDesc')}
        backHref={ROUTES.teacher.contestManage(id)}
        backLabel={t('contest.backToDetails')}
      />

      <TeacherContestForm contestId={id} />
    </PageWrapper>
  );
}

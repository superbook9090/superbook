'use client';

import React, { use } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';
import BackButton from '@/components/ui/BackButton';
import { ROUTES } from '@/constants/routes';

export default function AdminEditContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <BackButton
          href={ROUTES.admin.contestManage(id)}
          label={t('contest.backToDetails')}
          className="text-xs font-bold min-h-[44px]"
        />
      </div>

      <PageHeader
        title={t('contest.editContestTitle')}
        description={
          t('contest.editContestDesc')
        }
      />

      <TeacherContestForm contestId={id} />
    </PageWrapper>
  );
}

'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';
import BackButton from '@/components/ui/BackButton';

import { ROUTES } from '@/constants/routes';

export default function CreateTeacherContestPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <BackButton
          href={ROUTES.teacher.contests}
          label={t('contest.backToContests')}
          className="text-xs font-bold min-h-[44px]"
        />
      </div>

      <PageHeader
        title={t('contest.createContestTitle')}
        description={
          t('contest.createContestDesc')
        }
      />

      <TeacherContestForm />
    </PageWrapper>
  );
}

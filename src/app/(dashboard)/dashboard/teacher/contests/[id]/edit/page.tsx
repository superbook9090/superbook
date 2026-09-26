'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';

export default function EditTeacherContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.teacher.contestManage(id)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToDetails')}</span>
        </Link>
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

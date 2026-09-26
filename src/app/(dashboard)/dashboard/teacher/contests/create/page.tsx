'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';
import { ArrowLeft } from 'lucide-react';

import { ROUTES } from '@/constants/routes';

export default function CreateTeacherContestPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.teacher.contests}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToContests')}</span>
        </Link>
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

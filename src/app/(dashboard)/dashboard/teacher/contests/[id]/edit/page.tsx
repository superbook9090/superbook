'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';
import { ArrowLeft } from 'lucide-react';

export default function EditTeacherContestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/dashboard/teacher/contests/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToDetails') || 'Back to Contest Details'}</span>
        </Link>
      </div>

      <PageHeader
        title={t('contest.editContestTitle') || 'Edit Contest Settings'}
        description={
          t('contest.editContestDesc') ||
          'Update schedule, instructions, prizes, and visibility settings for this contest.'
        }
      />

      <TeacherContestForm contestId={id} />
    </PageWrapper>
  );
}

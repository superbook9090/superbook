'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader } from '@/components/layout';
import { TeacherContestForm } from '@/features/contests/components/TeacherContestForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateTeacherContestPage() {
  const { t } = useTranslation();

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/teacher/contests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToContests') || 'Back to Contests'}</span>
        </Link>
      </div>

      <PageHeader
        title={t('contest.createContestTitle') || 'Create & Schedule Contest'}
        description={
          t('contest.createContestDesc') ||
          'Configure contest details, duration, prizes, and questions for your competition.'
        }
      />

      <TeacherContestForm />
    </PageWrapper>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Plus, Flame, Clock, CheckCircle, Lock, Mail } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUrlTab } from '@/hooks/useUrlTab';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { useContests } from '@/features/contests/hooks/useContests';
import { useSessionStore } from '@/store/useSessionStore';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { ROUTES } from '@/constants/routes';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
import { TeacherTabs } from '@/features/teacher/components/TeacherTabs';
import TeacherContestsStats from './_components/TeacherContestsStats';

export default function TeacherContestsPage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const user = session?.user as { role?: string; canCreateContests?: boolean } | undefined;

  const isAuthorized = user?.role === 'superadmin' || Boolean(user?.canCreateContests);

  const [activeTab, setActiveTab] = useUrlTab<'all' | 'live' | 'upcoming' | 'completed'>(
    ['all', 'live', 'upcoming', 'completed'],
    'live'
  );

  const { data, isLoading } = useContests({
    instructor: 'self',
    tab: activeTab === 'all' ? undefined : activeTab,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  if (!isAuthorized) {
    return (
      <PageWrapper>
        <div className="teacher-panel p-8 sm:p-12 border-[var(--warning)]/35 text-center max-w-xl mx-auto flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[var(--warning-light)] text-[var(--warning)] flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
            {t('contest.permissionRequired')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {t('contest.permissionRequiredDesc')}
          </p>
          <Link href={ROUTES.contact} className="teacher-cta-btn mt-1">
            <Mail className="w-4 h-4" />
            <span>{t('contact.title')}</span>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <TeacherPageBanner
        icon={Trophy}
        eyebrow={t('common.contests')}
        title={t('contest.teacherContests')}
        description={t('contest.teacherContestsDesc')}
        actions={
          <Link href={ROUTES.teacher.contestCreate} className="teacher-cta-btn w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>{t('contest.createNewContest')}</span>
          </Link>
        }
      />

      <TeacherContestsStats stats={stats} totalCount={contests.length} />

      <div className="flex items-center justify-between">
        <TeacherTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'all', label: t('common.all'), icon: <Trophy className="w-4 h-4" /> },
            {
              id: 'live',
              label: t('contest.live'),
              icon: <Flame className={`w-4 h-4 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />,
              count: stats.liveCount > 0 ? stats.liveCount : undefined,
              tone: 'danger',
            },
            {
              id: 'upcoming',
              label: t('contest.upcoming'),
              icon: <Clock className="w-4 h-4" />,
              count: stats.upcomingCount > 0 ? stats.upcomingCount : undefined,
              tone: 'info',
            },
            {
              id: 'completed',
              label: t('contest.completed'),
              icon: <CheckCircle className="w-4 h-4" />,
              count: stats.completedCount > 0 ? stats.completedCount : undefined,
              tone: 'success',
            },
          ]}
        />
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t('contest.noTeacherContests')}
          description={t('contest.noTeacherContestsDesc')}
          action={
            <Link href={ROUTES.teacher.contestCreate} className="teacher-cta-btn">
              <Plus className="w-4 h-4" />
              <span>{t('contest.createNewContest')}</span>
            </Link>
          }
        />
      ) : (
        <ResponsiveGrid variant="dense">
          {contests.map((c) => (
            <ContestCard key={c._id} contest={c} isTeacher />
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}

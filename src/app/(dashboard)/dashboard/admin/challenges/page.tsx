'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Swords,
  Eye,
  Users,
  Sparkles,
  Search,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { PageWrapper, EmptyState } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { isSuperAdmin } from '@/lib/roles';
import { queryKeys } from '@/lib/react-query/query-keys';
import { ROUTES } from '@/constants/routes';
import { ChallengesTable, type ChallengeAdminItem } from './_components/ChallengesTable';

interface ChallengeMetrics {
  totalChallenges: number;
  totalViews: number;
  totalAttempts: number;
  totalConversions: number;
  kFactor: string;
  conversionRate: string;
}

interface AdminChallengesResponse {
  metrics: ChallengeMetrics | null;
  challenges: ChallengeAdminItem[];
}

export default function AdminChallengesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);

  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const isSuper = isSuperAdmin(session?.user?.role);

  const challengesQuery = useQuery<AdminChallengesResponse>({
    queryKey: queryKeys.adminChallenges.all,
    queryFn: async () => {
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { metrics: null, challenges: [] };
      }
      return { metrics: data.metrics ?? null, challenges: data.challenges || [] };
    },
    enabled: status === 'authenticated' && isSuper,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !isSuper) {
      router.push(ROUTES.login);
    }
  }, [session, status, router, isSuper]);

  const metrics = challengesQuery.data?.metrics ?? null;
  const challenges = useMemo(() => challengesQuery.data?.challenges ?? [], [challengesQuery.data]);
  const isLoading = challengesQuery.isPending;
  const isRefreshing = challengesQuery.isFetching && !challengesQuery.isPending;

  const handleToggleStatus = async (challengeId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    setUpdatingId(challengeId);
    try {
      const res = await fetch('/api/admin/challenges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        queryClient.setQueryData<AdminChallengesResponse>(queryKeys.adminChallenges.all, (prev) =>
          prev
            ? {
                ...prev,
                challenges: prev.challenges.map((c) =>
                  c.id === challengeId ? { ...c, status: newStatus as 'active' | 'disabled' } : c
                ),
              }
            : prev
        );
      }
    } catch {
      // Handled silently
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredChallenges = useMemo(() => {
    if (!searchQuery.trim()) return challenges;
    const q = searchQuery.toLowerCase();
    return challenges.filter(
      (c) =>
        c.slug.toLowerCase().includes(q) ||
        c.creator.name.toLowerCase().includes(q) ||
        c.creator.email.toLowerCase().includes(q) ||
        c.quiz.title.toLowerCase().includes(q)
    );
  }, [challenges, searchQuery]);

  if (status === 'loading' || isLoading) {
    return (
      <PageWrapper>
        <PageSkeleton />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={Swords}
        eyebrow={t('admin.challengesTitle')}
        title={t('admin.challengesTitle')}
        description={t('admin.challengesSubtitle')}
        tier="superadmin"
        actions={
          <>
            <button
              type="button"
              onClick={() => void challengesQuery.refetch()}
              disabled={isRefreshing}
              className="teacher-pill-btn min-h-[44px] px-4 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('admin.refresh')}</span>
            </button>

            <Link
              href={ROUTES.admin.settings}
              className="teacher-pill-btn min-h-[44px] px-4 text-xs sm:text-sm font-semibold"
            >
              <Settings className="w-4 h-4" />
              <span>{t('admin.config')}</span>
            </Link>
          </>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="teacher-card p-4">
          <div className="flex items-center justify-between text-[var(--color-muted-foreground)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('admin.totalChallenges')}</span>
            <Swords className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] tabular-nums">
            {metrics?.totalChallenges ?? 0}
          </div>
        </div>

        <div className="teacher-card p-4">
          <div className="flex items-center justify-between text-[var(--color-muted-foreground)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('admin.totalViews')}</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] tabular-nums">
            {metrics?.totalViews ?? 0}
          </div>
        </div>

        <div className="teacher-card p-4">
          <div className="flex items-center justify-between text-[var(--color-muted-foreground)] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('admin.guestBattles')}</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] tabular-nums">
            {metrics?.totalAttempts ?? 0}
          </div>
        </div>

        <div className="teacher-card p-4 border-emerald-500/25 bg-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('admin.kFactorSignups')}</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-2 flex-wrap tabular-nums">
            <span className="text-2xl font-extrabold font-[family-name:var(--font-display)] text-emerald-700 dark:text-emerald-400">
              {metrics?.kFactor ?? '0.00'}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {t('admin.convertedCount', { count: String(metrics?.totalConversions ?? 0) })}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Table Panel */}
      <div className="teacher-panel overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)] pointer-events-none" />
            <input
              type="text"
              placeholder={t('admin.searchChallengesPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/35 min-h-[42px]"
            />
          </div>
          <span className="text-xs font-semibold text-[var(--color-muted-foreground)] tabular-nums">
            {t('admin.showingChallenges', { count: String(filteredChallenges.length) })}
          </span>
        </div>

        {filteredChallenges.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Swords}
              title={t('admin.noChallengesFound')}
              description={t('admin.challengesSubtitle')}
            />
          </div>
        ) : (
          <ChallengesTable
            challenges={filteredChallenges}
            updatingId={updatingId}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </div>
    </PageWrapper>
  );
}

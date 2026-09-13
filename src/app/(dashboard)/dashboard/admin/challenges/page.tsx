'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Swords,
  Eye,
  Users,
  Sparkles,
  Search,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { isAdmin } from '@/lib/roles';
import { ROUTES } from '@/constants/routes';

interface ChallengeAdminItem {
  id: string;
  slug: string;
  creator: {
    id?: string;
    name: string;
    email: string;
  };
  quiz: {
    id?: string;
    title: string;
  };
  targetScore: number;
  correctCount: number;
  totalQuestions: number;
  status: 'active' | 'disabled' | 'expired';
  viewsCount: number;
  attemptsCount: number;
  conversionsCount: number;
  expiresAt: string;
  createdAt: string;
}

interface ChallengeMetrics {
  totalChallenges: number;
  totalViews: number;
  totalAttempts: number;
  totalConversions: number;
  kFactor: string;
  conversionRate: string;
}

export default function AdminChallengesPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<ChallengeMetrics | null>(null);
  const [challenges, setChallenges] = useState<ChallengeAdminItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdminChallenges = async () => {
    try {
      const res = await fetch('/api/admin/challenges');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics);
        setChallenges(data.challenges || []);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || !isAdmin(session.user?.role)) {
      router.push(ROUTES.login);
      return;
    }
    fetchAdminChallenges();
  }, [session, status, router]);

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
        setChallenges((prev) =>
          prev.map((c) => (c.id === challengeId ? { ...c, status: newStatus as 'active' | 'disabled' } : c))
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
      <div className="flex flex-col gap-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
                <Swords className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--color-foreground)]">
                {t('admin.challengesTitle')}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-1">
              {t('admin.challengesSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsRefreshing(true);
                fetchAdminChallenges();
              }}
              disabled={isRefreshing}
              className="py-2 px-3 text-xs rounded-xl flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('admin.refresh')}</span>
            </Button>

            <Link href={ROUTES.admin.settings}>
              <Button
                variant="secondary"
                className="py-2 px-3 text-xs rounded-xl flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{t('admin.config')}</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="card-surface p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between text-[var(--color-muted-foreground)] mb-2">
              <span className="text-xs font-semibold">{t('admin.totalChallenges')}</span>
              <Swords className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-[var(--color-foreground)]">
              {metrics?.totalChallenges ?? 0}
            </div>
          </div>

          <div className="card-surface p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between text-[var(--color-muted-foreground)] mb-2">
              <span className="text-xs font-semibold">{t('admin.totalViews')}</span>
              <Eye className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-2xl font-black text-[var(--color-foreground)]">
              {metrics?.totalViews ?? 0}
            </div>
          </div>

          <div className="card-surface p-4 rounded-2xl border border-[var(--color-border)] shadow-sm">
            <div className="flex items-center justify-between text-[var(--color-muted-foreground)] mb-2">
              <span className="text-xs font-semibold">{t('admin.guestBattles')}</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-[var(--color-foreground)]">
              {metrics?.totalAttempts ?? 0}
            </div>
          </div>

          <div className="card-surface p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
            <div className="flex items-center justify-between text-emerald-500 mb-2">
              <span className="text-xs font-semibold">{t('admin.kFactorSignups')}</span>
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {metrics?.kFactor ?? '0.00'}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {t('admin.convertedCount', { count: String(metrics?.totalConversions ?? 0) })}
              </span>
            </div>
          </div>
        </div>

        {/* Search & List */}
        <div className="card-surface rounded-2xl border border-[var(--color-border)] p-4 sm:p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]" />
              <input
                type="text"
                placeholder={t('admin.searchChallengesPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)] outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <span className="text-xs text-[var(--color-muted-foreground)]">
              {t('admin.showingChallenges', { count: String(filteredChallenges.length) })}
            </span>
          </div>

          {filteredChallenges.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--color-muted-foreground)]">
              {t('admin.noChallengesFound')}
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-[var(--color-muted-foreground)]">
                    <th className="py-2.5 px-3 font-semibold">{t('admin.thChallenge')}</th>
                    <th className="py-2.5 px-3 font-semibold">{t('admin.thChallenger')}</th>
                    <th className="py-2.5 px-3 font-semibold">{t('admin.thTargetScore')}</th>
                    <th className="py-2.5 px-3 font-semibold">{t('admin.thViewsBattles')}</th>
                    <th className="py-2.5 px-3 font-semibold">{t('admin.thStatus')}</th>
                    <th className="py-2.5 px-3 font-semibold text-right">{t('admin.thActions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-foreground)]">
                  {filteredChallenges.map((item) => {
                    const isUpdating = updatingId === item.id;
                    const isExp = new Date(item.expiresAt) < new Date();

                    return (
                       <tr key={item.id} className="hover:bg-[var(--color-muted)]/10 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-400">
                            <span>{item.slug}</span>
                            <Link href={`/challenge/${item.slug}`} target="_blank">
                              <ExternalLink className="w-3 h-3 hover:text-indigo-300" />
                            </Link>
                          </div>
                          <div className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-1 max-w-[220px] mt-0.5">
                            {item.quiz.title}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-semibold">{item.creator.name}</div>
                          <div className="text-[11px] text-[var(--color-muted-foreground)]">
                            {item.creator.email}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-bold text-amber-500">{item.targetScore}%</span>
                          <span className="text-[10px] text-[var(--color-muted-foreground)] block">
                            {t('admin.qsCountText', {
                              correct: String(item.correctCount),
                              total: String(item.totalQuestions),
                            })}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium">
                            {t('admin.viewsCountText', { count: String(item.viewsCount) })}
                          </span>
                          <span className="text-[10px] text-[var(--color-muted-foreground)] block">
                            {t('admin.battlesPlayedText', {
                              attempts: String(item.attemptsCount),
                              conversions: String(item.conversionsCount),
                            })}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.status === 'disabled'
                                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                : isExp
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.status === 'disabled' ? (
                              <>
                                <ShieldAlert className="w-2.5 h-2.5" />
                                {t('admin.statusDisabled')}
                              </>
                            ) : isExp ? (
                              t('admin.statusExpired')
                            ) : (
                              <>
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {t('admin.statusActive')}
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <Button
                            variant="secondary"
                            onClick={() => handleToggleStatus(item.id, item.status)}
                            disabled={isUpdating}
                            className={`py-1 px-2.5 text-[11px] rounded-lg ${
                              item.status === 'active'
                                ? 'text-rose-400 hover:bg-rose-500/10'
                                : 'text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                          >
                            {item.status === 'active' ? t('admin.actionDisable') : t('admin.actionEnable')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}

'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  Building2,
  Bell,
  Sliders,
  FolderOpen,
  ArrowUpRight,
  Crown,
  Radio,
} from 'lucide-react';
import type { AdminStats } from './types';

interface SuperadminExecutiveSuiteProps {
  stats: AdminStats | null;
}

export default function SuperadminExecutiveSuite({ stats }: SuperadminExecutiveSuiteProps) {
  const { t } = useTranslation();

  const cards = [
    {
      title: t('admin.multiTenantHub'),
      subtitle: t('admin.tenancyHealth'),
      metric: stats?.users?.total ? `${stats.users.total.toLocaleString()} ${t('admin.users')}` : 'Multi-Tenant',
      status: t('admin.activeNow'),
      icon: Building2,
      href: ROUTES.admin.organizations,
      iconTone: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25',
      cta: t('admin.manageOrganizations'),
    },
    {
      title: t('admin.broadcastDispatcher'),
      subtitle: t('admin.readyToBroadcast'),
      metric: 'Push FCM',
      status: t('admin.readyToBroadcast'),
      icon: Bell,
      href: ROUTES.admin.notifications,
      iconTone: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 border-rose-500/25',
      cta: t('admin.emergencyBroadcast'),
    },
    {
      title: t('admin.liveMaintenanceMode'),
      subtitle: t('admin.maintenanceDisabled'),
      metric: 'Active',
      status: 'Redis & Mongo Synced',
      icon: Sliders,
      href: ROUTES.admin.settings,
      iconTone: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]',
      cta: t('admin.settings'),
    },
    {
      title: t('admin.cloudStorage'),
      subtitle: t('admin.storageCapacity'),
      metric: 'CDN Active',
      status: 'Encrypted Storage',
      icon: FolderOpen,
      href: ROUTES.admin.files,
      iconTone: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/25',
      cta: t('common.files'),
    },
  ];

  return (
    <section aria-labelledby="superadmin-suite-heading" className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-amber-500/12 text-amber-600 dark:text-amber-400 border border-amber-500/25">
          <Crown className="w-4 h-4" />
        </span>
        <h2
          id="superadmin-suite-heading"
          className="text-base sm:text-lg font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] flex items-center gap-2"
        >
          <span>{t('admin.superadminTier')}</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/25">
            Exclusive
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            aria-label={card.cta}
            className="teacher-card p-4 sm:p-5 flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border ${card.iconTone} shrink-0`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)]/60 truncate max-w-[160px]">
                  <Radio className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{card.status}</span>
                </span>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {card.subtitle}
                </p>
                <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors">
                  {card.title}
                </h3>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]/70 flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-[var(--color-foreground)] tabular-nums">
                {card.metric}
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] group-hover:bg-[var(--teacher-primary)] group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

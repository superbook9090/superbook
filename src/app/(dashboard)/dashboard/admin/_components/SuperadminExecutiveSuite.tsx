'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  Building2,
  Bell,
  Sliders,
  FolderOpen,
  ArrowUpRight,
  Zap,
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
      metric: stats?.users?.total ? `${stats.users.total} ${t('admin.users')}` : 'Multi-Tenant',
      status: t('admin.activeNow'),
      icon: Building2,
      href: ROUTES.admin.organizations,
      accentBg: 'from-amber-500/15 via-amber-500/5 to-transparent',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60',
      iconColor: 'text-amber-500 bg-amber-500/15 border-amber-500/25',
      cta: t('admin.manageOrganizations'),
    },
    {
      title: t('admin.broadcastDispatcher'),
      subtitle: t('admin.readyToBroadcast'),
      metric: 'Push FCM',
      status: t('admin.readyToBroadcast'),
      icon: Bell,
      href: ROUTES.admin.notifications,
      accentBg: 'from-rose-500/15 via-rose-500/5 to-transparent',
      borderColor: 'border-rose-500/30 hover:border-rose-500/60',
      iconColor: 'text-rose-500 bg-rose-500/15 border-rose-500/25',
      cta: t('admin.emergencyBroadcast'),
    },
    {
      title: t('admin.liveMaintenanceMode'),
      subtitle: t('admin.maintenanceDisabled'),
      metric: 'Active',
      status: 'Redis & Mongo Synced',
      icon: Sliders,
      href: ROUTES.admin.settings,
      accentBg: 'from-purple-500/15 via-purple-500/5 to-transparent',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60',
      iconColor: 'text-purple-500 bg-purple-500/15 border-purple-500/25',
      cta: t('admin.settings'),
    },
    {
      title: t('admin.cloudStorage'),
      subtitle: t('admin.storageCapacity'),
      metric: 'CDN Active',
      status: 'Encrypted Storage',
      icon: FolderOpen,
      href: ROUTES.admin.files,
      accentBg: 'from-sky-500/15 via-sky-500/5 to-transparent',
      borderColor: 'border-sky-500/30 hover:border-sky-500/60',
      iconColor: 'text-sky-500 bg-sky-500/15 border-sky-500/25',
      cta: t('common.files'),
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      aria-labelledby="superadmin-suite-heading"
      className="space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/25 shadow-xs">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 id="superadmin-suite-heading" className="text-sm sm:text-base font-black tracking-tight text-[var(--color-foreground)] flex items-center gap-2">
              <span>{t('admin.superadminTier')}</span>
              <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                Exclusive
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + idx * 0.03, duration: 0.25 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className={`antigravity-glass relative overflow-hidden rounded-xl p-3 sm:p-3.5 border ${card.borderColor} bg-gradient-to-br ${card.accentBg} transition-all duration-300 shadow-xs flex flex-col justify-between group`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[var(--border)]/60">
                <div className={`p-1.5 rounded-lg border ${card.iconColor} shadow-xs group-hover:scale-105 transition-transform duration-300`}>
                  <card.icon className="w-3.5 h-3.5" />
                </div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]">
                  <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                  <span>{card.status}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {card.subtitle}
                </p>
                <h3 className="text-xs sm:text-sm font-extrabold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {card.title}
                </h3>
              </div>
            </div>

            <div className="pt-2 mt-2 flex items-center justify-between border-t border-[var(--border)]/50 text-xs">
              <span className="font-extrabold text-[var(--color-foreground)]">
                {card.metric}
              </span>
              <Link
                href={card.href}
                className="inline-flex items-center gap-1 font-bold text-[var(--primary)] hover:underline min-h-[28px]"
              >
                <span>{card.cta}</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

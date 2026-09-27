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
      transition={{ delay: 0.1, duration: 0.5 }}
      aria-labelledby="superadmin-suite-heading"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 id="superadmin-suite-heading" className="text-lg sm:text-xl font-extrabold tracking-tight text-[var(--color-foreground)] flex items-center gap-2">
              <span>{t('admin.superadminTier')}</span>
              <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                Exclusive
              </span>
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 perspective-1000">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.15 + idx * 0.05, duration: 0.5, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-[2rem] p-5 sm:p-6 border backdrop-blur-2xl ${card.borderColor} bg-[var(--card-solid)]/40 transition-all duration-500 shadow-xl flex flex-col justify-between group`}
          >
            {/* Hover ambient flare */}
            <div className={`absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${card.accentBg} pointer-events-none blur-xl`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-[var(--border)]/50">
                <div className={`p-3 rounded-2xl border ${card.iconColor} shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] shadow-inner">
                  <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span>{card.status}</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
                  {card.subtitle}
                </p>
                <h3 className="text-sm sm:text-base md:text-lg font-extrabold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {card.title}
                </h3>
              </div>
            </div>

            <div className="relative z-10 pt-4 mt-6 flex items-center justify-between border-t border-[var(--border)]/50">
              <span className="font-extrabold text-sm text-[var(--color-foreground)]">
                {card.metric}
              </span>
              <Link
                href={card.href}
                className="inline-flex items-center justify-center p-2 rounded-xl bg-[var(--surface-muted)] hover:bg-[var(--primary)] text-[var(--foreground)] hover:text-white transition-all duration-300 min-h-[36px]"
                aria-label={card.cta}
              >
                <ArrowUpRight className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

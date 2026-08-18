'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Users, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrganizationsStatsData } from './types';

interface OrganizationsStatsProps {
  stats: OrganizationsStatsData;
  isLoading?: boolean;
}

export function OrganizationsStats({ stats, isLoading }: OrganizationsStatsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      id: 'totalOrgs',
      label: t('organizations.totalOrgs') || 'Total Organizations',
      value: stats.total,
      icon: Building2,
      iconBg: 'bg-[var(--info-light)] text-[var(--info)]',
      border: 'border-[var(--border)]',
    },
    {
      id: 'activeOrgs',
      label: t('organizations.activeOrgs') || 'Active Organizations',
      value: stats.active,
      icon: CheckCircle2,
      iconBg: 'bg-[var(--success-light)] text-[var(--success)]',
      border: 'border-[var(--border)]',
      badge:
        stats.inactive > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
            {stats.inactive} {t('organizations.inactive')}
          </span>
        ) : null,
    },
    {
      id: 'totalUsers',
      label: t('organizations.totalUsers') || 'Enrolled Users',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-[var(--student-soft)] text-[var(--student-primary)]',
      border: 'border-[var(--border)]',
    },
    {
      id: 'totalContent',
      label: t('organizations.totalContent') || 'Total Content',
      value: stats.totalContent,
      icon: BookOpen,
      iconBg: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
      border: 'border-[var(--border)]',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.25 }}
          className={`bg-[var(--card-solid)] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 border ${card.border} shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] truncate">
              {card.label}
            </span>
            <div className={`p-2 rounded-lg ${card.iconBg} shrink-0`}>
              <card.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            {isLoading ? (
              <div className="h-7 sm:h-8 w-16 bg-[var(--color-surface-muted)] rounded animate-pulse" />
            ) : (
              <span className="text-xl sm:text-2xl lg:text-3xl font-extrabold tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
                {card.value.toLocaleString()}
              </span>
            )}
            {card.badge}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

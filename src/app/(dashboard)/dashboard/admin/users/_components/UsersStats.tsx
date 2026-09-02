'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, ShieldCheck, UserX } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { UserStats } from './types';

interface UsersStatsProps {
  stats?: UserStats | null;
  isLoading?: boolean;
}

export function UsersStats({ stats, isLoading }: UsersStatsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      id: 'total',
      label: t('adminUsers.totalUsers') || 'Total Users',
      value: stats?.total ?? 0,
      icon: Users,
      iconBg: 'bg-[var(--info-light)] text-[var(--info)]',
      border: 'border-[var(--border)]',
      subtitle:
        stats?.appUsers !== undefined && stats?.webUsers !== undefined
          ? `${stats.appUsers} ${t('adminAnalytics.platformApp') || 'App'} • ${stats.webUsers} ${t('adminAnalytics.platformWeb') || 'Web'}`
          : undefined,
    },
    {
      id: 'students',
      label: t('adminUsers.studentsCount') || 'Students',
      value: stats?.students ?? 0,
      icon: GraduationCap,
      iconBg: 'bg-[var(--student-soft)] text-[var(--student-primary)]',
      border: 'border-[var(--border)]',
      subtitle:
        stats?.activeToday !== undefined && stats.activeToday > 0
          ? `${stats.activeToday} ${t('adminAnalytics.activeToday') || 'active today'}`
          : undefined,
    },
    {
      id: 'teachers',
      label: t('adminUsers.teachersCount') || 'Teachers',
      value: stats?.teachers ?? 0,
      icon: BookOpen,
      iconBg: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
      border: 'border-[var(--border)]',
    },
    {
      id: 'admins',
      label: t('adminUsers.adminsCount') || 'Admins & Staff',
      value: (stats?.admins ?? 0) + (stats?.superadmins ?? 0),
      icon: ShieldCheck,
      iconBg: 'bg-[var(--success-light)] text-[var(--success)]',
      border: 'border-[var(--border)]',
      badge:
        stats && stats.suspended > 0 ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-[var(--error-light)] text-[var(--error)]">
            <UserX className="w-3 h-3" />
            {stats.suspended} {t('adminUsers.suspended') || 'Suspended'}
          </span>
        ) : null,
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
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] truncate">
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

          {card.subtitle && (
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1 truncate">
              {card.subtitle}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ToggleRight, GraduationCap, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { SettingsStats } from './types';

interface Props {
  stats: SettingsStats;
}

export function SettingsOverviewStats({ stats }: Props) {
  const { t } = useTranslation();

  const isMaintenance = stats.maintenanceMode;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      {/* Platform Status */}
      <div className="card-surface p-3.5 sm:p-4 rounded-xl border border-[var(--border)] relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            {t('adminSettings.systemMode')}
          </span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isMaintenance
                ? 'bg-[var(--color-error)] animate-ping'
                : 'bg-[var(--color-success)]'
            }`}
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isMaintenance
                ? 'bg-[var(--color-error-light)] text-[var(--color-error)]'
                : 'bg-[var(--color-success-light)] text-[var(--color-success)]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate">
              {isMaintenance
                ? t('adminSettings.statusMaintenance')
                : t('adminSettings.statusOperational')}
            </p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
              {stats.allowRegistration ? 'Open Registration' : 'Restricted'}
            </p>
          </div>
        </div>
      </div>

      {/* Feature Flags Active */}
      <div className="card-surface p-3.5 sm:p-4 rounded-xl border border-[var(--border)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            {t('adminSettings.activeFeatures')}
          </span>
          <span className="text-xs font-bold text-[var(--primary)]">
            {Math.round((stats.activeFeatures / (stats.totalFeatures || 1)) * 100)}%
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
            <ToggleRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate">
              {stats.activeFeatures} / {stats.totalFeatures} Active
            </p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
              System Modules
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Content Quotas */}
      <div className="card-surface p-3.5 sm:p-4 rounded-xl border border-[var(--border)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            {t('adminSettings.teacherLimitsActive')}
          </span>
          <span className="text-xs font-medium text-[var(--color-success)]">Active</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-[var(--color-info-light)] text-[var(--color-info)] shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate">
              Enforced
            </p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
              Courses, Quizzes & Notes
            </p>
          </div>
        </div>
      </div>

      {/* Pending Unsaved Changes */}
      <div
        className={`p-3.5 sm:p-4 rounded-xl border transition-colors flex flex-col justify-between ${
          stats.pendingChangesCount > 0
            ? 'bg-[var(--color-warning-light)]/40 border-[var(--color-warning)]/30'
            : 'card-surface border-[var(--border)]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
            {t('adminSettings.unsavedChanges')}
          </span>
          {stats.pendingChangesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-[var(--color-warning)] animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              stats.pendingChangesCount > 0
                ? 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
            }`}
          >
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <p
              className={`text-sm sm:text-base font-bold truncate ${
                stats.pendingChangesCount > 0
                  ? 'text-[var(--color-warning)]'
                  : 'text-[var(--color-foreground)]'
              }`}
            >
              {stats.pendingChangesCount > 0
                ? `${stats.pendingChangesCount} Pending`
                : 'Synced'}
            </p>
            <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
              {stats.pendingChangesCount > 0 ? 'Ready to save' : 'No unsaved edits'}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

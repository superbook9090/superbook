'use client';

import React from 'react';
import { Trophy, Zap } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';
import { isSuperAdmin } from '@/lib/roles';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import type { ScheduleType } from './types';

interface ContestOverviewSectionProps {
  isEdit: boolean;
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  instructions: string;
  setInstructions: (value: string) => void;
  scheduleType: ScheduleType;
  setScheduleType: (value: ScheduleType) => void;
  notifyAllStudents: boolean;
  setNotifyAllStudents: (value: boolean) => void;
  onSuperAdminAutofill: () => void;
}

export function ContestOverviewSection({
  isEdit,
  title,
  setTitle,
  description,
  setDescription,
  instructions,
  setInstructions,
  scheduleType,
  setScheduleType,
  notifyAllStudents,
  setNotifyAllStudents,
  onSuperAdminAutofill,
}: ContestOverviewSectionProps) {
  const { t } = useTranslation();
  const { role } = useRoleTheme();

  return (
    <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
          <Trophy className="w-4 h-4 text-[var(--primary)]" />
          <span>{t('contest.basicInfo') || '1. Contest Overview'}</span>
        </div>
        {isSuperAdmin(role) && !isEdit && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-foreground)] cursor-pointer">
              <input
                type="checkbox"
                checked={notifyAllStudents}
                onChange={(e) => setNotifyAllStudents(e.target.checked)}
                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              {t('contest.notifyAllStudents') || 'Notify all students'}
            </label>
            <button
              type="button"
              onClick={onSuperAdminAutofill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors text-xs font-bold"
            >
              <Zap className="w-3.5 h-3.5" />
              {t('contest.autoFillDetailsBtn') || 'Auto-fill Contest Details'}
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <TextField
          label={t('contest.title') || 'Contest Title *'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('contest.titlePlaceholder') || 'e.g. National Mathematics Olympiad 2026'}
          required
        />

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.description') || 'Description'}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('contest.descPlaceholder') || 'Brief summary of the competition...'}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.instructions') || 'Contest Guidelines & Rules'}
          </label>
          <textarea
            rows={4}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={t('contest.instructionsPlaceholder') || 'Rules, scoring guidelines, time limits, anti-cheat policy...'}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.scheduleType') || 'Contest Frequency / Recurrence'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['one_time', 'daily', 'weekly'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setScheduleType(type)}
                className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                  scheduleType === type
                    ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)] shadow-xs'
                    : 'bg-[var(--color-surface-muted)] border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {type.replace('_', '-')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

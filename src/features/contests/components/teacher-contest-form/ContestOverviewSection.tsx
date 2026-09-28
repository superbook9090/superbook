'use client';

import React, { useState, useEffect } from 'react';
import { Trophy, Zap, ChevronDown, ChevronUp, FileText, Repeat, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
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
  isAutofilling?: boolean;
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
  isAutofilling = false,
}: ContestOverviewSectionProps) {
  const { t } = useTranslation();
  const { role } = useRoleTheme();
  const [showInstructions, setShowInstructions] = useState(Boolean(instructions?.trim()));

  useEffect(() => {
    if (instructions?.trim()) {
      setShowInstructions(true);
    }
  }, [instructions]);

  const scheduleOptions: Array<{ type: ScheduleType; label: string; desc: string }> = [
    { type: 'one_time', label: t('contest.oneTime'), desc: 'One-time live competition' },
    { type: 'daily', label: t('contest.daily'), desc: 'Auto-repeats every 24 hours' },
    { type: 'weekly', label: t('contest.weekly'), desc: 'Weekly recurring tournament' },
  ];

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl group transition-all duration-500 hover:shadow-2xl hover:bg-[var(--card-solid)]/60">
      {/* Decorative ambient glows */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
                {t('contest.basicInfo')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Provide title and recurrence for your competition
              </p>
            </div>
          </div>

          {!isEdit && (
            <div className="flex flex-wrap items-center gap-3">
              {isSuperAdmin(role) && (
                <label className="flex items-center gap-2 text-xs font-semibold text-[var(--color-foreground)] cursor-pointer select-none bg-[var(--surface-muted)]/60 px-3 py-2 rounded-2xl border border-[var(--border)]/40">
                  <input
                    type="checkbox"
                    checked={notifyAllStudents}
                    onChange={(e) => setNotifyAllStudents(e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                  />
                  <span>{t('contest.notifyAllStudents')}</span>
                </label>
              )}
              <button
                type="button"
                onClick={onSuperAdminAutofill}
                disabled={isAutofilling}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[var(--primary)] text-white hover:opacity-90 active:scale-95 transition-all text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {isAutofilling ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>{isAutofilling ? 'Filling details...' : t('contest.autoFillDetailsBtn')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.title')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-muted-foreground)] pointer-events-none" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('contest.titlePlaceholder')}
                required
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.description')}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('contest.descPlaceholder')}
              className="w-full px-4 py-2.5 text-sm rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y"
            />
          </div>

          {/* Recurrence / Schedule Type */}
          <div>
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.scheduleType')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {scheduleOptions.map((opt) => {
                const isSelected = scheduleType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setScheduleType(opt.type)}
                    className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]/30'
                        : 'bg-[var(--surface-muted)]/40 border-[var(--border)]/50 text-[var(--color-foreground)] hover:border-[var(--border)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Repeat className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--primary)]' : 'text-[var(--color-muted-foreground)]'}`} />
                      <span className="text-xs font-bold">{opt.label}</span>
                    </div>
                    <span className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-1">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Instructions & Rules */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="inline-flex items-center gap-2 text-xs font-bold text-[var(--primary)] hover:underline"
            >
              {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>{showInstructions ? 'Hide Contest Guidelines & Rules' : '+ Add Contest Guidelines & Rules (Optional)'}</span>
            </button>

            {showInstructions && (
              <div className="mt-3 animate-in fade-in duration-200">
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={t('contest.instructionsPlaceholder')}
                  className="w-full px-4 py-2.5 text-sm rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

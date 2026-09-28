'use client';

import React from 'react';
import { Shield, Users, Eye, Trophy, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { VisibilityType, LeaderboardVisibilityType } from './types';

interface ContestSettingsSectionProps {
  maxAttempts: string;
  setMaxAttempts: (value: string) => void;
  maxParticipants: string;
  setMaxParticipants: (value: string) => void;
  visibility: VisibilityType;
  setVisibility: (value: VisibilityType) => void;
  leaderboardVisibility: LeaderboardVisibilityType;
  setLeaderboardVisibility: (value: LeaderboardVisibilityType) => void;
  enableNegativeMarking: boolean;
  setEnableNegativeMarking: (value: boolean) => void;
  negativeMarks: string;
  setNegativeMarks: (value: string) => void;
}

export function ContestSettingsSection({
  maxAttempts,
  setMaxAttempts,
  maxParticipants,
  setMaxParticipants,
  visibility,
  setVisibility,
  leaderboardVisibility,
  setLeaderboardVisibility,
  enableNegativeMarking,
  setEnableNegativeMarking,
  negativeMarks,
  setNegativeMarks,
}: ContestSettingsSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl group transition-all duration-500 hover:shadow-2xl hover:bg-[var(--card-solid)]/60">
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
              {t('contest.settings')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Control attempts, visibility, leaderboard and grading rules
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Max Attempts */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.maxAttempts')}
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
              <input
                type="number"
                min="1"
                max="10"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          {/* Max Participants */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.maxParticipants')}
            </label>
            <div className="relative">
              <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
              <input
                type="number"
                min="1"
                placeholder={t('contest.unlimitedPlaceholder')}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.visibility')}
            </label>
            <div className="relative">
              <Eye className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as VisibilityType)}
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all appearance-none cursor-pointer"
              >
                <option value="public">{t('contest.visibilityPublic')}</option>
                <option value="organization">{t('contest.visibilityOrg')}</option>
                <option value="unlisted">{t('contest.visibilityUnlisted')}</option>
              </select>
            </div>
          </div>

          {/* Leaderboard Visibility */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
              {t('contest.leaderboardVisibility')}
            </label>
            <div className="relative">
              <Trophy className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
              <select
                value={leaderboardVisibility}
                onChange={(e) => setLeaderboardVisibility(e.target.value as LeaderboardVisibilityType)}
                className="w-full pl-10 pr-4 py-3 text-sm font-semibold rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all appearance-none cursor-pointer"
              >
                <option value="live">{t('contest.leaderboardLive')}</option>
                <option value="after_end">{t('contest.leaderboardAfterEnd')}</option>
                <option value="hidden">{t('contest.leaderboardHidden')}</option>
              </select>
            </div>
          </div>

          {/* Negative Marking Configuration */}
          <div className="sm:col-span-2 p-5 rounded-2xl border border-[var(--border)]/60 bg-[var(--surface-muted)]/40 space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="enableNegativeMarking" className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="enableNegativeMarking"
                  name="enableNegativeMarking"
                  checked={enableNegativeMarking}
                  onChange={(e) => setEnableNegativeMarking(e.target.checked)}
                  className="mt-1 h-4.5 w-4.5 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)] rounded cursor-pointer"
                />
                <div>
                  <span className="text-sm font-bold text-[var(--color-foreground)]">
                    {t('contest.enableNegativeMarking')}
                  </span>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {t('contest.negativeMarkingDesc')}
                  </p>
                </div>
              </label>
            </div>

            {enableNegativeMarking && (
              <div className="pt-3 border-t border-[var(--border)]/40 space-y-3 pl-7 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('contest.negativeMarks')}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: t('contest.negativeMarksPresetQuarter'), value: '0.25' },
                    { label: t('contest.negativeMarksPresetThird'), value: '0.33' },
                    { label: t('contest.negativeMarksPresetHalf'), value: '0.5' },
                    { label: t('contest.negativeMarksPresetOne'), value: '1' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setNegativeMarks(preset.value)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        negativeMarks === preset.value
                          ? 'bg-[var(--primary)] text-white border-transparent shadow-xs'
                          : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border-[var(--border)] hover:bg-[var(--surface-muted)]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    placeholder="0.25"
                    className="w-28 px-3.5 py-2 text-sm font-semibold rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {t('contest.negativeMarksHint')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Shield } from 'lucide-react';
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
    <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-sm font-bold text-[var(--color-foreground)]">
        <Shield className="w-4 h-4 text-[var(--primary)]" />
        <span>{t('contest.settings') || '4. Contest Rules & Visibility'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.maxAttempts') || 'Max Attempts Allowed'}
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.maxParticipants') || 'Participant Capacity (Optional)'}
          </label>
          <input
            type="number"
            min="1"
            placeholder={t('contest.unlimitedPlaceholder') || 'Leave blank for unlimited'}
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.visibility') || 'Contest Visibility'}
          </label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as VisibilityType)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
          >
            <option value="public">{t('contest.visibilityPublic') || 'Public (Open Platform-wide)'}</option>
            <option value="organization">{t('contest.visibilityOrg') || 'Organization Members Only'}</option>
            <option value="unlisted">{t('contest.visibilityUnlisted') || 'Unlisted (Direct link only)'}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
            {t('contest.leaderboardVisibility') || 'Leaderboard Display'}
          </label>
          <select
            value={leaderboardVisibility}
            onChange={(e) => setLeaderboardVisibility(e.target.value as LeaderboardVisibilityType)}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
          >
            <option value="live">{t('contest.leaderboardLive') || 'Live (Real-time ranks during contest)'}</option>
            <option value="after_end">{t('contest.leaderboardAfterEnd') || 'After End (Reveal only when contest ends)'}</option>
            <option value="hidden">{t('contest.leaderboardHidden') || 'Hidden (Teacher only)'}</option>
          </select>
        </div>

        {/* Negative Marking Configuration */}
        <div className="sm:col-span-2 p-4 rounded-2xl border border-[var(--border)] bg-[var(--color-surface-muted)]/50 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="enableNegativeMarking" className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="enableNegativeMarking"
                  name="enableNegativeMarking"
                  checked={enableNegativeMarking}
                  onChange={(e) => setEnableNegativeMarking(e.target.checked)}
                  className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)] rounded cursor-pointer"
                />
                <span>{t('contest.enableNegativeMarking') || 'Enable Negative Marking'}</span>
              </label>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 ml-6">
                {t('contest.negativeMarkingDesc') || 'Deduct marks for incorrect answers to simulate competitive exam grading.'}
              </p>
            </div>
          </div>

          {enableNegativeMarking && (
            <div className="pt-2 border-t border-[var(--border)] space-y-3 ml-6">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1.5">
                  {t('contest.negativeMarks') || 'Penalty per incorrect answer'}
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {[
                    { label: t('contest.negativeMarksPresetQuarter') || '1/4 (-0.25)', value: '0.25' },
                    { label: t('contest.negativeMarksPresetThird') || '1/3 (-0.33)', value: '0.33' },
                    { label: t('contest.negativeMarksPresetHalf') || '1/2 (-0.5)', value: '0.5' },
                    { label: t('contest.negativeMarksPresetOne') || '1 (-1.0)', value: '1' },
                  ].map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setNegativeMarks(preset.value)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                        negativeMarks === preset.value
                          ? 'bg-[var(--primary)] text-white border-transparent'
                          : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border-[var(--border)] hover:bg-[var(--color-surface-muted)]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(e.target.value)}
                  placeholder="0.25"
                  className="w-32 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                />
                <span className="text-[11px] text-[var(--color-muted)] block mt-1">
                  {t('contest.negativeMarksHint') || 'Unattempted / skipped questions receive 0 deduction.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { Award, Plus, Trash2, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ContestPrize } from '@/lib/api/contests';

interface ContestPrizesSectionProps {
  prizes: ContestPrize[];
  onAddPrize: () => void;
  onUpdatePrize: (index: number, field: keyof ContestPrize, value: unknown) => void;
  onRemovePrize: (index: number) => void;
}

export function ContestPrizesSection({
  prizes,
  onAddPrize,
  onUpdatePrize,
  onRemovePrize,
}: ContestPrizesSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl group transition-all duration-500 hover:shadow-2xl hover:bg-[var(--card-solid)]/60">
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
                {t('contest.prizesBuilder')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Award trophies, certificates, cash vouchers or perks to winners
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onAddPrize}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--primary)] text-white hover:opacity-90 transition-all text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('contest.addPrize')}</span>
          </button>
        </div>

        {prizes.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-[var(--border)]/70 bg-[var(--surface-muted)]/20">
            <Trophy className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[var(--color-foreground)] mb-1">
              No prizes added yet
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mb-4 max-w-sm mx-auto">
              Contests without custom prizes will award platform ranking honor and certificates by default.
            </p>
            <button
              type="button"
              onClick={onAddPrize}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 text-xs font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Prize</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize, pIdx) => (
              <div
                key={pIdx}
                className="p-4 rounded-2xl bg-[var(--surface-muted)]/40 border border-[var(--border)]/60 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center hover:border-[var(--border)] transition-colors"
              >
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] mb-1">
                    {t('contest.rank')}
                  </label>
                  <input
                    type="text"
                    value={String(prize.rank)}
                    onChange={(e) => onUpdatePrize(pIdx, 'rank', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="1 or 1-3"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] mb-1">
                    {t('contest.prizeTitle')}
                  </label>
                  <input
                    type="text"
                    value={prize.title}
                    onChange={(e) => onUpdatePrize(pIdx, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="e.g. Gold Trophy + Cash Voucher"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] mb-1">
                    {t('contest.rewardType')}
                  </label>
                  <select
                    value={prize.rewardType || 'trophy'}
                    onChange={(e) => onUpdatePrize(pIdx, 'rewardType', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                  >
                    <option value="trophy">🏆 Trophy</option>
                    <option value="certificate">📜 Certificate</option>
                    <option value="cash">💵 Cash / Voucher</option>
                    <option value="points">⭐ Points</option>
                    <option value="gift">🎁 Gift Hamper</option>
                    <option value="badge">🎖️ Badge</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] mb-1">
                    {t('contest.value')}
                  </label>
                  <input
                    type="text"
                    value={prize.value || ''}
                    onChange={(e) => onUpdatePrize(pIdx, 'value', e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                    placeholder="e.g. ₹5,000"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => onRemovePrize(pIdx)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Remove Prize"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

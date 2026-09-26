'use client';

import React from 'react';
import { Award, Plus, Trash2 } from 'lucide-react';
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
    <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
          <Award className="w-4 h-4 text-[var(--warning)]" />
          <span>{t('contest.prizesBuilder')}</span>
        </div>
        <button
          type="button"
          onClick={onAddPrize}
          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:opacity-80"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('contest.addPrize')}</span>
        </button>
      </div>

      <div className="space-y-3">
        {prizes.map((prize, pIdx) => (
          <div
            key={pIdx}
            className="p-3.5 rounded-2xl bg-[var(--color-surface-muted)]/50 border border-[var(--border)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                {t('contest.rank')}
              </label>
              <input
                type="text"
                value={String(prize.rank)}
                onChange={(e) => onUpdatePrize(pIdx, 'rank', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] font-bold text-[var(--color-foreground)]"
                placeholder="1 or 1-3"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                {t('contest.prizeTitle')}
              </label>
              <input
                type="text"
                value={prize.title}
                onChange={(e) => onUpdatePrize(pIdx, 'title', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                placeholder="e.g. Gold Trophy + Certificate"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                {t('contest.rewardType')}
              </label>
              <select
                value={prize.rewardType || 'trophy'}
                onChange={(e) => onUpdatePrize(pIdx, 'rewardType', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
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
              <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                {t('contest.value')}
              </label>
              <input
                type="text"
                value={prize.value || ''}
                onChange={(e) => onUpdatePrize(pIdx, 'value', e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                placeholder="e.g. ₹5,000"
              />
            </div>

            <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
              <button
                type="button"
                onClick={() => onRemovePrize(pIdx)}
                className="p-1.5 text-[var(--error)] hover:bg-[var(--error-light)] rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

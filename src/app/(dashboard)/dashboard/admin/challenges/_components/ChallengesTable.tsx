'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export interface ChallengeAdminItem {
  id: string;
  slug: string;
  creator: {
    id?: string;
    name: string;
    email: string;
  };
  quiz: {
    id?: string;
    title: string;
  };
  targetScore: number;
  correctCount: number;
  totalQuestions: number;
  status: 'active' | 'disabled' | 'expired';
  viewsCount: number;
  attemptsCount: number;
  conversionsCount: number;
  expiresAt: string;
  createdAt: string;
}

interface ChallengesTableProps {
  challenges: ChallengeAdminItem[];
  updatingId: string | null;
  onToggleStatus: (id: string, currentStatus: string) => void;
}

export function ChallengesTable({
  challenges,
  updatingId,
  onToggleStatus,
}: ChallengesTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/75 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
            <th className="py-3.5 px-4">{t('admin.thChallenge')}</th>
            <th className="py-3.5 px-4">{t('admin.thChallenger')}</th>
            <th className="py-3.5 px-4">{t('admin.thTargetScore')}</th>
            <th className="py-3.5 px-4">{t('admin.thViewsBattles')}</th>
            <th className="py-3.5 px-4">{t('admin.thStatus')}</th>
            <th className="py-3.5 px-4 text-right">{t('admin.thActions')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]/70 text-[var(--color-foreground)]">
          {challenges.map((item) => {
            const isUpdating = updatingId === item.id;
            const isExp = new Date(item.expiresAt) < new Date();

            return (
              <tr
                key={item.id}
                className="hover:bg-[var(--surface-muted)]/45 transition-colors"
              >
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-[var(--teacher-primary)]">
                    <span>{item.slug}</span>
                    <Link
                      href={`/challenge/${item.slug}`}
                      target="_blank"
                      className="text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)] line-clamp-1 max-w-[240px] mt-0.5">
                    {item.quiz.title}
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-semibold text-[var(--color-foreground)]">
                    {item.creator.name}
                  </div>
                  <div className="text-xs text-[var(--color-muted-foreground)]">
                    {item.creator.email}
                  </div>
                </td>

                <td className="py-3.5 px-4 tabular-nums">
                  <span className="font-bold text-amber-700 dark:text-amber-400">
                    {item.targetScore}%
                  </span>
                  <span className="text-[11px] text-[var(--color-muted-foreground)] block">
                    {t('admin.qsCountText', {
                      correct: String(item.correctCount),
                      total: String(item.totalQuestions),
                    })}
                  </span>
                </td>

                <td className="py-3.5 px-4 tabular-nums">
                  <span className="font-semibold">
                    {t('admin.viewsCountText', { count: String(item.viewsCount) })}
                  </span>
                  <span className="text-[11px] text-[var(--color-muted-foreground)] block">
                    {t('admin.battlesPlayedText', {
                      attempts: String(item.attemptsCount),
                      conversions: String(item.conversionsCount),
                    })}
                  </span>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'disabled'
                        ? 'bg-rose-500/12 text-rose-700 dark:text-rose-400 border border-rose-500/25'
                        : isExp
                        ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/25'
                        : 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25'
                    }`}
                  >
                    {item.status === 'disabled' ? (
                      <>
                        <ShieldAlert className="w-3 h-3" />
                        {t('admin.statusDisabled')}
                      </>
                    ) : isExp ? (
                      t('admin.statusExpired')
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {t('admin.statusActive')}
                      </>
                    )}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => onToggleStatus(item.id, item.status)}
                    disabled={isUpdating}
                    className={`inline-flex items-center justify-center min-h-[34px] px-3 rounded-[8px] text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                      item.status === 'active'
                        ? 'border-rose-500/30 bg-rose-500/8 text-rose-700 dark:text-rose-400 hover:bg-rose-500/15'
                        : 'border-emerald-500/30 bg-emerald-500/8 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/15'
                    }`}
                  >
                    {item.status === 'active' ? t('admin.actionDisable') : t('admin.actionEnable')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

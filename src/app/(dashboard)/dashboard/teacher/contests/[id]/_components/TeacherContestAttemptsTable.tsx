'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { Users, AlertTriangle } from 'lucide-react';

interface AttemptRow {
  _id: string;
  student?: {
    name?: string;
    email?: string;
  };
  status: string;
  score: number;
  percentage: number;
  timeTaken: number;
  submittedAt?: string;
  violationCount: number;
}

interface TeacherContestAttemptsTableProps {
  attempts: AttemptRow[];
}

export default function TeacherContestAttemptsTable({
  attempts,
}: TeacherContestAttemptsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] antigravity-glass overflow-hidden shadow-xs">
      <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
          {t('contest.studentSubmissions')}
        </h3>
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
          {attempts.length} {t('contest.submissions')}
        </span>
      </div>

      {attempts.length === 0 ? (
        <div className="p-12 text-center text-xs sm:text-sm text-[var(--color-muted-foreground)] flex flex-col items-center gap-2">
          <Users className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-30" />
          <span>{t('contest.noStudentsAttempted')}</span>
        </div>
      ) : (
        <>
          {/* Mobile cards view */}
          <div className="md:hidden divide-y divide-[var(--border)]">
            {attempts.map((att) => (
              <div key={att._id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--color-foreground)]">
                      {att.student?.name || 'Anonymous'}
                    </h4>
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      {att.student?.email}
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                      att.status === 'completed'
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : 'bg-[var(--warning-light)] text-[var(--warning-foreground)]'
                    }`}
                  >
                    {att.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-[var(--teacher-primary)] tabular-nums">
                    {att.score} pts ({att.percentage}%)
                  </span>
                  <span className="text-[var(--color-muted-foreground)]">
                    {formatDuration(att.timeTaken)}
                  </span>
                  {att.violationCount > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--error-light)] text-[var(--error)]">
                      <AlertTriangle className="w-3 h-3" />
                      {att.violationCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--color-surface-muted)]/70 text-[var(--color-muted-foreground)] uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-5">{t('contest.participant')}</th>
                  <th className="py-3.5 px-4">{t('contest.status')}</th>
                  <th className="py-3.5 px-4 text-center">{t('contest.score')}</th>
                  <th className="py-3.5 px-4 text-center">{t('contest.timeTaken')}</th>
                  <th className="py-3.5 px-4">{t('contest.submittedAt')}</th>
                  <th className="py-3.5 px-4 text-center">{t('contest.violations')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {attempts.map((att) => (
                  <tr key={att._id} className="hover:bg-[var(--teacher-soft)]/20 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[var(--color-foreground)]">
                      {att.student?.name || 'Anonymous'}
                      <span className="block text-[11px] text-[var(--color-muted-foreground)] font-normal">
                        {att.student?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize ${
                          att.status === 'completed'
                            ? 'bg-[var(--success-light)] text-[var(--success)]'
                            : 'bg-[var(--warning-light)] text-[var(--warning-foreground)]'
                        }`}
                      >
                        {att.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-[var(--teacher-primary)]">
                      {att.score} pts ({att.percentage}%)
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-[var(--color-muted-foreground)]">
                      {formatDuration(att.timeTaken)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[var(--color-muted-foreground)]">
                      {att.submittedAt ? formatDateTime(att.submittedAt) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {att.violationCount > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--error-light)] text-[var(--error)]">
                          <AlertTriangle className="w-3 h-3" />
                          {att.violationCount}
                        </span>
                      ) : (
                        <span className="text-[var(--color-muted)] text-xs font-medium">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

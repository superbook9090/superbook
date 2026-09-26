'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ExcelRow } from '../types';

interface ImportPreviewTableProps {
  previewData: ExcelRow[];
  theme: { gradient: string; activeBg: string; activeText: string };
  onCancel: () => void;
  onConfirm: () => void;
}

export function ImportPreviewTable({
  previewData,
  theme,
  onCancel,
  onConfirm,
}: ImportPreviewTableProps) {
  const { t } = useTranslation();

  if (previewData.length === 0) return null;

  const hasExplanations = previewData.some((r) => Boolean(r.explanation));

  return (
    <div className="mb-6 bg-[var(--color-card)] rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div className={`px-4 py-3 ${theme.activeBg} border-b border-[var(--color-border)]`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className={`font-medium ${theme.activeText}`}>
            {t('createQuizForm.preview')}: {previewData.length} {t('createQuizForm.questionsFound')}
          </h4>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)] px-3 py-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-accent)]"
            >
              {t('createQuizForm.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`text-sm text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 px-3 py-1.5 rounded`}
            >
              {t('createQuizForm.confirmImport')}
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="min-w-full divide-y divide-[var(--color-border)]">
          <thead className="bg-[var(--color-accent)] sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.question')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.options')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.answer')}</th>
              {hasExplanations && (
                <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">
                  {t('createQuizForm.explanation')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {previewData.slice(0, 5).map((row, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 text-sm text-[var(--color-foreground)]">{idx + 1}</td>
                <td className="px-3 py-2 text-sm text-[var(--color-foreground)] max-w-xs truncate">{row.question}</td>
                <td className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">A, B, C, D</td>
                <td className="px-3 py-2 text-sm font-medium text-[var(--color-success)]">
                  {['A', 'B', 'C', 'D'][typeof row.correctAnswer === 'number' ? row.correctAnswer : 0]}
                </td>
                {hasExplanations && (
                  <td
                    className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] max-w-xs truncate"
                    title={row.explanation || ''}
                  >
                    {row.explanation || '-'}
                  </td>
                )}
              </tr>
            ))}
            {previewData.length > 5 && (
              <tr>
                <td
                  colSpan={hasExplanations ? 5 : 4}
                  className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] text-center italic"
                >
                  ... {t('createQuizForm.moreQuestions').replace('{count}', (previewData.length - 5).toString())}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

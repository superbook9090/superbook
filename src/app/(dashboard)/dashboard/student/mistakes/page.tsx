'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BookMarked, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useUrlTab } from '@/hooks/useUrlTab';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, EmptyState } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';
import { StudentTabs } from '@/features/student/components/StudentTabs';
import { MistakeCard, type MistakeItem } from './_components/MistakeCard';

export default function StudentMistakesPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useUrlTab<'pending' | 'mastered'>(
    ['pending', 'mastered'],
    'pending'
  );
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [unmasteredCount, setUnmasteredCount] = useState(0);

  const fetchMistakes = useCallback(async (tab: 'pending' | 'mastered') => {
    setLoading(true);
    try {
      const isMastered = tab === 'mastered';
      const res = await fetch(`/api/student/mistakes?mastered=${isMastered}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setMistakes(data.items || []);
        setUnmasteredCount(data.pagination?.unmasteredCount || 0);
      }
    } catch (err) {
      console.error('[StudentMistakesPage] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMistakes(activeTab);
  }, [activeTab, fetchMistakes]);

  const handleToggleMastered = async (id: string, nextStatus: boolean) => {
    try {
      const res = await fetch(`/api/student/mistakes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastered: nextStatus }),
      });
      if (res.ok) {
        setMistakes((prev) => prev.filter((item) => item._id !== id));
        setUnmasteredCount((prev) => (nextStatus ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      console.error('[StudentMistakesPage] Update error:', err);
    }
  };

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={BookMarked}
        eyebrow={t('common.mistakes')}
        title={t('common.mistakes')}
        description={t('studentUi.mistakesDesc')}
        actions={
          <div className="px-3.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80 text-xs font-semibold text-[var(--color-muted-foreground)]">
            {unmasteredCount === 0
              ? t('studentUi.allCaughtUp')
              : t('studentUi.trickyToRevise').replace('{count}', String(unmasteredCount))}
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <StudentTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: 'pending',
              label: t('studentUi.needsPractice'),
              icon: <RotateCcw className="w-4 h-4" />,
              count: unmasteredCount > 0 ? unmasteredCount : undefined,
              tone: 'danger',
            },
            {
              id: 'mastered',
              label: t('studentUi.masteredQuestions'),
              icon: <CheckCircle2 className="w-4 h-4" />,
              tone: 'success',
            },
          ]}
        />
      </div>

      {loading ? (
        <PageSkeleton />
      ) : mistakes.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={
            activeTab === 'pending'
              ? t('studentUi.noPendingMistakes')
              : t('studentUi.noMasteredMistakes')
          }
          description={
            activeTab === 'pending'
              ? t('studentUi.noPendingMistakesDesc')
              : t('studentUi.noMasteredMistakesDesc')
          }
        />
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {mistakes.map((item, idx) => (
            <MistakeCard
              key={item._id}
              item={item}
              index={idx}
              onToggleMastered={handleToggleMastered}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

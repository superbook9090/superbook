'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useUrlTab } from '@/hooks/useUrlTab';
import { PageWrapper, PageHeader } from '@/components/layout';
import { MistakeCard, type MistakeItem } from './_components/MistakeCard';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { BookMarked, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

export default function StudentMistakesPage() {
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
        // Refresh local list
        setMistakes((prev) => prev.filter((item) => item._id !== id));
        setUnmasteredCount((prev) => (nextStatus ? Math.max(0, prev - 1) : prev + 1));
      }
    } catch (err) {
      console.error('[StudentMistakesPage] Update error:', err);
    }
  };

  return (
    <PageWrapper>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <BookMarked className="w-6 h-6 text-[var(--student-primary)]" />
            <span>Mistakes Notebook</span>
          </span>
        }
        description="Every question you missed across live contests and practice quizzes is saved here for revision until fully mastered."
      />

      {/* Tabs & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'pending'
                ? 'bg-[var(--student-primary)] text-white shadow-xs'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Needs Practice</span>
            {unmasteredCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-black">
                {unmasteredCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mastered')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'mastered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mastered Questions</span>
          </button>
        </div>

        <div className="text-xs text-[var(--color-muted-foreground)] font-medium self-end sm:self-center">
          {unmasteredCount === 0 ? '🎉 All caught up!' : `${unmasteredCount} tricky questions to revise`}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <PageSkeleton />
      ) : mistakes.length === 0 ? (
        <div className="p-8 sm:p-14 text-center rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[var(--color-foreground)]">
            {activeTab === 'pending'
              ? 'No pending mistakes found!'
              : 'No mastered questions yet.'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-sm mx-auto">
            {activeTab === 'pending'
              ? 'Great job! Any questions you answer incorrectly during live contests or quizzes will automatically appear here for revision.'
              : 'Mark questions as mastered once you have revised their explanations.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
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

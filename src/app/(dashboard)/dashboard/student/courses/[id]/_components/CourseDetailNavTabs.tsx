'use client';

import React from 'react';
import { BookOpen, Info, Target, Trophy, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabType = 'curriculum' | 'overview' | 'quizzes' | 'leaderboard' | 'doubts';

type Props = {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  courseQuizzesCount: number;
  doubtsEnabled: boolean;
  t: (key: string) => string;
};

export function CourseDetailNavTabs({
  activeTab,
  onTabChange,
  courseQuizzesCount,
  doubtsEnabled,
  t,
}: Props) {
  const tabs = [
    { id: 'curriculum' as TabType, label: t('courses.courseContent'), icon: BookOpen },
    { id: 'overview' as TabType, label: t('common.overview'), icon: Info },
    { id: 'quizzes' as TabType, label: t('nav.quizzes'), icon: Target, count: courseQuizzesCount },
    { id: 'leaderboard' as TabType, label: t('courses.leaderboard'), icon: Trophy },
    ...(doubtsEnabled
      ? [{ id: 'doubts' as TabType, label: t('courseDoubts.tabDoubts'), icon: MessageCircle }]
      : []),
  ];

  return (
    <div
      role="tablist"
      className="flex items-center gap-1 p-1.5 sm:p-2 bg-[var(--surface-muted)]/80 border-b border-[var(--border)]/80 sticky top-0 z-20 backdrop-blur-xl overflow-x-auto scrollbar-none"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'flex-1 md:flex-none inline-flex items-center justify-center gap-2 min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap cursor-pointer focus-ring',
              isActive
                ? 'bg-[var(--card-solid)] text-[var(--student-primary)] border-[var(--student-primary)]/30 shadow-xs'
                : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]/60'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums leading-none',
                  isActive
                    ? 'bg-[var(--student-soft)] text-[var(--student-primary)]'
                    : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)]'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

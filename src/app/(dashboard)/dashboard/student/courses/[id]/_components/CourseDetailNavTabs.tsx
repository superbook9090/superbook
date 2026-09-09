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
    { id: 'curriculum', label: t('courses.courseContent'), icon: <BookOpen className="w-4 h-4" /> },
    { id: 'overview', label: t('common.overview'), icon: <Info className="w-4 h-4" /> },
    {
      id: 'quizzes',
      label: t('nav.quizzes'),
      icon: <Target className="w-4 h-4" />,
      count: courseQuizzesCount,
    },
    { id: 'leaderboard', label: t('courses.leaderboard'), icon: <Trophy className="w-4 h-4" /> },
    ...(doubtsEnabled
      ? [{ id: 'doubts', label: t('courseDoubts.tabDoubts'), icon: <MessageCircle className="w-4 h-4" /> }]
      : []),
  ];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 p-2 sm:p-2.5 bg-[var(--color-surface-muted)]/60 border-b border-[var(--border)] sticky top-0 z-20 backdrop-blur-xl overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as TabType)}
            className={cn(
              'flex-1 md:flex-none flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer',
              isActive
                ? 'bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white shadow-md shadow-[var(--student-primary)]/30 scale-[1.02]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]/80'
            )}
          >
            <span className={cn('transition-transform', isActive && 'scale-110')}>{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-black',
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                )}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

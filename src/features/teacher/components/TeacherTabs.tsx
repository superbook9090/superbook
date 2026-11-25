'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TeacherTabOption<T extends string = string> {
  id: T;
  label: string;
  icon?: ReactNode;
  count?: number;
  tone?: 'primary' | 'danger' | 'success' | 'info' | 'warning';
}

interface TeacherTabsProps<T extends string> {
  tabs: TeacherTabOption<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
}

const activeToneClasses: Record<NonNullable<TeacherTabOption['tone']>, string> = {
  primary: 'bg-[var(--card-solid)] text-[var(--teacher-primary)] border-[var(--teacher-primary)]/35 shadow-xs',
  danger: 'bg-[var(--card-solid)] text-[var(--error)] border-[var(--error)]/35 shadow-xs',
  success: 'bg-[var(--card-solid)] text-[var(--success)] border-[var(--success)]/35 shadow-xs',
  info: 'bg-[var(--card-solid)] text-[var(--info)] border-[var(--info)]/35 shadow-xs',
  warning: 'bg-[var(--card-solid)] text-[var(--warning)] border-[var(--warning)]/35 shadow-xs',
};

const countToneClasses: Record<NonNullable<TeacherTabOption['tone']>, string> = {
  primary: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
  danger: 'bg-[var(--error-light)] text-[var(--error)]',
  success: 'bg-[var(--success-light)] text-[var(--success)]',
  info: 'bg-[var(--info-light)] text-[var(--info)]',
  warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
};

export function TeacherTabs<T extends string>({
  tabs,
  activeTab,
  onChange,
  className,
}: TeacherTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 p-1 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)]/80 overflow-x-auto max-w-full scrollbar-none',
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tone = tab.tone ?? 'primary';

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'inline-flex items-center justify-center gap-2 min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap border transition-all cursor-pointer focus-ring',
              isActive
                ? activeToneClasses[tone]
                : 'border-transparent text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]/60'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums leading-none',
                  isActive
                    ? countToneClasses[tone]
                    : 'bg-[var(--card-solid)]/80 text-[var(--color-muted-foreground)]'
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

export default TeacherTabs;

'use client';

import React from 'react';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

export interface StatItem {
  label: string;
  value: string | number;
  colorClass?: string;
  sublabel?: string;
}

interface ProgressOverviewStatsProps {
  stats: StatItem[];
}

export function ProgressOverviewStats({ stats }: ProgressOverviewStatsProps) {
  return (
    <ResponsiveGrid variant="statsWide">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="student-card flex flex-col justify-center items-center p-3.5 sm:p-4 text-center"
        >
          <p
            className={`text-xl sm:text-2xl font-extrabold tabular-nums font-[family-name:var(--font-display)] ${
              stat.colorClass || 'text-[var(--color-foreground)]'
            }`}
          >
            {stat.value}
          </p>
          <p className="text-xs font-semibold text-[var(--color-muted-foreground)] mt-1 text-center">
            {stat.label}
          </p>
          {stat.sublabel && (
            <p className="text-[10px] text-[var(--color-muted-foreground)]/80 mt-0.5">
              {stat.sublabel}
            </p>
          )}
        </div>
      ))}
    </ResponsiveGrid>
  );
}

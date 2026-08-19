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
          className="stat-tile hover:scale-[1.01] transition-transform flex flex-col justify-center items-center p-3 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)]"
        >
          <p
            className={`text-xl sm:text-2xl font-black ${
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

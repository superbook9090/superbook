'use client';

import React from 'react';

export default function BlogCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-5 sm:p-6 shadow-[var(--shadow-sm)] flex flex-col justify-between animate-pulse"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-24 rounded-full bg-[var(--color-surface-muted)]" />
              <div className="h-4 w-16 rounded bg-[var(--color-surface-muted)]" />
            </div>
            <div className="h-6 w-3/4 rounded bg-[var(--color-surface-muted)] mb-2" />
            <div className="h-6 w-1/2 rounded bg-[var(--color-surface-muted)] mb-4" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-[var(--color-surface-muted)]" />
              <div className="h-4 w-5/6 rounded bg-[var(--color-surface-muted)]" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[var(--color-surface-muted)]" />
              <div className="h-4 w-20 rounded bg-[var(--color-surface-muted)]" />
            </div>
            <div className="h-5 w-20 rounded bg-[var(--color-surface-muted)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

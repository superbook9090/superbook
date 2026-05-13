'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

/** Single-line / block placeholder (shimmer from `src/styles/globals.css`) */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton-surface min-h-[0.5rem] ${className}`} />;
}

function CardSkeletonBlock() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-6 shadow-sm space-y-3">
      <Skeleton className="h-40 w-full rounded-lg" />
      <Skeleton className="h-5 w-3/4 rounded-md" />
      <Skeleton className="h-4 w-1/2 rounded-md" />
    </div>
  );
}

function CompactRowSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

export type PageSkeletonVariant = 'full' | 'content' | 'embed';

/**
 * Unified loading UI for dashboard routes and embedded panels.
 * - `full` — page chrome + toolbar + stat strip + card grid (default for `isLoading` pages)
 * - `content` — compact row grid (folder contents, dense lists)
 * - `embed` — single large block (`<Suspense>` fallbacks)
 */
export function PageSkeleton({ variant = 'full' }: { variant?: PageSkeletonVariant }) {
  if (variant === 'embed') {
    return (
      <div className="page-shell" aria-busy="true" aria-label="Loading">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (variant === 'content') {
    return (
      <div className="w-full" aria-busy="true" aria-label="Loading">
        <CompactRowSkeletonGrid />
      </div>
    );
  }

  return (
    <div className="page-shell stack-page" aria-busy="true" aria-label="Loading">
      <div className="page-skeleton-header">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-8 w-48 max-w-full rounded-lg" />
          <Skeleton className="hidden h-4 w-64 max-w-full rounded-md sm:block" />
        </div>
        <Skeleton className="h-10 w-32 shrink-0 rounded-xl" />
      </div>

      <div className="page-skeleton-toolbar">
        <Skeleton className="h-10 w-full flex-1 rounded-xl" />
        <Skeleton className="h-10 w-full shrink-0 rounded-xl sm:w-36" />
      </div>

      <div className="page-skeleton-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="page-skeleton-stat space-y-2">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
        ))}
      </div>

      <div className="page-skeleton-grid">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeletonBlock key={i} />
        ))}
      </div>
    </div>
  );
}

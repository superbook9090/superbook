'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`
        animate-shimmer
        bg-gray-100
        dark:bg-gray-300
        rounded-md
        ${className}
      `}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border)] space-y-3">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  );
}


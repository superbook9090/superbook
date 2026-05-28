'use client';

import dynamic from 'next/dynamic';
import type { ComponentType, ReactNode } from 'react';
import { PageSkeleton, type PageSkeletonVariant } from '@/components/ui/Skeleton';

export type LoadableSkeleton = PageSkeletonVariant | 'none' | ReactNode;

type LoadableOptions = {
  ssr?: boolean;
  skeleton?: LoadableSkeleton;
};

function isPageSkeletonVariant(
  skeleton: LoadableSkeleton
): skeleton is PageSkeletonVariant {
  return skeleton === 'full' || skeleton === 'content' || skeleton === 'embed';
}

function LoadingFallback({ skeleton }: { skeleton: LoadableSkeleton }) {
  if (skeleton === 'none') return null;
  if (isPageSkeletonVariant(skeleton)) {
    return <PageSkeleton variant={skeleton} />;
  }
  return <>{skeleton}</>;
}

/** Lazy-load a client module with a consistent loading UI. */
export function loadable<P extends object = Record<string, unknown>>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  options: LoadableOptions = {}
) {
  const { ssr = true, skeleton = 'content' } = options;

  return dynamic(factory, {
    ssr,
    loading:
      skeleton === 'none'
        ? undefined
        : () => <LoadingFallback skeleton={skeleton} />,
  });
}

/** Lazy-load client-only modules (charts, editors, Firebase, etc.). */
export function loadableClient<P extends object = Record<string, unknown>>(
  factory: () => Promise<{ default: ComponentType<P> }>,
  skeleton: LoadableSkeleton = 'content'
) {
  return loadable(factory, { ssr: false, skeleton });
}

/** Lazy-load a named export as default (for modules without default export). */
export function loadableNamed<P extends object = Record<string, unknown>>(
  factory: () => Promise<Record<string, unknown>>,
  exportName: string,
  options: LoadableOptions = {}
) {
  return loadable<P>(() =>
    factory().then((mod) => ({
      default: mod[exportName] as ComponentType<P>,
    })),
  options
  );
}

export function chartSkeleton(className = 'h-[300px]') {
  return (
    <div
      className={`${className} rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-5 shadow-sm`}
      aria-hidden
    >
      <div className="skeleton-surface h-full w-full rounded-xl" />
    </div>
  );
}

export function sidebarSkeleton() {
  return (
    <div
      className="hidden md:block w-64 min-h-screen shrink-0 border-r border-[var(--border)] bg-[var(--card-solid)]"
      aria-hidden
    >
      <div className="p-4 space-y-3">
        <div className="skeleton-surface h-10 w-full rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton-surface h-9 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

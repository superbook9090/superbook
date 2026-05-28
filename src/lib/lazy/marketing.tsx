'use client';

import { loadable } from '@/lib/lazy/loadable';

export const LazyAbout = loadable(() => import('@/components/home/About'), {
  skeleton: <section className="landing-section-defer min-h-[28rem]" aria-hidden />,
});

export const LazyFooter = loadable(() => import('@/components/home/Footer'), {
  skeleton: 'none',
});

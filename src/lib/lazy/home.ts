'use client';

import { loadable } from '@/lib/lazy/loadable';

export const LazyHomeHowItWorks = loadable(
  () => import('@/components/home/HowItWorks'),
  { ssr: false, skeleton: 'none' }
);
export const LazyHomeFeatures = loadable(
  () => import('@/components/home/Features'),
  { ssr: false, skeleton: 'none' }
);
export const LazyHomeRoles = loadable(
  () => import('@/components/home/Roles'),
  { ssr: false, skeleton: 'none' }
);
export const LazyHomeAbout = loadable(
  () => import('@/components/home/About'),
  { ssr: false, skeleton: 'none' }
);
export const LazyHomeFooter = loadable(
  () => import('@/components/home/Footer'),
  { ssr: false, skeleton: 'none' }
);

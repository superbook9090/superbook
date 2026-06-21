'use client';

import nextDynamic from 'next/dynamic';
import HeaderStatic from '@/components/home/HeaderStatic';

const HeaderEnhancements = nextDynamic(
  () => import('@/components/home/HeaderEnhancements'),
  { ssr: false }
);

export default function MarketingHeader({ forceScrolled = false }: { forceScrolled?: boolean }) {
  return (
    <>
      <HeaderStatic forceScrolled={forceScrolled} />
      <HeaderEnhancements forceScrolled={forceScrolled} />
    </>
  );
}

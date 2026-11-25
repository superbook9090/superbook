'use client';

import HeaderStatic from '@/components/home/HeaderStatic';

export default function MarketingHeader({ forceScrolled = false }: { forceScrolled?: boolean }) {
  return <HeaderStatic forceScrolled={forceScrolled} />;
}

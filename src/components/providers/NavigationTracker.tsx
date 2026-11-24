'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { recordNavigation } from '@/lib/navigation/historyTracker';

export default function NavigationTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const fullUrl = search ? `${pathname}?${search}` : pathname;
    recordNavigation(fullUrl);
  }, [pathname, search]);

  return null;
}

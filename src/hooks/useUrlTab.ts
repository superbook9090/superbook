'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { updateCurrentEntryUrl } from '@/lib/navigation/historyTracker';

function replaceQueryParam(
  pathname: string,
  paramName: string,
  nextValue: string,
  defaultValue: string
): void {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  if (!nextValue || nextValue === defaultValue) {
    params.delete(paramName);
  } else {
    params.set(paramName, nextValue);
  }
  const query = params.toString();
  const nextUrl = query ? `${pathname}?${query}` : pathname;
  const currentUrl = `${window.location.pathname}${window.location.search}`;
  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, '', nextUrl);
    updateCurrentEntryUrl(nextUrl);
  }
}

/**
 * Syncs a tabbed UI's active tab with a URL search parameter (default: `tab`)
 * using `history.replaceState` so:
 * - Switching tabs never clutters browser history
 * - Returning via browser Back or `router.back()` restores the exact tab
 * - Reloading or sharing the URL opens directly on the active tab
 */
export function useUrlTab<T extends string>(
  validTabs: readonly T[],
  defaultTab: T,
  paramName = 'tab'
): [T, (tab: T) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const validTabsRef = useRef(validTabs);
  validTabsRef.current = validTabs;

  const rawParam = searchParams.get(paramName);
  const urlTab: T =
    rawParam && (validTabs as readonly string[]).includes(rawParam)
      ? (rawParam as T)
      : defaultTab;

  const [activeTab, setActiveTabState] = useState<T>(urlTab);

  useEffect(() => {
    setActiveTabState(urlTab);
  }, [urlTab]);

  const setActiveTab = useCallback(
    (nextTab: T) => {
      if (!(validTabsRef.current as readonly string[]).includes(nextTab)) return;
      setActiveTabState(nextTab);
      replaceQueryParam(pathname, paramName, nextTab, defaultTab);
    },
    [pathname, paramName, defaultTab]
  );

  return [activeTab, setActiveTab];
}

/**
 * Syncs an arbitrary string filter (such as a selected course ID) with a URL search param.
 */
export function useUrlParam(
  paramName: string,
  defaultValue: string
): [string, (value: string) => void] {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const urlValue = searchParams.get(paramName) ?? defaultValue;
  const [value, setValueState] = useState<string>(urlValue);

  useEffect(() => {
    setValueState(urlValue);
  }, [urlValue]);

  const setValue = useCallback(
    (nextValue: string) => {
      setValueState(nextValue);
      replaceQueryParam(pathname, paramName, nextValue, defaultValue);
    },
    [pathname, paramName, defaultValue]
  );

  return [value, setValue];
}

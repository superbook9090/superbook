'use client';

import { useEffect, useState } from 'react';

/** SSR-safe media query subscription. Returns false until mounted. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True for mouse/trackpad pointers — false on touch devices. */
export function usePointerFine(): boolean {
  return useMediaQuery('(pointer: fine)');
}

/** True when the user asked the OS to reduce motion. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

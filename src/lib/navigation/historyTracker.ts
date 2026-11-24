const STORAGE_KEY = 'quizdo_nav_history_v1';
const MAX_ENTRIES = 30;

let memoryStack: string[] | null = null;

function getPathname(url: string): string {
  const qIdx = url.indexOf('?');
  const hIdx = url.indexOf('#');
  let end = url.length;
  if (qIdx !== -1 && qIdx < end) end = qIdx;
  if (hIdx !== -1 && hIdx < end) end = hIdx;
  return url.slice(0, end) || '/';
}

export function isTransientTakeRoute(url: string): boolean {
  const path = getPathname(url);
  return path.endsWith('/take') || path.includes('/quizzes/take');
}

export function isAuthRoute(url: string): boolean {
  const path = getPathname(url);
  return (
    path === '/login' ||
    path === '/register' ||
    path === '/forgot-password' ||
    path === '/reset-password'
  );
}

function readStack(): string[] {
  if (memoryStack !== null) return memoryStack;
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryStack = parsed.filter((x): x is string => typeof x === 'string');
        return memoryStack;
      }
    }
  } catch {
    // Ignore storage read errors in private/restricted browsers
  }
  memoryStack = [];
  return memoryStack;
}

function writeStack(stack: string[]): void {
  const trimmed = stack.length > MAX_ENTRIES ? stack.slice(stack.length - MAX_ENTRIES) : stack;
  memoryStack = trimmed;
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore quota/storage errors
  }
}

export function recordNavigation(fullUrl: string): void {
  if (typeof window === 'undefined' || !fullUrl) return;

  const stack = [...readStack()];

  if (stack.length === 0) {
    try {
      if (document.referrer) {
        const refUrl = new URL(document.referrer);
        if (refUrl.origin === window.location.origin) {
          const refPathAndSearch = `${refUrl.pathname}${refUrl.search}`;
          if (
            getPathname(refPathAndSearch) !== getPathname(fullUrl) &&
            !isTransientTakeRoute(refPathAndSearch) &&
            !isAuthRoute(refPathAndSearch)
          ) {
            stack.push(refPathAndSearch);
          }
        }
      }
    } catch {
      // Ignore invalid referrer URLs
    }
    stack.push(fullUrl);
    writeStack(stack);
    return;
  }

  const last = stack[stack.length - 1];
  if (last === fullUrl) return;

  const currentPath = getPathname(fullUrl);
  const lastPath = getPathname(last);

  // Same pathname (query/tab change via replaceState): update top entry in place
  if (lastPath === currentPath) {
    stack[stack.length - 1] = fullUrl;
    writeStack(stack);
    return;
  }

  // Navigated back to previous stack entry (browser back or router.back)
  if (stack.length >= 2 && getPathname(stack[stack.length - 2]) === currentPath) {
    stack.pop();
    stack[stack.length - 1] = fullUrl;
    writeStack(stack);
    return;
  }

  // Transient quiz/contest take screen replaced by result screen
  if (isTransientTakeRoute(last) && currentPath.endsWith('/result')) {
    stack[stack.length - 1] = fullUrl;
    writeStack(stack);
    return;
  }

  stack.push(fullUrl);
  writeStack(stack);
}

export function updateCurrentEntryUrl(fullUrl: string): void {
  if (typeof window === 'undefined' || !fullUrl) return;
  const stack = [...readStack()];
  if (stack.length === 0) {
    stack.push(fullUrl);
  } else if (getPathname(stack[stack.length - 1]) === getPathname(fullUrl)) {
    stack[stack.length - 1] = fullUrl;
  } else {
    stack.push(fullUrl);
  }
  writeStack(stack);
}

export function canGoBackInApp(): boolean {
  if (typeof window === 'undefined') return false;
  return window.history.length > 1 && readStack().length >= 2;
}

export function getPreviousInternalUrl(): string | null {
  const stack = readStack();
  if (stack.length < 2) return null;
  return stack[stack.length - 2];
}

export function getLastSafeInternalUrl(currentPathname?: string): string | null {
  const stack = readStack();
  for (let i = stack.length - 2; i >= 0; i -= 1) {
    const candidate = stack[i];
    if (isTransientTakeRoute(candidate) || isAuthRoute(candidate)) continue;
    if (currentPathname && getPathname(candidate) === currentPathname) continue;
    return candidate;
  }
  return null;
}

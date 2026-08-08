/**
 * Validate a callback URL to prevent open redirects.
 * Only relative URLs starting with '/' are accepted.
 */
export function isValidCallbackUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return url.startsWith('/') && !url.startsWith('//');
}

export function getSafeCallbackUrl(
  url: string | null | undefined,
  fallback = '/dashboard'
): string {
  return isValidCallbackUrl(url) ? url : fallback;
}

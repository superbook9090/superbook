/**
 * Semantic version comparison utilities for mobile app updates.
 */

/**
 * Normalizes and splits a version string (e.g., 'v1.2.3' -> [1, 2, 3]).
 */
export function parseVersion(version: string | null | undefined): number[] {
  if (!version) return [0];
  // Remove leading 'v' or 'V' and non-version text
  const clean = version.trim().replace(/^v/i, '');
  const parts = clean.split('.').map((p) => {
    const num = parseInt(p, 10);
    return isNaN(num) ? 0 : num;
  });
  return parts.length > 0 ? parts : [0];
}

/**
 * Compares two semantic version strings.
 * Returns:
 *  -1 if v1 < v2 (v1 is older than v2)
 *   0 if v1 === v2
 *   1 if v1 > v2 (v1 is newer than v2)
 */
export function compareVersions(v1: string | null | undefined, v2: string | null | undefined): number {
  const p1 = parseVersion(v1);
  const p2 = parseVersion(v2);

  const maxLength = Math.max(p1.length, p2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = p1[i] ?? 0;
    const num2 = p2[i] ?? 0;

    if (num1 < num2) return -1;
    if (num1 > num2) return 1;
  }

  return 0;
}

/**
 * Returns true if a newer version is available.
 */
export function isUpdateAvailable(
  currentVersion: string | null | undefined,
  latestVersion: string | null | undefined
): boolean {
  if (!currentVersion || !latestVersion) return false;
  return compareVersions(currentVersion, latestVersion) < 0;
}

/**
 * Returns true if the user must update and cannot skip.
 * This is triggered if forceUpdate is globally enabled OR currentVersion is below minRequiredVersion.
 */
export function isForceUpdateRequired(
  currentVersion: string | null | undefined,
  minRequiredVersion: string | null | undefined,
  forceUpdateFlag = false
): boolean {
  if (!currentVersion) return false;
  if (forceUpdateFlag) return true;
  if (!minRequiredVersion) return false;
  return compareVersions(currentVersion, minRequiredVersion) < 0;
}

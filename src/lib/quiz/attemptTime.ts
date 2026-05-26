/** Remaining seconds for an in-progress quiz attempt. */
export function computeQuizTimeRemainingSeconds(
  startedAt: string | Date,
  timeLimitMinutes: number
): number {
  const startedMs = new Date(startedAt).getTime();
  if (Number.isNaN(startedMs)) return 0;

  const elapsedSeconds = Math.floor((Date.now() - startedMs) / 1000);
  const totalSeconds = Math.max(0, timeLimitMinutes) * 60;
  return Math.max(0, totalSeconds - elapsedSeconds);
}

export function isQuizTimeExpired(
  startedAt: string | Date,
  timeLimitMinutes: number
): boolean {
  return computeQuizTimeRemainingSeconds(startedAt, timeLimitMinutes) <= 0;
}

export function computeQuizTimeTakenSeconds(
  startedAt: string | Date,
  timeLimitMinutes: number
): number {
  const startedMs = new Date(startedAt).getTime();
  if (Number.isNaN(startedMs)) return Math.max(0, timeLimitMinutes) * 60;
  return Math.min(
    Math.max(0, timeLimitMinutes) * 60,
    Math.floor((Date.now() - startedMs) / 1000)
  );
}

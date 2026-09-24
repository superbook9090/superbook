/**
 * Resilient offline answer buffer for quizzes and contests.
 * Automatically preserves student selections if network connection drops.
 */

const PREFIX = 'quizdo_attempt_buffer_';

export function saveLocalAttemptAnswers(
  attemptId: string,
  answers: Record<string, number>
): void {
  if (typeof window === 'undefined' || !attemptId) return;
  try {
    localStorage.setItem(
      `${PREFIX}${attemptId}`,
      JSON.stringify({
        answers,
        updatedAt: Date.now(),
      })
    );
  } catch {
    // QuotaExceededError or private browsing restriction
  }
}

export function loadLocalAttemptAnswers(
  attemptId: string
): Record<string, number> | null {
  if (typeof window === 'undefined' || !attemptId) return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${attemptId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.answers || null;
  } catch {
    return null;
  }
}

export function clearLocalAttemptAnswers(attemptId: string): void {
  if (typeof window === 'undefined' || !attemptId) return;
  try {
    localStorage.removeItem(`${PREFIX}${attemptId}`);
  } catch {
    // Ignored
  }
}

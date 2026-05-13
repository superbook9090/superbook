function parseValidDate(date: string | Date | null | undefined): Date | null {
  if (!date) return null;
  let d: Date;
  if (typeof date === 'string') {
    if (!date.trim()) return null;
    d = new Date(date);
  } else if (date instanceof Date) {
    d = date;
  } else {
    return null;
  }
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 1000 || d.getFullYear() > 9999) {
    return null;
  }
  return d;
}

/** Localized date (e.g. "Jan 15, 2024") */
export function formatDate(date: string | Date | null | undefined): string {
  const d = parseValidDate(date);
  if (!d) return 'N/A';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Localized date and time */
export function formatDateTime(date: string | Date | null | undefined): string {
  const d = parseValidDate(date);
  if (!d) return 'N/A';
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Short numeric date per locale */
export function formatShortDate(date: string | Date | null | undefined): string {
  const d = parseValidDate(date);
  if (!d) return 'N/A';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** Time only (e.g. "2:30 PM") */
export function formatTime(date: string | Date | null | undefined): string {
  const d = parseValidDate(date);
  if (!d) return 'N/A';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Duration in seconds → "2m 30s" */
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/** Relative time or falls back to formatDate */
export function getRelativeTime(date: string | Date | null | undefined): string {
  const d = parseValidDate(date);
  if (!d) return 'N/A';

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(d);
}

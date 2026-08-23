'use client';

import ErrorScreen from '@/components/layout/ErrorScreen';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen variant="error" error={error} retry={reset} embedded />;
}

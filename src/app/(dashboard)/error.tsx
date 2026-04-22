'use client';

import { useRoleTheme } from '@/contexts/RoleThemeContext';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { theme } = useRoleTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-[var(--color-card)] rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 bg-[var(--color-error-light)] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[var(--color-error)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">
            Something went wrong
          </h2>
          <p className="text-[var(--color-muted)] mb-6">
            An unexpected error occurred. Please try again later.
          </p>
          <button
            onClick={reset}
            className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl hover:opacity-90 transition-colors`}
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

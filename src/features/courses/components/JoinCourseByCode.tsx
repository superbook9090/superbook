'use client';
import { ROUTES } from '@/constants/routes';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useJoinCourseByCode } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import { cn } from '@/lib/utils';

export default function JoinCourseByCode() {
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const router = useRouter();
  const joinCourse = useJoinCourseByCode();
  const [courseCode, setCourseCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = courseCode.trim();
    if (!code) {
      setError(t('courses.courseCodeRequired'));
      return;
    }

    try {
      await joinCourse.mutateAsync(code.toUpperCase());
      router.push(ROUTES.student.courses);
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.status === 429
            ? t('courses.courseCodeRateLimited')
            : err.message || t('courses.invalidCourseCode')
          : t('courses.invalidCourseCode');
      setError(message);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--card-solid)] p-4 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white',
            theme.gradient
          )}
        >
          <KeyRound className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[var(--color-foreground)] sm:text-lg">
            {t('courses.joinWithCode')}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {t('courses.joinWithCodeDesc')}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1 min-w-0">
          <label htmlFor="courseCode" className="sr-only">
            {t('courses.courseCode')}
          </label>
          <input
            id="courseCode"
            type="text"
            value={courseCode}
            onChange={(e) => {
              setCourseCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder={t('courses.courseCodePlaceholder')}
            maxLength={12}
            autoComplete="off"
            spellCheck={false}
            className="block w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/40 px-4 py-3 text-sm font-mono uppercase tracking-widest text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
          {error && (
            <p className="mt-2 text-sm text-[var(--error)]" role="alert">
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={joinCourse.isPending}
          className={cn(
            'inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
            'bg-gradient-to-r',
            theme.gradient
          )}
        >
          {joinCourse.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('courses.joining')}
            </>
          ) : (
            t('courses.joinCourse')
          )}
        </button>
      </form>
    </div>
  );
}

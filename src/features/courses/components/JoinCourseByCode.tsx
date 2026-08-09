'use client';
import { ROUTES } from '@/constants/routes';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useJoinCourseByCode } from '@/lib/react-query/hooks';
import { getApiErrorMessage } from '@/lib/api/http';
import { cn } from '@/lib/utils';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';

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
      setError(getApiErrorMessage(err, t('courses.invalidCourseCode')));
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
          <TextField
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
            className="font-mono uppercase tracking-widest"
            error={error}
            fullWidth
          />
        <Button
          type="submit"
          disabled={joinCourse.isPending}
          isLoading={joinCourse.isPending}
          className="min-h-[48px] shrink-0"
        >
          {t('courses.joinCourse')}
        </Button>
      </form>
    </div>
  );
}

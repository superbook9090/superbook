'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';

type Props = {
  t: (key: string) => string;
};

export function EmptyEnrollmentState({ t }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 bg-[var(--student-soft)] text-[var(--student-primary)] rounded-2xl flex items-center justify-center mb-6 shadow-xs">
        <BookOpen className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
        {t('courses.noEnrollmentFound')}
      </h2>
      <p className="text-[var(--color-muted-foreground)] mb-6">
        {t('courses.noEnrollmentDesc')}
      </p>
      <Button
        onClick={() => router.push(ROUTES.student.courses)}
        variant="primary"
        className="btn-premium"
      >
        {t('courses.backToCourses')}
      </Button>
    </div>
  );
}

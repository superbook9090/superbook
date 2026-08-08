'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { enrollInCourse } from '@/lib/api/enrollments';
import { ROUTES } from '@/constants/routes';
import Alert from '@/components/ui/Alert';

interface AutoEnrollHandlerProps {
  courseId: string;
}

export default function AutoEnrollHandler({ courseId }: AutoEnrollHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSessionStore();
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const shouldEnroll = searchParams.get('enroll') === 'true';

  useEffect(() => {
    if (!shouldEnroll || started || status === 'loading') return;

    if (status === 'unauthenticated') {
      // Let the "Enroll Free" CTA handle unauthenticated users
      return;
    }

    setStarted(true);

    enrollInCourse(courseId)
      .then(() => {
        router.push(ROUTES.student.courses);
      })
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : 'Could not enroll in course.';
        setError(message);
      });
  }, [shouldEnroll, started, status, courseId, router]);

  if (!error) return null;

  return (
    <Alert
      type="error"
      message={error}
      onClose={() => setError(null)}
      className="mb-6"
    />
  );
}

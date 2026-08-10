'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { enrollInCourse } from '@/lib/api/enrollments';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';

interface AutoEnrollHandlerProps {
  courseId: string;
}

export default function AutoEnrollHandler({ courseId }: AutoEnrollHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSessionStore();
  const { addAlert } = useAlert();
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
        addAlert({ type: 'error', message });
      });
  }, [shouldEnroll, started, status, courseId, router, addAlert]);

  return null;
}

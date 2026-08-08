import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ROUTES } from '@/constants/routes';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';
import { getDashboardHomePath } from '@/lib/roles';
import { joinCourseByCodeAction } from './actions';

export default async function JoinCoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await ensureFeatureEnabled('enableCourses');

  const { code } = await params;
  const courseCode = code.trim().toUpperCase();

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(
      `${ROUTES.register}?callbackUrl=${encodeURIComponent(`/join/${courseCode}`)}`
    );
  }

  // Only students can enroll via a course code
  if (session.user.role !== 'student') {
    redirect(getDashboardHomePath(session.user.role));
  }

  const result = await joinCourseByCodeAction(
    session.user.id,
    (session.user as { organizationId?: string | null }).organizationId ?? null,
    courseCode
  );

  if (!result.ok) {
    redirect(
      `${ROUTES.student.root}?joinError=${encodeURIComponent(result.message)}`
    );
  }

  redirect(ROUTES.student.courses);
}

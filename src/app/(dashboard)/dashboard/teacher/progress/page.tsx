import type { Metadata } from 'next';
import { TeacherProgressView } from '@/features/progress/components/teacher/TeacherProgressView';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const metadata: Metadata = {
  title: 'Cohort & Student Progress | Quiz Do',
  description: 'Track student completion rates, quiz scores, and cohort performance.',
};

export default async function TeacherProgressPage() {
  await ensureFeatureEnabled('enableCourses');
  return <TeacherProgressView />;
}

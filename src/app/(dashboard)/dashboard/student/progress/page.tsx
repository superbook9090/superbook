import type { Metadata } from 'next';
import { StudentProgressView } from '@/features/progress/components/student/StudentProgressView';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const metadata: Metadata = {
  title: 'My Progress | Quiz Do',
  description: 'Track your course completion, quiz performance, and learning journey.',
};

export default async function StudentProgressPage() {
  await ensureFeatureEnabled('enableCourses');
  return <StudentProgressView />;
}

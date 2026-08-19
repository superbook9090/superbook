import type { Metadata } from 'next';
import { AdminProgressView } from '@/features/progress/components/admin/AdminProgressView';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const metadata: Metadata = {
  title: 'Platform Learning Progress | Quiz Do',
  description: 'Monitor platform-wide course completion health and learning metrics.',
};

export default async function AdminProgressPage() {
  await ensureFeatureEnabled('enableCourses');
  return <AdminProgressView />;
}

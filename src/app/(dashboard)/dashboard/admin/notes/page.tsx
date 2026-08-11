import type { Metadata } from 'next';
import { NotesPage } from '@/features/notes/components/NotesPage';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const metadata: Metadata = {
  title: 'Admin Notes | Quiz Do',
  description: 'Manage and store administrative reference notes.',
};

export default async function AdminNotesPage() {
  await ensureFeatureEnabled('enableNotes');
  return <NotesPage />;
}

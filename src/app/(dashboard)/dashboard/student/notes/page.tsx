import type { Metadata } from 'next';
import { NotesPage } from '@/features/notes/components/NotesPage';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const metadata: Metadata = {
  title: 'My Notes | Quiz Do',
  description: 'Manage and store your personal study notes.',
};

export default async function StudentNotesPage() {
  await ensureFeatureEnabled('enableNotes');
  return <NotesPage />;
}

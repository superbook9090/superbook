import type { Metadata } from 'next';
import { NotesPage } from '@/features/notes/components/NotesPage';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const metadata: Metadata = {
  title: 'Teacher Notes | Quiz Do',
  description: 'Manage and store your teaching and reference notes.',
};

export default async function TeacherNotesPage() {
  await ensureFeatureEnabled('enableNotes');
  return <NotesPage />;
}

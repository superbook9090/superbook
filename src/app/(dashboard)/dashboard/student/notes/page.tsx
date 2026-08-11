import type { Metadata } from 'next';
import { NotesPage } from '@/features/notes/components/NotesPage';

export const metadata: Metadata = {
  title: 'My Notes | Quiz Do',
  description: 'Manage and store your personal study notes.',
};

export default function StudentNotesPage() {
  return <NotesPage />;
}

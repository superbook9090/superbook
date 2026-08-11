import type { Metadata } from 'next';
import { NotesPage } from '@/features/notes/components/NotesPage';

export const metadata: Metadata = {
  title: 'Teacher Notes | Quiz Do',
  description: 'Manage and store your teaching and reference notes.',
};

export default function TeacherNotesPage() {
  return <NotesPage />;
}

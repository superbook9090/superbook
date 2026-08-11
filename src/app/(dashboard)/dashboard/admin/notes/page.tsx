import type { Metadata } from 'next';
import { NotesPage } from '@/features/notes/components/NotesPage';

export const metadata: Metadata = {
  title: 'Admin Notes | Quiz Do',
  description: 'Manage and store administrative reference notes.',
};

export default function AdminNotesPage() {
  return <NotesPage />;
}

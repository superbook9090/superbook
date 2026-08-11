'use client';

import React, { useState } from 'react';
import { Notebook, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotes, type NoteItem } from '@/hooks/useNotes';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { EmptyState } from '@/components/layout/EmptyState';
import Button from '@/components/ui/Button';
import { NotesHeader } from './NotesHeader';
import { NotesLimitBanner } from './NotesLimitBanner';
import { NoteCard } from './NoteCard';
import { NoteEditorModal } from './NoteEditorModal';
import { NoteDeleteDialog } from './NoteDeleteDialog';

export function NotesPage() {
  const { t } = useTranslation();
  const {
    notes,
    allNotesCount,
    limit,
    maxWordsPerPage,
    isLimitReached,
    loading,
    searchQuery,
    setSearchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [deletingNote, setDeletingNote] = useState<NoteItem | null>(null);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSave = async (payload: {
    title: string;
    content: string;
    color: NoteItem['color'];
  }) => {
    if (editingNote) {
      return updateNote(editingNote._id, payload);
    }
    return createNote(payload);
  };

  return (
    <PageWrapper className="space-y-6">
      <NotesHeader
        usedPages={allNotesCount}
        limitPages={limit}
        isLimitReached={isLimitReached}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={handleOpenAdd}
      />

      {isLimitReached ? (
        <NotesLimitBanner usedPages={allNotesCount} limitPages={limit} />
      ) : null}

      {loading ? (
        <div className="py-12 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={Notebook}
          title={t('notes.noNotesTitle')}
          description={t('notes.noNotesDesc')}
          action={
            !isLimitReached ? (
              <Button onClick={handleOpenAdd} variant="primary" size="md">
                <Plus className="w-4 h-4 mr-2" />
                <span>{t('notes.addNote')}</span>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ResponsiveGrid variant="cards">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              maxWordsPerPage={maxWordsPerPage}
              onEdit={handleOpenEdit}
              onDelete={setDeletingNote}
              onTogglePin={togglePin}
            />
          ))}
        </ResponsiveGrid>
      )}

      <NoteEditorModal
        isOpen={editorOpen}
        note={editingNote}
        maxWordsPerPage={maxWordsPerPage}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />

      <NoteDeleteDialog
        isOpen={Boolean(deletingNote)}
        note={deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={async (id) => deleteNote(id)}
      />
    </PageWrapper>
  );
}

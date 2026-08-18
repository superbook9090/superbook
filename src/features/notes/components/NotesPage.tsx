'use client';

import React, { useState } from 'react';
import { Notebook, Plus, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotes, type NoteItem } from '@/hooks/useNotes';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { EmptyState } from '@/components/layout/EmptyState';
import Button from '@/components/ui/Button';
import { NotesHeader } from './NotesHeader';
import { NotesStats } from './NotesStats';
import { NotesFilterBar } from './NotesFilterBar';
import { NotesLimitBanner } from './NotesLimitBanner';
import { NoteCard } from './NoteCard';
import { NoteListItem } from './NoteListItem';
import { NoteEditorModal } from './NoteEditorModal';
import { NotePreviewModal } from './NotePreviewModal';
import { NoteDeleteDialog } from './NoteDeleteDialog';

export function NotesPage() {
  const { t } = useTranslation();
  const {
    notes,
    rawNotes,
    allNotesCount,
    limit,
    maxWordsPerPage,
    isLimitReached,
    isFiltered,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    showPinnedOnly,
    setShowPinnedOnly,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    stats,
    clearFilters,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
  } = useNotes();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteItem | null>(null);
  const [deletingNote, setDeletingNote] = useState<NoteItem | null>(null);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (note: NoteItem) => {
    setViewingNote(null);
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleOpenView = (note: NoteItem) => {
    setViewingNote(note);
  };

  const handleSave = async (payload: {
    title: string;
    content: string;
    color: NoteItem['color'];
    isPinned: boolean;
    tags: string[];
  }) => {
    if (editingNote) {
      return updateNote(editingNote._id, payload);
    }
    return createNote(payload);
  };

  return (
    <PageWrapper className="space-y-6">
      {/* Header */}
      <NotesHeader
        isLimitReached={isLimitReached}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Quota Limit Warning Banner if full */}
      {isLimitReached ? (
        <NotesLimitBanner usedPages={allNotesCount} limitPages={limit} />
      ) : null}

      {/* Metric Stats Strip */}
      <NotesStats
        usedPages={allNotesCount}
        limitPages={limit}
        totalWords={stats.totalWords}
        avgWords={stats.avgWords}
        pinnedCount={stats.pinnedCount}
        totalTags={stats.allTags.length}
        showPinnedOnly={showPinnedOnly}
        onTogglePinnedFilter={() => setShowPinnedOnly(!showPinnedOnly)}
      />

      {/* Filter, Search & View Controls */}
      <NotesFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        allTags={stats.allTags}
        categoryCounts={stats.categoryCounts}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFiltered={isFiltered}
        onClearFilters={clearFilters}
      />

      {/* Main Content Area */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-9 h-9 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[var(--color-muted)] font-medium">Loading your notes...</span>
        </div>
      ) : rawNotes.length === 0 ? (
        /* No notes at all in database */
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
      ) : notes.length === 0 ? (
        /* Notes exist, but none match active search/filters */
        <EmptyState
          icon={Notebook}
          title={t('notes.noMatchingNotes')}
          description={t('notes.noMatchingNotesDesc')}
          action={
            <Button onClick={clearFilters} variant="secondary" size="md">
              <RotateCcw className="w-4 h-4 mr-2" />
              <span>{t('notes.clearFilters')}</span>
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <ResponsiveGrid variant="cards">
          {notes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              maxWordsPerPage={maxWordsPerPage}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={setDeletingNote}
              onTogglePin={togglePin}
              onSelectTag={(t) => setSelectedTag(t)}
            />
          ))}
        </ResponsiveGrid>
      ) : (
        /* Dense List View */
        <div className="space-y-2.5">
          {notes.map((note) => (
            <NoteListItem
              key={note._id}
              note={note}
              maxWordsPerPage={maxWordsPerPage}
              onView={handleOpenView}
              onEdit={handleOpenEdit}
              onDelete={setDeletingNote}
              onTogglePin={togglePin}
              onSelectTag={(t) => setSelectedTag(t)}
            />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <NoteEditorModal
        isOpen={editorOpen}
        note={editingNote}
        maxWordsPerPage={maxWordsPerPage}
        onClose={() => setEditorOpen(false)}
        onSave={handleSave}
      />

      {/* Preview / Reader Modal */}
      <NotePreviewModal
        isOpen={Boolean(viewingNote)}
        note={viewingNote}
        maxWordsPerPage={maxWordsPerPage}
        onClose={() => setViewingNote(null)}
        onEdit={handleOpenEdit}
        onDelete={(note) => {
          setViewingNote(null);
          setDeletingNote(note);
        }}
        onTogglePin={togglePin}
      />

      {/* Delete Confirmation Modal */}
      <NoteDeleteDialog
        isOpen={Boolean(deletingNote)}
        note={deletingNote}
        onClose={() => setDeletingNote(null)}
        onConfirm={async (id) => deleteNote(id)}
      />
    </PageWrapper>
  );
}

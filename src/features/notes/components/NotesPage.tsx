'use client';

import React, { useState, useMemo } from 'react';
import { Notebook, Plus, RotateCcw, Users, Crown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotes, type NoteItem, type NoteScope } from '@/hooks/useNotes';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import { useUrlTab } from '@/hooks/useUrlTab';
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
  const session = useSessionStore((s) => s.session);
  const isSuper = isSuperAdmin(session?.user?.role);
  const [rawScope, setScope] = useUrlTab<NoteScope>(['mine', 'all'], 'mine', 'scope');
  const scope: NoteScope = isSuper ? rawScope : 'mine';
  const isAllScope = scope === 'all';

  const {
    notes,
    rawNotes,
    allNotesCount,
    ownNotesCount,
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
  } = useNotes(scope);

  const uniqueAuthorsCount = useMemo(() => {
    if (!isAllScope) return 0;
    const ids = new Set(rawNotes.map((n) => n.owner?._id || n.userId).filter(Boolean));
    return ids.size;
  }, [isAllScope, rawNotes]);

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
    <PageWrapper>
      {/* Header */}
      <NotesHeader
        isLimitReached={isLimitReached}
        onOpenAddModal={handleOpenAdd}
      />

      {/* Superadmin-only Scope Toggle: My Notes vs All Users' Notes */}
      {isSuper && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[var(--color-surface-muted)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setScope('mine')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[38px] ${
                scope === 'mine'
                  ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-xs border border-[var(--color-border)]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              <Notebook className="w-4 h-4" />
              <span>{t('notes.myNotesTab')}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-bold bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
                {ownNotesCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setScope('all')}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[38px] ${
                scope === 'all'
                  ? 'bg-[var(--card-solid)] text-amber-500 shadow-xs border border-amber-500/30'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{t('notes.allUsersNotes')}</span>
              <Crown className="w-3.5 h-3.5 text-amber-500" />
            </button>
          </div>
          {isAllScope && (
            <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
              {t('notes.allUsersNotesHint')}
            </span>
          )}
        </div>
      )}

      {/* Quota Limit Warning Banner if full (personal scope only) */}
      {!isAllScope && isLimitReached ? (
        <NotesLimitBanner usedPages={ownNotesCount} limitPages={limit} />
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
        isAllScope={isAllScope}
        uniqueAuthorsCount={uniqueAuthorsCount}
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
          <span className="text-xs text-[var(--color-muted)] font-medium">{t('notes.loadingNotes')}</span>
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

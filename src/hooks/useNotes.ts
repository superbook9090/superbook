import { useState, useEffect, useCallback, useMemo } from 'react';
import type { NoteItem, NoteColor, NoteSortOption, NoteViewMode } from '@/features/notes/types';
import { computeNotesStats, filterAndSortNotes } from '@/features/notes/utils';

export type { NoteItem, NoteColor, NoteSortOption, NoteViewMode };

const VIEW_MODE_STORAGE_KEY = 'quizdo_notes_view_mode';

export function useNotes() {
  const [rawNotes, setRawNotes] = useState<NoteItem[]>([]);
  const [limit, setLimit] = useState<number>(5);
  const [maxWordsPerPage, setMaxWordsPerPage] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<NoteColor | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<NoteSortOption>('updatedAt-desc');
  const [viewMode, setViewModeState] = useState<NoteViewMode>('grid');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (saved === 'grid' || saved === 'list') {
        setViewModeState(saved);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const setViewMode = useCallback((mode: NoteViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      setRawNotes(data.notes || []);
      setLimit(data.limit ?? 5);
      setMaxWordsPerPage(data.maxWordsPerPage ?? 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading notes';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (payload: { title: string; content: string; color?: NoteColor; tags?: string[]; isPinned?: boolean }) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create note');
        await fetchNotes();
        return { success: true, note: data };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create note';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setSaving(false);
      }
    },
    [fetchNotes]
  );

  const updateNote = useCallback(
    async (
      id: string,
      payload: Partial<{ title: string; content: string; color: NoteColor; isPinned: boolean; tags: string[] }>
    ) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`/api/notes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update note');
        setRawNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...data } : n)));
        return { success: true, note: data };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update note';
        setError(msg);
        return { success: false, error: msg };
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const deleteNote = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete note');
      setRawNotes((prev) => prev.filter((n) => n._id !== id));
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete note';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setSaving(false);
    }
  }, []);

  const togglePin = useCallback(
    async (note: NoteItem) => updateNote(note._id, { isPinned: !note.isPinned }),
    [updateNote]
  );

  const duplicateNote = useCallback(
    async (note: NoteItem) => {
      return createNote({
        title: `${note.title} (Copy)`,
        content: note.content,
        color: note.color,
        tags: note.tags ? [...note.tags] : [],
        isPinned: false,
      });
    },
    [createNote]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
    setShowPinnedOnly(false);
  }, []);

  const stats = useMemo(() => computeNotesStats(rawNotes), [rawNotes]);

  const filteredNotes = useMemo(
    () =>
      filterAndSortNotes(rawNotes, {
        searchQuery,
        selectedCategory,
        selectedTag,
        showPinnedOnly,
        sortBy,
      }),
    [rawNotes, searchQuery, selectedCategory, selectedTag, showPinnedOnly, sortBy]
  );

  return {
    notes: filteredNotes,
    rawNotes,
    allNotesCount: rawNotes.length,
    limit,
    maxWordsPerPage,
    isLimitReached: rawNotes.length >= limit,
    isFiltered: Boolean(searchQuery.trim() || selectedCategory !== 'all' || selectedTag || showPinnedOnly),
    loading,
    saving,
    error,
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
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    duplicateNote,
    setError,
  };
}

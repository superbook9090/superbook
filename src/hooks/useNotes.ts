import { useState, useEffect, useCallback, useMemo } from 'react';

export interface NoteItem {
  _id: string;
  userId: string;
  title: string;
  content: string;
  wordCount: number;
  color: 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate';
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [limit, setLimit] = useState<number>(5);
  const [maxWordsPerPage, setMaxWordsPerPage] = useState<number>(1000);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await res.json();
      setNotes(data.notes || []);
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
    async (payload: { title: string; content: string; color?: string; tags?: string[] }) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Failed to create note');
        }
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
      payload: Partial<{ title: string; content: string; color: string; isPinned: boolean; tags: string[] }>
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
        if (!res.ok) {
          throw new Error(data.message || 'Failed to update note');
        }
        setNotes((prev) => prev.map((n) => (n._id === id ? { ...n, ...data } : n)));
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
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete note');
      }
      setNotes((prev) => prev.filter((n) => n._id !== id));
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
    async (note: NoteItem) => {
      return updateNote(note._id, { isPinned: !note.isPinned });
    },
    [updateNote]
  );

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const isLimitReached = notes.length >= limit;

  return {
    notes: filteredNotes,
    allNotesCount: notes.length,
    limit,
    maxWordsPerPage,
    isLimitReached,
    loading,
    saving,
    error,
    searchQuery,
    setSearchQuery,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    setError,
  };
}

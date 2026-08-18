import type { NoteItem, NoteColor, NoteSortOption } from './types';

export function computeNotesStats(rawNotes: NoteItem[]) {
  const totalNotes = rawNotes.length;
  const totalWords = rawNotes.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
  const avgWords = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
  const pinnedCount = rawNotes.filter((n) => n.isPinned).length;
  const tagSet = new Set<string>();
  const categoryCounts: Record<string, number> = { all: totalNotes };

  rawNotes.forEach((n) => {
    n.tags?.forEach((t) => tagSet.add(t));
    const col = n.color || 'blue';
    categoryCounts[col] = (categoryCounts[col] || 0) + 1;
  });

  return {
    totalNotes,
    totalWords,
    avgWords,
    pinnedCount,
    allTags: Array.from(tagSet),
    categoryCounts,
  };
}

export function filterAndSortNotes(
  rawNotes: NoteItem[],
  filters: {
    searchQuery: string;
    selectedCategory: NoteColor | 'all';
    selectedTag: string | null;
    showPinnedOnly: boolean;
    sortBy: NoteSortOption;
  }
): NoteItem[] {
  let result = [...rawNotes];

  if (filters.showPinnedOnly) {
    result = result.filter((n) => n.isPinned);
  }

  if (filters.selectedCategory !== 'all') {
    result = result.filter((n) => (n.color || 'blue') === filters.selectedCategory);
  }

  if (filters.selectedTag) {
    result = result.filter((n) => n.tags?.includes(filters.selectedTag!));
  }

  if (filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase();
    result = result.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  result.sort((a, b) => {
    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }
    switch (filters.sortBy) {
      case 'createdAt-desc':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'createdAt-asc':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'wordCount-desc':
        return (b.wordCount || 0) - (a.wordCount || 0);
      case 'updatedAt-desc':
      default:
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    }
  });

  return result;
}

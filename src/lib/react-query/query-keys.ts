/** Centralized React Query keys (Phase 1 — extend per domain). */
export const queryKeys = {
  favorites: {
    all: ['favorites'] as const,
    list: (page: number, limit: number) => ['favorites', 'list', page, limit] as const,
    ids: ['favorites', 'ids'] as const,
  },
  doubts: {
    all: (courseId: string) => ['doubts', courseId] as const,
  }
} as const;

export const favoritesListDefaults = { page: 1, limit: 20 } as const;

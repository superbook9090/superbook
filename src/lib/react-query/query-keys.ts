/** Centralized React Query keys for frontend caching and invalidation. */
export const queryKeys = {
  account: {
    info: (userId?: string) => ['account', 'info', userId || 'anon'] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    admin: (orgScope: string, startDate: string, endDate: string) =>
      ['analytics', 'admin', orgScope, startDate, endDate] as const,
  },
  organizations: {
    all: ['organizations'] as const,
    list: (includeInactive = true) => ['organizations', 'list', includeInactive] as const,
    detail: (orgId: string) => ['organizations', 'detail', orgId] as const,
  },
  adminUsers: {
    all: ['admin-users'] as const,
    list: (orgScope: string, params: Record<string, unknown>) =>
      ['admin-users', 'list', orgScope, params] as const,
  },
  adminCourses: {
    all: ['admin-courses'] as const,
    list: (orgScope: string) => ['admin-courses', 'list', orgScope] as const,
  },
  adminChallenges: {
    all: ['admin-challenges'] as const,
  },
  files: {
    all: ['files'] as const,
    folder: (orgScope: string, parentId: string | null) =>
      ['files', 'folder', orgScope, parentId || 'root'] as const,
  },
  notifications: {
    inbox: (userId?: string) => ['notifications', 'inbox', userId || 'anon'] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    list: (page: number, limit: number) => ['favorites', 'list', page, limit] as const,
    ids: ['favorites', 'ids'] as const,
  },
  doubts: {
    all: (courseId: string) => ['doubts', courseId] as const,
  },
} as const;

export const favoritesListDefaults = { page: 1, limit: 20 } as const;

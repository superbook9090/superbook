export type NoteColor = 'blue' | 'amber' | 'emerald' | 'rose' | 'purple' | 'slate';

export type NoteSortOption =
  | 'updatedAt-desc'
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'title-asc'
  | 'wordCount-desc';

export type NoteViewMode = 'grid' | 'list';

export interface NoteItem {
  _id: string;
  userId: string;
  title: string;
  content: string;
  wordCount: number;
  color: NoteColor;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteCategoryConfig {
  id: NoteColor;
  labelKey: string;
  badgeClass: string;
  borderClass: string;
  gradientClass: string;
  dotClass: string;
  activeRingClass: string;
}

export const NOTE_CATEGORIES: Record<NoteColor, NoteCategoryConfig> = {
  blue: {
    id: 'blue',
    labelKey: 'notes.categoryLecture',
    badgeClass: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]/20',
    borderClass: 'border-[var(--info)]/30',
    gradientClass: 'from-[var(--info)] to-[var(--primary)]',
    dotClass: 'bg-[var(--info)]',
    activeRingClass: 'ring-[var(--info)]',
  },
  amber: {
    id: 'amber',
    labelKey: 'notes.categoryExam',
    badgeClass: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/20',
    borderClass: 'border-[var(--warning)]/30',
    gradientClass: 'from-[var(--warning)] to-[var(--error)]',
    dotClass: 'bg-[var(--warning)]',
    activeRingClass: 'ring-[var(--warning)]',
  },
  emerald: {
    id: 'emerald',
    labelKey: 'notes.categoryLesson',
    badgeClass: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/20',
    borderClass: 'border-[var(--success)]/30',
    gradientClass: 'from-[var(--success)] to-[var(--info)]',
    dotClass: 'bg-[var(--success)]',
    activeRingClass: 'ring-[var(--success)]',
  },
  rose: {
    id: 'rose',
    labelKey: 'notes.categoryAssignment',
    badgeClass: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]/20',
    borderClass: 'border-[var(--error)]/30',
    gradientClass: 'from-[var(--error)] to-[var(--teacher-primary)]',
    dotClass: 'bg-[var(--error)]',
    activeRingClass: 'ring-[var(--error)]',
  },
  purple: {
    id: 'purple',
    labelKey: 'notes.categoryReference',
    badgeClass: 'bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20',
    borderClass: 'border-[var(--primary)]/30',
    gradientClass: 'from-[var(--primary)] to-[var(--teacher-primary)]',
    dotClass: 'bg-[var(--primary)]',
    activeRingClass: 'ring-[var(--primary)]',
  },
  slate: {
    id: 'slate',
    labelKey: 'notes.categoryQuick',
    badgeClass: 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border-[var(--border)]',
    borderClass: 'border-[var(--border)]',
    gradientClass: 'from-[var(--color-muted)] to-[var(--color-muted-foreground)]',
    dotClass: 'bg-[var(--color-muted)]',
    activeRingClass: 'ring-[var(--color-muted)]',
  },
};

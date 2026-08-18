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
    badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    borderClass: 'border-blue-500/30 dark:border-blue-500/20',
    gradientClass: 'from-blue-500 to-indigo-500',
    dotClass: 'bg-blue-500',
    activeRingClass: 'ring-blue-500',
  },
  amber: {
    id: 'amber',
    labelKey: 'notes.categoryExam',
    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderClass: 'border-amber-500/30 dark:border-amber-500/20',
    gradientClass: 'from-amber-500 to-orange-500',
    dotClass: 'bg-amber-500',
    activeRingClass: 'ring-amber-500',
  },
  emerald: {
    id: 'emerald',
    labelKey: 'notes.categoryLesson',
    badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderClass: 'border-emerald-500/30 dark:border-emerald-500/20',
    gradientClass: 'from-emerald-500 to-teal-500',
    dotClass: 'bg-emerald-500',
    activeRingClass: 'ring-emerald-500',
  },
  rose: {
    id: 'rose',
    labelKey: 'notes.categoryAssignment',
    badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    borderClass: 'border-rose-500/30 dark:border-rose-500/20',
    gradientClass: 'from-rose-500 to-pink-500',
    dotClass: 'bg-rose-500',
    activeRingClass: 'ring-rose-500',
  },
  purple: {
    id: 'purple',
    labelKey: 'notes.categoryReference',
    badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    borderClass: 'border-purple-500/30 dark:border-purple-500/20',
    gradientClass: 'from-purple-500 to-fuchsia-500',
    dotClass: 'bg-purple-500',
    activeRingClass: 'ring-purple-500',
  },
  slate: {
    id: 'slate',
    labelKey: 'notes.categoryQuick',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    borderClass: 'border-slate-500/30 dark:border-slate-500/20',
    gradientClass: 'from-slate-500 to-gray-600',
    dotClass: 'bg-slate-500',
    activeRingClass: 'ring-slate-500',
  },
};

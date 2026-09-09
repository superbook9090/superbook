import React from 'react';
import { BookOpen, Award, CheckCircle2, Sparkles } from 'lucide-react';

type Props = {
  description: string;
  category: string;
  progress: number;
  t: (key: string) => string;
};

export function OverviewTab({ description, category, progress, t }: Props) {
  const isCompleted = progress === 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Description Card */}
      <div className="p-6 sm:p-7 rounded-2xl antigravity-glass border border-[var(--border)] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[var(--student-primary)]">
          <BookOpen className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('common.overview')}
          </h2>
        </div>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line">
          {description || t('courses.noDescription')}
        </p>
      </div>

      {/* Course Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl antigravity-glass border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--student-primary)]">
              {t('courses.category')}
            </h4>
          </div>
          <p className="text-base font-bold text-[var(--color-foreground)]">{category || 'General'}</p>
        </div>

        <div className="p-5 rounded-2xl antigravity-glass border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('dashboard.progress')}
            </h4>
          </div>
          <p className="text-base font-bold text-[var(--color-foreground)]">
            {progress}% {t('dashboard.completed')}
          </p>
        </div>

        <div className="p-5 rounded-2xl antigravity-glass border border-[var(--border)] shadow-xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Certificate
            </h4>
          </div>
          <p className="text-base font-bold text-[var(--color-foreground)]">
            {isCompleted ? 'Earned & Available 🎉' : 'Issued upon 100% completion'}
          </p>
        </div>
      </div>
    </div>
  );
}

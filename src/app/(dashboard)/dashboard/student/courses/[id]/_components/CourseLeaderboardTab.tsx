'use client';

import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { LazyCourseLeaderboard } from '@/lib/lazy';

type Props = {
  courseId: string;
  courseTitle: string;
  currentUserId?: string;
  t: (key: string) => string;
};

export function CourseLeaderboardTab({
  courseId,
  courseTitle,
  currentUserId,
  t,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center justify-between p-4 rounded-2xl antigravity-glass border border-[var(--border)] shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {t('courses.leaderboard')}
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Top performing students in this course
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time</span>
        </span>
      </div>

      <div className="antigravity-glass rounded-2xl border border-[var(--border)] overflow-hidden shadow-md">
        <LazyCourseLeaderboard
          courseId={courseId}
          courseTitle={courseTitle}
          showUserRank={true}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}

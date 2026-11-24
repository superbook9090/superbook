'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Zap, Award } from 'lucide-react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalXp: number;
  lastActiveDate: string;
}

export function StreakBadge({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<StreakData | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/user/streak')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (isMounted && d) setData(d);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  if (!data) return null;

  const { currentStreak, longestStreak, totalXp } = data;
  const isStreakActive = currentStreak > 0;

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400"
        title={`${currentStreak} Day Learning Streak • ${totalXp} Total XP`}
      >
        <Flame className={`w-3.5 h-3.5 ${isStreakActive ? 'text-amber-500 animate-pulse fill-amber-500' : 'text-zinc-400'}`} />
        <span>{currentStreak}d</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-pointer flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-500/25 hover:border-amber-500/40 transition-all shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isStreakActive
                ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-amber-500/30'
                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
            }`}
          >
            <Flame className={`w-4 h-4 ${isStreakActive ? 'animate-bounce fill-current' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-[var(--color-foreground)]">
                {currentStreak} Day{currentStreak === 1 ? '' : 's'} Streak
              </span>
            </div>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">
              {isStreakActive ? 'Active today! Keep it going' : 'Take a quiz to start streak'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] font-mono font-black shrink-0">
          <Zap className="w-3 h-3 fill-current text-amber-500" />
          <span>{totalXp} XP</span>
        </div>
      </div>

      {/* Popover Breakdown on Hover */}
      {showTooltip && (
        <div className="absolute left-0 bottom-full mb-2 w-64 p-3.5 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xl z-50 text-xs space-y-2.5 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 font-bold text-[var(--color-foreground)]">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Learning Milestones</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">Best: {longestStreak}d</span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className={`flex items-center justify-between p-1.5 rounded-lg ${currentStreak >= 3 ? 'bg-amber-500/10 text-amber-600 font-bold' : 'text-zinc-400'}`}>
              <span>🥉 3-Day Bronze Scholar</span>
              <span>{currentStreak >= 3 ? 'Unlocked ✓' : `${Math.max(0, 3 - currentStreak)}d left`}</span>
            </div>
            <div className={`flex items-center justify-between p-1.5 rounded-lg ${currentStreak >= 7 ? 'bg-amber-500/10 text-amber-600 font-bold' : 'text-zinc-400'}`}>
              <span>🥈 7-Day Silver Focus</span>
              <span>{currentStreak >= 7 ? 'Unlocked ✓' : `${Math.max(0, 7 - currentStreak)}d left`}</span>
            </div>
            <div className={`flex items-center justify-between p-1.5 rounded-lg ${currentStreak >= 30 ? 'bg-amber-500/10 text-amber-600 font-bold' : 'text-zinc-400'}`}>
              <span>🥇 30-Day Gold Master</span>
              <span>{currentStreak >= 30 ? 'Unlocked ✓' : `${Math.max(0, 30 - currentStreak)}d left`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StreakBadge;

'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Flame, Award, Zap, Timer } from 'lucide-react';

const mockOptions = [
  { id: 'A', text: 'Photosynthesis', isCorrect: false },
  { id: 'B', text: 'Cellular Respiration', isCorrect: true },
  { id: 'C', text: 'Active Osmosis', isCorrect: false },
];

export default function HeroSpatialDeck() {
  const shouldReduceMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string>('B');

  return (
    <div className="relative w-full max-w-3xl mx-auto mt-12 mb-4 px-4 perspective-1000">
      {/* Ambient floating radial glow under the 3D deck */}
      <div
        className="absolute inset-0 -top-8 bg-gradient-to-r from-[var(--student-primary)]/20 via-[var(--primary-accent)]/20 to-[var(--teacher-accent)]/15 blur-3xl rounded-full transform scale-95 pointer-events-none antigravity-pulse-glow"
        aria-hidden
      />

      <div className="relative transform-3d">
        {/* Main Floating 3D Quiz Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative antigravity-glass rounded-3xl p-5 sm:p-7 shadow-2xl border border-[var(--border)] text-left max-w-xl mx-auto overflow-hidden"
        >
          {/* Top header bar */}
          <div className="flex items-center justify-between gap-4 mb-5 pb-3 border-b border-[var(--border)]/60">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                Live Quiz Challenge
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] text-xs font-bold border border-[var(--student-border)]/50">
              <Timer className="w-3.5 h-3.5" />
              <span>00:45</span>
            </div>
          </div>

          {/* Question Text */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--foreground)] mb-5 leading-snug">
            Which cellular process converts biochemical energy from nutrients into ATP?
          </h3>

          {/* Options */}
          <div className="space-y-2.5 mb-2">
            {mockOptions.map((opt) => {
              const isSelected = selectedId === opt.id;
              const isCorrect = opt.isCorrect;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedId(opt.id)}
                  className={`w-full min-h-[44px] flex items-center justify-between p-3 sm:px-4 rounded-xl border text-sm font-medium transition-all duration-300 text-left cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[var(--student-primary)]/10 to-[var(--student-accent)]/10 border-[var(--student-primary)] text-[var(--foreground)] shadow-sm'
                      : 'border-[var(--border)] bg-[var(--surface)]/50 hover:bg-[var(--surface-muted)] text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold uppercase transition-colors ${
                        isSelected
                          ? 'bg-[var(--student-primary)] text-white'
                          : 'bg-[var(--border)]/50 text-[var(--muted)]'
                      }`}
                    >
                      {opt.id}
                    </span>
                    <span className={isSelected ? 'font-semibold text-[var(--foreground)]' : ''}>
                      {opt.text}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      {isCorrect ? 'Correct!' : 'Selected'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Floating Spatial Badge 1: Left */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
          className="hidden sm:flex items-center gap-3 absolute -top-4 -left-2 lg:-left-6 px-4 py-2.5 rounded-2xl antigravity-glass shadow-xl border border-[var(--border)] z-20 pointer-events-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Daily Streak</div>
            <div className="text-xs font-bold text-[var(--foreground)]">7 Days Active 🔥</div>
          </div>
        </motion.div>

        {/* Floating Spatial Badge 2: Right */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          className="hidden sm:flex items-center gap-3 absolute -bottom-4 -right-2 lg:-right-6 px-4 py-2.5 rounded-2xl antigravity-glass shadow-xl border border-[var(--border)] z-20 pointer-events-none"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] text-white shadow-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--muted)] font-medium">Accuracy</div>
            <div className="text-xs font-bold text-[var(--foreground)]">98.4% Top Tier 🏆</div>
          </div>
        </motion.div>

        {/* Floating Spatial Chip: Top Right */}
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, -5, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="hidden md:inline-flex items-center gap-1.5 absolute -top-3 right-12 px-3 py-1.5 rounded-full antigravity-glass shadow-md border border-[var(--border)] text-xs font-semibold text-[var(--student-primary)] z-20 pointer-events-none"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Real-time Scoring</span>
        </motion.div>
      </div>
    </div>
  );
}

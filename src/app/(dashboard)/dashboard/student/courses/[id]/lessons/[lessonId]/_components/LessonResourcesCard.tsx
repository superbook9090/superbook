'use client';

import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

interface LessonResourcesCardProps {
  notesPdf?: string;
  attachments?: string[];
}

export function LessonResourcesCard({ notesPdf, attachments }: LessonResourcesCardProps) {
  if (!notesPdf && (!attachments || attachments.length === 0)) return null;

  return (
    <div className="antigravity-glass p-6 rounded-3xl border border-[var(--border)] shadow-sm space-y-4">
      <h3 className="text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-[var(--student-primary)]" />
        Lesson Resources & Attachments
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {notesPdf && (
          <a
            href={notesPdf}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)]/50 hover:bg-[var(--student-soft)]/30 border border-[var(--border)] rounded-2xl group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] flex items-center justify-center font-bold shadow-xs">
                PDF
              </div>
              <div className="text-left">
                <span className="block text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--student-primary)] transition-colors">
                  Lecture Notes
                </span>
                <span className="block text-xs text-[var(--color-muted-foreground)]">
                  Download reference notes
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--student-primary)] transition-colors" />
          </a>
        )}

        {attachments &&
          attachments.map((attach, idx) => (
            <a
              key={idx}
              href={attach}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)]/50 hover:bg-[var(--student-soft)]/30 border border-[var(--border)] rounded-2xl group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-info-light)] text-[var(--color-info)] flex items-center justify-center font-bold shadow-xs">
                  ZIP
                </div>
                <div className="text-left">
                  <span className="block text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--student-primary)] transition-colors">
                    Attachment #{idx + 1}
                  </span>
                  <span className="block text-xs text-[var(--color-muted-foreground)] truncate max-w-[150px]">
                    {attach}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--color-muted)] group-hover:text-[var(--student-primary)] transition-colors" />
            </a>
          ))}
      </div>
    </div>
  );
}

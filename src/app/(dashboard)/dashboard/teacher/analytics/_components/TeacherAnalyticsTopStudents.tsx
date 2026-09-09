'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { TopStudent } from './types';

function scoreChipClass(score: number): string {
  if (score >= 70) return 'bg-[var(--success-light)] text-[var(--success)]';
  if (score >= 50) return 'bg-[var(--warning-light)] text-[var(--warning)]';
  return 'bg-[var(--error-light)] text-[var(--error)]';
}

interface TeacherAnalyticsTopStudentsProps {
  topStudents: TopStudent[];
}

export default function TeacherAnalyticsTopStudents({
  topStudents,
}: TeacherAnalyticsTopStudentsProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-surface antigravity-glass rounded-3xl border border-[var(--border)] shadow-xs overflow-hidden"
    >
      <div className="p-5 sm:p-6 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('teacherAnalytics.studentsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
            {t('teacherAnalytics.studentsDescription')}
          </p>
        </div>
        <div className="p-2.5 rounded-2xl bg-[var(--teacher-soft)] text-[var(--teacher-primary)]">
          <Trophy className="w-5 h-5" />
        </div>
      </div>

      {topStudents?.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-2">
          <Users className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-30" />
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            {t('teacherAnalytics.noQuizAttempts')}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {topStudents?.map((student, index) => (
            <li
              key={index}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-4 hover:bg-[var(--teacher-soft)]/20 transition-colors"
            >
              <span
                className={`flex-shrink-0 h-9 w-9 rounded-2xl flex items-center justify-center font-black text-xs sm:text-sm tabular-nums shadow-xs ${
                  index === 0
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-amber-500/20'
                    : index === 1
                    ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                    : index === 2
                    ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                }`}
              >
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-foreground)] truncate">
                  {student.name}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] tabular-nums">
                  {student.attempts} {t('teacherAnalytics.tableStudentAttempts').toLowerCase()}
                </p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tabular-nums ${scoreChipClass(student.averageScore)}`}>
                {student.averageScore}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

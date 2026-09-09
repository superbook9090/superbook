'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { GraduationCap, School, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export type UserRole = 'student' | 'teacher';

interface RoleSelectorProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
  allowTeacherRegistration: boolean;
}

export default function RoleSelector({
  role,
  onChange,
  allowTeacherRegistration,
}: RoleSelectorProps) {
  const { t } = useTranslation();

  const roles = [
    {
      id: 'student' as const,
      label: t('register.student'),
      desc: t('register.studentDesc'),
      icon: GraduationCap,
      badge: 'Learner',
      accentColor: 'var(--student-primary)',
      activeBorder: 'border-[var(--student-primary)]',
      activeBg: 'bg-[var(--student-soft)]',
      activeText: 'text-[var(--student-primary)]',
    },
    ...(allowTeacherRegistration
      ? [
          {
            id: 'teacher' as const,
            label: t('register.teacher'),
            desc: t('register.teacherDesc'),
            icon: School,
            badge: 'Educator',
            accentColor: 'var(--teacher-primary)',
            activeBorder: 'border-[var(--teacher-primary)]',
            activeBg: 'bg-[var(--teacher-soft)]',
            activeText: 'text-[var(--teacher-primary)]',
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {t('register.iWantTo')}
        </label>
        <span className="text-[10px] text-[var(--color-muted)] font-medium">Select account type</span>
      </div>

      <div className={`grid gap-2 sm:gap-2.5 ${roles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = role === r.id;

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`relative flex items-center gap-2.5 p-2 sm:p-2.5 rounded-xl border transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 text-left min-h-[44px] ${
                isSelected
                  ? `${r.activeBorder} ${r.activeBg} shadow-sm ring-1 ring-[var(--student-primary)]/20`
                  : 'border-[var(--color-border)] bg-[var(--card-solid)] hover:border-[var(--color-muted)]/60 hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-sm'
                    : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-bold text-xs sm:text-sm tracking-tight truncate ${
                      isSelected ? r.activeText : 'text-[var(--color-foreground)]'
                    }`}
                  >
                    {r.label}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider ${
                      isSelected
                        ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                        : 'bg-[var(--color-surface-muted-strong)] text-[var(--color-muted)]'
                    }`}
                  >
                    {r.badge}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-muted-foreground)] truncate leading-tight mt-0.5">
                  {r.desc}
                </p>
              </div>

              {isSelected && (
                <div
                  className="absolute top-2 right-2 size-3.5 rounded-full flex items-center justify-center text-white shrink-0"
                  style={{ backgroundColor: r.accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

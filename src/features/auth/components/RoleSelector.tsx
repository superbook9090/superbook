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
      activeBg: 'bg-[var(--student-primary)]/10',
      activeBorder: 'border-[var(--student-primary)]',
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
            activeBg: 'bg-[var(--teacher-primary)]/10',
            activeBorder: 'border-[var(--teacher-primary)]',
            activeText: 'text-[var(--teacher-primary)]',
          },
        ]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-1.5"
    >
      <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        {t('register.iWantTo')}
      </label>
      <div className={`grid gap-2 sm:gap-3 ${roles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = role === r.id;

          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`relative flex flex-col text-left p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 ${
                isSelected
                  ? `${r.activeBorder} ${r.activeBg} shadow-sm`
                  : 'border-[var(--color-border)] bg-[var(--card-solid)] hover:border-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              {/* Selected check indicator */}
              {isSelected && (
                <div
                  className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: r.accentColor }}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-0.5">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                    isSelected
                      ? `${r.activeBg} ${r.activeText}`
                      : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span
                  className={`font-bold text-xs sm:text-sm tracking-tight ${
                    isSelected ? r.activeText : 'text-[var(--color-foreground)]'
                  }`}
                >
                  {r.label}
                </span>
              </div>

              <span className="text-[10px] sm:text-[11px] text-[var(--color-muted-foreground)] line-clamp-1 leading-tight">
                {r.desc}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

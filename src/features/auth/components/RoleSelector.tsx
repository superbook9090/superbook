import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { GraduationCap, School } from 'lucide-react';
import { motion } from 'framer-motion';

export type UserRole = 'student' | 'teacher';

interface RoleSelectorProps {
  role: UserRole;
  onChange: (role: UserRole) => void;
  allowTeacherRegistration: boolean;
}

export default function RoleSelector({ role, onChange, allowTeacherRegistration }: RoleSelectorProps) {
  const { t } = useTranslation();

  const roles = [
    {
      id: 'student' as const,
      label: t('register.student'),
      desc: t('register.studentDesc'),
      icon: GraduationCap,
      theme: {
        colors: { primary: 'var(--student-primary)' },
        activeBg: 'bg-[var(--student-primary)]/10',
        text: 'text-[var(--student-primary)]',
        activeText: 'text-[var(--student-primary)]',
      }
    },
    ...(allowTeacherRegistration ? [{
      id: 'teacher' as const,
      label: t('register.teacher'),
      desc: t('register.teacherDesc'),
      icon: School,
      theme: {
        colors: { primary: 'var(--teacher-primary)' },
        activeBg: 'bg-[var(--teacher-primary)]/10',
        text: 'text-[var(--teacher-primary)]',
        activeText: 'text-[var(--teacher-primary)]',
      }
    }] : [])
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
        {t('register.iWantTo')}
      </label>
      <div className={`grid gap-3 ${roles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {roles.map((r) => {
          const Icon = r.icon;
          const isSelected = role === r.id;
          const rTheme = r.theme;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => onChange(r.id)}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${isSelected
                  ? `border-[${rTheme.colors.primary}] ${rTheme.activeBg}`
                  : 'border-[var(--color-border)] hover:border-[var(--color-muted)] bg-[var(--card-solid)]'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${isSelected
                  ? `${rTheme.activeBg} ${rTheme.text}`
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`font-semibold text-sm ${isSelected ? rTheme.activeText : 'text-[var(--color-foreground)]'}`}>
                {r.label}
              </span>
              <span className="text-xs text-[var(--color-muted-foreground)] text-center mt-1">
                {r.desc}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

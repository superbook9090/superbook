'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, FileText, BookOpen, Minus, Plus } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  searchQuery?: string;
}

interface LimitConfig {
  key: keyof AppSettings['teacherLimits'];
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  presets: number[];
  min: number;
}

export function TeacherLimitsSection({ settings, setSettings, searchQuery = '' }: Props) {
  const { t } = useTranslation();

  const configs: LimitConfig[] = [
    {
      key: 'courses',
      titleKey: 'adminSettings.coursesLimit',
      descKey: 'adminSettings.coursesLimitDesc',
      icon: GraduationCap,
      iconBg: 'bg-[var(--success-light)]',
      iconColor: 'text-[var(--success)]',
      presets: [3, 5, 10, 20, 50],
      min: 1,
    },
    {
      key: 'quizzes',
      titleKey: 'adminSettings.quizzesLimit',
      descKey: 'adminSettings.quizzesLimitDesc',
      icon: FileText,
      iconBg: 'bg-[var(--primary-soft)]',
      iconColor: 'text-[var(--primary)]',
      presets: [5, 10, 25, 50, 100],
      min: 1,
    },
    {
      key: 'blogs',
      titleKey: 'adminSettings.blogsLimit',
      descKey: 'adminSettings.blogsLimitDesc',
      icon: BookOpen,
      iconBg: 'bg-[var(--info-light)]',
      iconColor: 'text-[var(--info)]',
      presets: [2, 5, 10, 25],
      min: 1,
    },
  ];

  const query = searchQuery.trim().toLowerCase();
  const visibleConfigs = configs.filter((c) => {
    if (!query) return true;
    const title = t(c.titleKey).toLowerCase();
    const desc = t(c.descKey).toLowerCase();
    const general = t('adminSettings.teacherLimits').toLowerCase();
    return title.includes(query) || desc.includes(query) || general.includes(query);
  });

  const updateLimit = (key: keyof AppSettings['teacherLimits'], val: number) => {
    const safeVal = Math.max(1, Math.floor(val));
    setSettings((prev) => ({
      ...prev,
      teacherLimits: { ...prev.teacherLimits, [key]: safeVal },
    }));
  };

  if (visibleConfigs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface rounded-xl border border-[var(--border)] overflow-hidden shadow-xs"
    >
      <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 bg-[var(--color-surface-muted)]/30">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
          {t('adminSettings.teacherLimits')}
        </h3>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          {t('adminSettings.description')}
        </p>
      </div>

      <div className="p-4 sm:p-5 divide-y divide-[var(--border)]/60">
        {visibleConfigs.map((config) => {
          const value = settings.teacherLimits[config.key] ?? 1;
          const Icon = config.icon;

          return (
            <div key={config.key} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl shrink-0 ${config.iconBg} ${config.iconColor} shadow-xs mt-0.5`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                    {t(config.titleKey)}
                  </h4>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                    {t(config.descKey)}
                  </p>
                </div>
              </div>

              {/* Steppers & Presets */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Quick Presets */}
                <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-lg border border-[var(--border)]/50">
                  {config.presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => updateLimit(config.key, p)}
                      className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                        value === p
                          ? 'bg-[var(--primary)] text-white shadow-xs'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                {/* Counter Stepper */}
                <div className="flex items-center border border-[var(--border)] rounded-lg bg-[var(--card-solid)] overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => updateLimit(config.key, value - 1)}
                    disabled={value <= config.min}
                    className="p-2 sm:p-2.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min={config.min}
                    value={value}
                    onChange={(e) => updateLimit(config.key, parseInt(e.target.value) || 1)}
                    className="w-14 text-center text-xs sm:text-sm font-bold text-[var(--color-foreground)] bg-transparent focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateLimit(config.key, value + 1)}
                    className="p-2 sm:p-2.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

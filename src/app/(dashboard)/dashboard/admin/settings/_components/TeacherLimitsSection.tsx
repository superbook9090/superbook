import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, FileText, BookOpen } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

type Props = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  theme: { activeBg: string; text: string };
};

export function TeacherLimitsSection({ settings, setSettings, theme }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-[var(--card-solid)] rounded-xl shadow-sm p-4 sm:p-5 border border-[var(--border)]"
    >
      <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5" />
        {t('adminSettings.teacherLimits')}
      </h2>

      <div className="flex flex-col gap-3.5 sm:gap-4">
        {/* Courses Limit */}
        <div className="flex items-start gap-3">
          <div className={`p-2 sm:p-2.5 ${theme.activeBg} rounded-lg shrink-0 mt-1`}>
            <GraduationCap className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text}`} />
          </div>
          <div className="flex-1">
            <TextField
              label={t('adminSettings.coursesLimit')}
              type="number"
              min="1"
              value={settings.teacherLimits.courses}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  teacherLimits: {
                    ...settings.teacherLimits,
                    courses: parseInt(e.target.value) || 1,
                  },
                })
              }
              helperText={t('adminSettings.coursesLimitDesc')}
              fullWidth
            />
          </div>
        </div>

        {/* Quizzes Limit */}
        <div className="flex items-start gap-3">
          <div className={`p-2 sm:p-2.5 ${theme.activeBg} rounded-lg shrink-0 mt-1`}>
            <FileText className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text}`} />
          </div>
          <div className="flex-1">
            <TextField
              label={t('adminSettings.quizzesLimit')}
              type="number"
              min="1"
              value={settings.teacherLimits.quizzes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  teacherLimits: {
                    ...settings.teacherLimits,
                    quizzes: parseInt(e.target.value) || 1,
                  },
                })
              }
              helperText={t('adminSettings.quizzesLimitDesc')}
              fullWidth
            />
          </div>
        </div>

        {/* Blogs Limit */}
        <div className="flex items-start gap-3">
          <div className={`p-2 sm:p-2.5 ${theme.activeBg} rounded-lg shrink-0 mt-1`}>
            <BookOpen className={`w-4 h-4 sm:w-5 sm:h-5 ${theme.text}`} />
          </div>
          <div className="flex-1">
            <TextField
              label={t('adminSettings.blogsLimit')}
              type="number"
              min="1"
              value={settings.teacherLimits.blogs}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  teacherLimits: {
                    ...settings.teacherLimits,
                    blogs: parseInt(e.target.value) || 1,
                  },
                })
              }
              helperText={t('adminSettings.blogsLimitDesc')}
              fullWidth
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

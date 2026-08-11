import React from 'react';
import { motion } from 'framer-motion';
import { Notebook, FileText } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

type Props = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  theme: { activeBg: string; text: string };
};

export function NotesLimitsSection({ settings, setSettings, theme }: Props) {
  const { t } = useTranslation();

  const notesLimits = settings.notesLimits ?? {
    maxPagesPerUser: 5,
    maxWordsPerPage: 1000,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
    >
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
        <Notebook className="w-5 h-5" />
        {t('adminSettings.notesLimits')}
      </h2>

      <div className="flex flex-col gap-6">
        {/* Max Pages Per User */}
        <div className="flex items-start gap-4">
          <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
            <Notebook className={`w-5 h-5 ${theme.text}`} />
          </div>
          <div className="flex-1">
            <TextField
              label={t('adminSettings.maxPagesPerUser')}
              type="number"
              min="1"
              value={notesLimits.maxPagesPerUser}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notesLimits: {
                    ...notesLimits,
                    maxPagesPerUser: parseInt(e.target.value) || 1,
                  },
                })
              }
              helperText={t('adminSettings.maxPagesPerUserDesc')}
              fullWidth
            />
          </div>
        </div>

        {/* Max Words Per Page */}
        <div className="flex items-start gap-4">
          <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
            <FileText className={`w-5 h-5 ${theme.text}`} />
          </div>
          <div className="flex-1">
            <TextField
              label={t('adminSettings.maxWordsPerPage')}
              type="number"
              min="50"
              value={notesLimits.maxWordsPerPage}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  notesLimits: {
                    ...notesLimits,
                    maxWordsPerPage: parseInt(e.target.value) || 50,
                  },
                })
              }
              helperText={t('adminSettings.maxWordsPerPageDesc')}
              fullWidth
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

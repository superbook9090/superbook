import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';

type Props = {
  limitsForm: { courses: string; quizzes: string; blogs: string };
  setLimitsForm: (form: { courses: string; quizzes: string; blogs: string }) => void;
  handleSaveLimits: () => void;
  handleCloseLimits: () => void;
};

export function LimitsModal({
  limitsForm,
  setLimitsForm,
  handleSaveLimits,
  handleCloseLimits,
}: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-2xl max-h-[min(90vh,calc(100dvh-1.5rem))] overflow-y-auto"
      >
        <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">{t('adminUsers.editTeacherLimits')}</h3>
        <div className="flex flex-col gap-4">
          <TextField
            label={t('adminUsers.coursesLimit')}
            type="number"
            min="1"
            value={limitsForm.courses}
            onChange={(e) => setLimitsForm({ ...limitsForm, courses: e.target.value })}
            placeholder={t('adminUsers.leaveEmptyForGlobal')}
            fullWidth
          />
          <TextField
            label={t('adminUsers.quizzesLimit')}
            type="number"
            min="1"
            value={limitsForm.quizzes}
            onChange={(e) => setLimitsForm({ ...limitsForm, quizzes: e.target.value })}
            placeholder={t('adminUsers.leaveEmptyForGlobal')}
            fullWidth
          />
          <TextField
            label={t('adminUsers.blogsLimit')}
            type="number"
            min="1"
            value={limitsForm.blogs}
            onChange={(e) => setLimitsForm({ ...limitsForm, blogs: e.target.value })}
            placeholder={t('adminUsers.leaveEmptyForGlobal')}
            fullWidth
          />
        </div>
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleSaveLimits}
            variant="primary"
            className="flex-1"
          >
            {t('adminUsers.saveLimits')}
          </Button>
          <Button
            onClick={handleCloseLimits}
            variant="secondary"
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

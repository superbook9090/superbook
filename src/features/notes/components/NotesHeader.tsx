import React from 'react';
import { Plus, NotebookPen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';

interface NotesHeaderProps {
  isLimitReached: boolean;
  onOpenAddModal: () => void;
}

export function NotesHeader({
  isLimitReached,
  onOpenAddModal,
}: NotesHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent,var(--color-primary))] text-white shadow-sm">
            <NotebookPen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] tracking-tight">
              {t('notes.title')}
            </h1>
          </div>
        </div>
      }
      description={t('notes.subtitle')}
      actions={
        <Button
          onClick={onOpenAddModal}
          disabled={isLimitReached}
          variant="primary"
          size="md"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span>{t('notes.addNote')}</span>
        </Button>
      }
    />
  );
}

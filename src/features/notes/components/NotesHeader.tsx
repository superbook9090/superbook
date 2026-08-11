import React from 'react';
import { Search, Plus, Notebook, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageHeader } from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';

interface NotesHeaderProps {
  usedPages: number;
  limitPages: number;
  isLimitReached: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
}

export function NotesHeader({
  usedPages,
  limitPages,
  isLimitReached,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
}: NotesHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] text-[var(--color-primary)]">
              <Notebook className="w-6 h-6" />
            </div>
            <span>{t('notes.title')}</span>
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

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('notes.searchPlaceholder')}
            className="form-field w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 text-[var(--color-foreground)] placeholder-[var(--color-muted)] transition-all min-h-[44px]"
          />
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-foreground)] self-start sm:self-auto min-h-[44px]">
          {isLimitReached ? (
            <AlertCircle className="w-4 h-4 text-[var(--color-warning)]" />
          ) : (
            <Notebook className="w-4 h-4 text-[var(--color-primary)]" />
          )}
          <span>
            {t('notes.pagesUsed')}: <strong className="font-semibold text-[var(--color-primary)]">{usedPages}</strong> / {limitPages}
          </span>
        </div>
      </div>
    </div>
  );
}

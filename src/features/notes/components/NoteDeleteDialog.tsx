import React, { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import type { NoteItem } from '@/hooks/useNotes';

interface NoteDeleteDialogProps {
  isOpen: boolean;
  note: NoteItem | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function NoteDeleteDialog({
  isOpen,
  note,
  onClose,
  onConfirm,
}: NoteDeleteDialogProps) {
  const { t } = useTranslation();
  const [deleting, setDeleting] = useState(false);

  if (!isOpen || !note) return null;

  const handleDelete = async () => {
    setDeleting(true);
    const result = await onConfirm(note._id);
    setDeleting(false);
    if (result.success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-center gap-3 text-[var(--color-error)]">
          <div className="p-2.5 rounded-xl bg-[var(--color-error-light)]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-lg">{t('notes.deleteConfirmTitle')}</h3>
        </div>

        <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
          {t('notes.deleteConfirmDesc').replace('{title}', note.title)}
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            size="md"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            isLoading={deleting}
            variant="danger"
            size="md"
          >
            {!deleting && <Trash2 className="w-4 h-4 mr-2" />}
            <span>{deleting ? t('notes.deleting') : t('common.delete')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

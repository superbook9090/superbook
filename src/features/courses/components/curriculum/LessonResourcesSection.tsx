'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { EditorField, editorInputClass } from '@/components/ui/editor/EditorField';
import { EditorSection } from '@/components/ui/editor/EditorSection';
import { cn } from '@/lib/utils';

interface LessonResourcesSectionProps {
  notesPdf: string;
  setNotesPdf: (val: string) => void;
  attachments: string[];
  setAttachments: (val: string[]) => void;
}

export function LessonResourcesSection({
  notesPdf,
  setNotesPdf,
  attachments,
  setAttachments,
}: LessonResourcesSectionProps) {
  const { t } = useTranslation();
  const [attachmentInput, setAttachmentInput] = useState('');

  const handleAddAttachment = () => {
    if (attachmentInput.trim()) {
      setAttachments([...attachments, attachmentInput.trim()]);
      setAttachmentInput('');
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  return (
    <EditorSection title={t('curriculum.sectionResources')} defaultOpen={false}>
      <EditorField label={t('curriculum.notesPdf')}>
        <input
          value={notesPdf}
          onChange={(e) => setNotesPdf(e.target.value)}
          className={editorInputClass}
          placeholder="https://example.com/notes.pdf"
        />
      </EditorField>
      <EditorField label={t('curriculum.attachments')}>
        <div className="flex gap-2">
          <input
            value={attachmentInput}
            onChange={(e) => setAttachmentInput(e.target.value)}
            className={cn(editorInputClass, 'flex-1')}
            placeholder={t('curriculum.attachmentPlaceholder')}
          />
          <button
            type="button"
            onClick={handleAddAttachment}
            className="px-3 py-2 text-sm bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            {t('common.add')}
          </button>
        </div>
        {attachments.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {attachments.map((url, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-[var(--color-surface-muted)]/30 border border-[var(--color-border)] p-2 rounded-lg text-xs"
              >
                <span className="truncate flex-1 pr-3 text-[var(--color-foreground)]">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="text-[var(--color-error)] hover:underline font-semibold shrink-0"
                >
                  {t('common.delete')}
                </button>
              </div>
            ))}
          </div>
        )}
      </EditorField>
    </EditorSection>
  );
}

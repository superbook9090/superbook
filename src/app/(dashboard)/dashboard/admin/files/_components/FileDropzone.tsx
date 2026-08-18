'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FilePlus2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface FileDropzoneProps {
  onUploadFile: (file: File) => void;
  canMutate: boolean;
  isMutating?: boolean;
}

export function FileDropzone({ onUploadFile, canMutate, isMutating }: FileDropzoneProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  if (!canMutate) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden p-4 sm:p-5 text-center select-none ${
        isDragOver
          ? 'border-[var(--primary)] bg-[var(--primary-soft)] scale-[1.005] shadow-md'
          : 'border-[var(--border)] bg-[var(--card-solid)] hover:border-[var(--primary)]/50 hover:bg-[var(--color-surface-muted)]'
      } ${isMutating ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <div
          className={`p-3 rounded-2xl transition-transform duration-200 group-hover:scale-110 ${
            isDragOver
              ? 'bg-[var(--primary)] text-white shadow-lg'
              : 'bg-[var(--primary-soft)] text-[var(--primary)]'
          }`}
        >
          {isDragOver ? (
            <FilePlus2 className="w-6 h-6 animate-bounce" />
          ) : (
            <UploadCloud className="w-6 h-6" />
          )}
        </div>

        <div className="text-center sm:text-left">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">
            {isDragOver
              ? t('files.dropFilesActive') || 'Release to upload PDF now'
              : t('files.dropFilesHere') || 'Drop your PDF file here or browse'}
          </p>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            {t('files.uploadRestrictions') || 'PDF files up to 20MB are supported'}
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, X, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes } from './types';

interface UploadFileModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File) => Promise<void>;
  onClose: () => void;
}

const MAX_BYTES = 20 * 1024 * 1024; // 20MB

export function UploadFileModal({
  isOpen,
  isSubmitting,
  onSubmit,
  onClose,
}: UploadFileModalProps) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setError('');
      setIsDragOver(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateAndSetFile = (file: File) => {
    setError('');
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Only PDF files are supported');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('File is too large. Maximum size allowed is 20MB');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t('files.chooseFile') || 'Please select a PDF file');
      return;
    }
    await onSubmit(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-foreground)]">
                {t('files.uploadPdf') || 'Upload PDF Document'}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('files.uploadRestrictions') || 'PDF files up to 20MB are supported'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`p-6 rounded-2xl border-2 border-dashed text-center cursor-pointer transition-all duration-200 ${
              isDragOver
                ? 'border-[var(--primary)] bg-[var(--primary-soft)]'
                : selectedFile
                ? 'border-[var(--color-success)] bg-[var(--color-success-light)]/20'
                : 'border-[var(--border)] bg-[var(--color-surface-muted)] hover:border-[var(--primary)]/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) validateAndSetFile(f);
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center">
                <div className="p-3 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] mb-2">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-[var(--color-foreground)] truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  {formatBytes(selectedFile.size)}
                </p>
                <span className="text-xs text-[var(--primary)] font-medium mt-2">
                  Click to change file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <UploadCloud className="w-8 h-8 text-[var(--primary)] mb-2" />
                <p className="text-sm font-semibold text-[var(--color-foreground)]">
                  {t('files.dropFilesHere') || 'Drop PDF here or click to browse'}
                </p>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                  {t('files.uploadRestrictions') || 'Max size 20MB'}
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!selectedFile}
            >
              {t('files.upload') || 'Upload File'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

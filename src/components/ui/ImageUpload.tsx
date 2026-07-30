'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/constants';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
  aspectRatio?: 'video' | 'square' | 'any';
}

export const ImageUpload = ({
  value,
  onChange,
  className,
  label,
  aspectRatio = 'video',
}: ImageUploadProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(t('imageUpload.fileTooLarge'));
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError(t('imageUpload.invalidFileType'));
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || t('common.error'));
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = () => {
    onChange('');
    setError(null);
  };

  const ratioClass = {
    video: 'aspect-video',
    square: 'aspect-square',
    any: 'aspect-auto min-h-[140px]',
  }[aspectRatio];

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          {label}
        </label>
      )}

      <div
        className={cn(
          'relative group overflow-hidden rounded-xl border border-dashed transition-all duration-300',
          value
            ? 'border-transparent shadow-md'
            : 'border-[var(--color-border)] bg-[var(--color-background)]/30 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5',
          ratioClass
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded"
              fill
              className="object-cover rounded-xl"
              unoptimized
            />
            <div className="absolute inset-0 bg-[var(--color-foreground)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <Tooltip label={t('imageUpload.changeImage')}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg text-white hover:bg-white/20 transition-colors"
                  aria-label={t('imageUpload.changeImage')}
                >
                  <Upload className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip label={t('imageUpload.removeImage')}>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-1.5 bg-red-500/60 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
                  aria-label={t('imageUpload.removeImage')}
                >
                  <X className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors p-3"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
            ) : (
              <div className="p-2 rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] shadow-sm group-hover:scale-105 transition-transform duration-300">
                <ImageIcon className="w-5 h-5 text-[var(--color-primary)]" />
              </div>
            )}
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-tight">
                {isUploading ? t('imageUpload.uploading') : t('imageUpload.clickToUpload')}
              </p>
              {!isUploading && (
                <p className="text-[9px] mt-0.5 opacity-60 italic">{t('imageUpload.formatHint')}</p>
              )}
            </div>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <p className="text-[10px] text-red-500 font-medium animate-in slide-in-from-top-1 px-1">
          {error}
        </p>
      )}
    </div>
  );
};

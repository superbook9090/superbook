'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, ImageIcon, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { MAX_IMAGE_SIZE_BYTES } from '@/lib/constants';
import { downloadImage } from '@/lib/downloadImage';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
  aspectRatio?: 'video' | 'square' | 'any';
  allowDownload?: boolean;
  downloadFilename?: string;
  downloadFallbackUrl?: string;
}

export const ImageUpload = ({
  value,
  onChange,
  className,
  label,
  aspectRatio = 'video',
  allowDownload = false,
  downloadFilename,
  downloadFallbackUrl,
}: ImageUploadProps) => {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
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

  const handleDownload = async () => {
    if (!value || isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadImage(value, downloadFilename || 'course-image', downloadFallbackUrl);
    } finally {
      setIsDownloading(false);
    }
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
              alt=""
              fill
              aria-hidden
              className="object-cover blur-md opacity-25 scale-110"
              unoptimized
            />
            <Image
              src={value}
              alt="Uploaded"
              fill
              className="object-contain p-1 rounded-xl"
              unoptimized
            />
            <div className="absolute inset-0 bg-[var(--color-foreground)]/40 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              {allowDownload && (
                <Tooltip label={t('imageUpload.downloadImage')}>
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 transition-colors cursor-pointer disabled:opacity-60"
                    aria-label={t('imageUpload.downloadImage')}
                  >
                    {isDownloading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </Tooltip>
              )}
              <Tooltip label={t('imageUpload.changeImage')}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-black/50 backdrop-blur-md rounded-lg text-white hover:bg-black/70 transition-colors cursor-pointer"
                  aria-label={t('imageUpload.changeImage')}
                >
                  <Upload className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip label={t('imageUpload.removeImage')}>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-2 bg-[var(--color-error)]/75 backdrop-blur-md rounded-lg text-white hover:bg-[var(--color-error)] transition-colors cursor-pointer"
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
        <p className="text-[10px] text-[var(--color-error)] font-medium animate-in slide-in-from-top-1 px-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;

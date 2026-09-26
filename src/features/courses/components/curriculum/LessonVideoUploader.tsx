'use client';

import React, { useState, useRef } from 'react';
import { Trash2, Video, UploadCloud } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface LessonVideoUploaderProps {
  title: string;
  youtubeVideoId: string;
  thumbnail: string;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  onVideoChange: (data: { youtubeVideoId: string; videoEmbedUrl: string; thumbnail: string }) => void;
  onRemoveVideo: () => void;
}

export function LessonVideoUploader({
  title,
  youtubeVideoId,
  thumbnail,
  uploading,
  setUploading,
  onVideoChange,
  onRemoveVideo,
}: LessonVideoUploaderProps) {
  const { t } = useTranslation();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size validation (2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError(t('curriculum.formatSizeHint'));
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const queryTitle = encodeURIComponent(title || 'Lecture Video');

    try {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      const promise = new Promise<{ youtubeVideoId: string; videoEmbedUrl: string; thumbnail: string }>(
        (resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                resolve(res);
              } catch {
                reject(new Error('Invalid upload response'));
              }
            } else {
              try {
                const res = JSON.parse(xhr.responseText);
                reject(new Error(res.message || 'Upload failed'));
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          };
          xhr.onerror = () => reject(new Error('Network error during upload'));
        }
      );

      xhr.open('POST', `/api/video/upload?title=${queryTitle}`);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      const result = await promise;
      onVideoChange(result);
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Upload cancelled')) {
        setUploadError(null);
      } else {
        setUploadError(err instanceof Error ? err.message : t('curriculum.uploadFailed'));
      }
    } finally {
      setUploading(false);
      xhrRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setUploadError(null);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3 p-4 bg-[var(--color-surface-muted)]/30 rounded-2xl border border-[var(--color-border)]">
      <label className="text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
        <Video className="w-4 h-4 text-[var(--color-primary)]" />
        Centralized YouTube Video Lecture (Unlisted)
      </label>

      {youtubeVideoId ? (
        <div className="space-y-3">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[var(--color-border)] max-w-md">
            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-[var(--color-muted-foreground)]">YouTube Video Connected</span>
            )}
            <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-0.5 rounded font-mono">
              ID: {youtubeVideoId}
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveVideo}
            className="text-xs text-[var(--color-error)] hover:underline font-medium flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Video Lecture
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all relative">
            {!uploading && (
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            )}
            <div className="flex flex-col items-center justify-center">
              <UploadCloud className="w-10 h-10 text-[var(--color-muted)] mb-2" />
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {uploading ? t('curriculum.uploadingFile') : t('curriculum.dragDropVideo')}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {t('curriculum.formatSizeHint')}
              </p>
            </div>
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[var(--color-primary)] h-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--color-muted-foreground)]">
                  {uploadProgress === 100 ? t('curriculum.processingVideo') : t('curriculum.uploadProgress')}
                </span>
                <span className="font-medium text-[var(--color-foreground)]">{uploadProgress}%</span>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="text-xs font-semibold text-[var(--color-error)] hover:underline"
                >
                  {t('curriculum.cancelUpload')}
                </button>
              </div>
            </div>
          )}

          {uploadError && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-[var(--color-error)] font-medium text-center">
                {uploadError}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

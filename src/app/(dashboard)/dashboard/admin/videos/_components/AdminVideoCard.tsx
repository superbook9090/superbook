'use client';

import React from 'react';
import { User, BookOpen, Calendar, Play } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';

export interface VideoLecture {
  _id: string;
  title: string;
  course?: { title: string } | null;
  chapter?: { title: string } | null;
  youtubeVideoId: string;
  videoEmbedUrl: string;
  thumbnail: string;
  duration?: number;
  uploadedBy?: { name: string; email: string } | null;
  uploadedAt?: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function AdminVideoCard({ vid }: { vid: VideoLecture }) {
  const { t } = useTranslation();

  return (
    <div className="teacher-card overflow-hidden flex flex-col justify-between group">
      <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={vid.thumbnail}
          alt={vid.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
          <Tooltip label={t('admin.openOnYouTube')}>
            <a
              href={`https://youtube.com/watch?v=${vid.youtubeVideoId}`}
              target="_blank"
              rel="noreferrer"
              aria-label={t('admin.openOnYouTube')}
              className="inline-flex h-12 w-12 items-center justify-center bg-white/25 backdrop-blur-md rounded-xl text-white hover:bg-white/40 transition-colors border border-white/25"
            >
              <Play className="w-5 h-5 fill-current" />
            </a>
          </Tooltip>
        </div>
        {vid.duration ? (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[11px] font-bold rounded-[6px] tabular-nums">
            {formatDuration(vid.duration)}
          </span>
        ) : null}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3.5">
        <div className="space-y-2">
          <h3 className="font-bold text-base text-[var(--color-foreground)] line-clamp-1 group-hover:text-[var(--teacher-primary)] transition-colors">
            {vid.title}
          </h3>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-[var(--surface-muted)] text-xs text-[var(--color-muted-foreground)] font-semibold truncate max-w-full">
            <BookOpen className="w-3.5 h-3.5 text-[var(--teacher-primary)] shrink-0" />
            <span className="truncate">{vid.course?.title || 'Course Lecture'}</span>
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--border)]/70 flex flex-col gap-1.5 text-xs text-[var(--color-muted-foreground)]">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-[var(--teacher-primary)]" /> Instructor
            </span>
            <span className="font-semibold text-[var(--color-foreground)] truncate max-w-[150px]">
              {vid.uploadedBy?.name || 'Unknown'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Uploaded
            </span>
            <span>
              {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

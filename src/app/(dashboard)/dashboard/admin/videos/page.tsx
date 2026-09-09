// src/app/(dashboard)/dashboard/admin/videos/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Video, User, BookOpen, Calendar, Play, Clock } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import { useAlert } from '@/components/ui/AlertContainer';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';

interface VideoLecture {
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

export default function AdminVideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => setSearchQuery('');

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/admin/videos');
        if (!res.ok) {
          throw new Error('Failed to load videos');
        }
        const data = await res.json();
        setVideos(data.videos || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching video inventory');
      } finally {
        setIsLoading(false);
      }
    }
    fetchVideos();
  }, []);

  useEffect(() => {
    if (error) {
      addAlert({ type: 'error', message: error });
    }
  }, [error, addAlert]);

  const filteredVideos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return videos;
    return videos.filter((vid) =>
      vid.title.toLowerCase().includes(q) ||
      (vid.course?.title || '').toLowerCase().includes(q) ||
      (vid.uploadedBy?.name || '').toLowerCase().includes(q)
    );
  }, [videos, searchQuery]);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const totalDurationMinutes = useMemo(() => {
    const totalSec = videos.reduce((acc, v) => acc + (v.duration || 0), 0);
    return Math.round(totalSec / 60);
  }, [videos]);

  const uniqueCoursesCount = useMemo(() => {
    const set = new Set(videos.map((v) => v.course?.title).filter(Boolean));
    return set.size;
  }, [videos]);

  if (isLoading) return <PageSkeleton />;

  return (
    <PageWrapper className="space-y-6">
      {/* Hero Banner */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/20 shadow-xs">
            <Video className="w-3.5 h-3.5" />
            <span>{t('admin.videoManagement') || 'Video Lectures'}</span>
          </div>
          <h1 className="heading-xl">{t('admin.videoManagement') || 'Video Lecture Management'}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('admin.videoDesc') || 'Monitor centrally hosted unlisted YouTube video lectures across all courses.'}
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <ResponsiveGrid variant="cards">
        <StatCard
          icon={Video}
          value={videos.length}
          label={t('admin.videoManagement') || 'Total Lectures'}
          color="error"
          delay={0.05}
        />
        <StatCard
          icon={Clock}
          value={`${totalDurationMinutes}m`}
          label="Total Duration"
          color="warning"
          delay={0.1}
          description="Content runtime"
        />
        <StatCard
          icon={BookOpen}
          value={uniqueCoursesCount}
          label="Courses With Video"
          color="info"
          delay={0.15}
          description="Covered curriculum"
        />
      </ResponsiveGrid>

      {/* Search Filter */}
      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearFilters}
          searchPlaceholder={t('admin.searchVideos') || 'Search lectures by title, course, or instructor...'}
        />
      </FilterPanel>

      {/* Video Cards Grid */}
      {filteredVideos.length === 0 ? (
        <EmptyState
          title={t('admin.noVideosFound') || 'No video lectures found'}
          description={t('admin.noVideosDesc') || 'Instructors have not uploaded any videos yet, or no matches found.'}
          action={
            <Button onClick={clearFilters} variant="secondary">
              {t('common.reset') || 'Reset Filters'}
            </Button>
          }
        />
      ) : (
        <ResponsiveGrid variant="cards">
          {filteredVideos.map((vid, idx) => (
            <motion.div
              key={vid._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx, duration: 0.25 }}
              whileHover={{ y: -4 }}
              className="antigravity-glass antigravity-card rounded-3xl border border-[var(--border)] overflow-hidden shadow-md hover:shadow-2xl hover:border-[var(--primary)]/40 transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Thumbnail preview with play overlay */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                  <Tooltip label={t('admin.openOnYouTube') || 'Open on YouTube'}>
                    <a
                      href={`https://youtube.com/watch?v=${vid.youtubeVideoId}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t('admin.openOnYouTube') || 'Open on YouTube'}
                      className="p-3.5 bg-white/25 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors shadow-lg border border-white/20"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </a>
                  </Tooltip>
                </div>
                {vid.duration ? (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-xs font-bold rounded-lg tabular-nums">
                    {formatDuration(vid.duration)}
                  </span>
                ) : null}
              </div>

              {/* Body details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-base text-[var(--color-foreground)] line-clamp-1 group-hover:text-[var(--primary)] transition-colors">
                    {vid.title}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--surface-muted)] text-xs text-[var(--color-muted-foreground)] font-semibold truncate max-w-full">
                    <BookOpen className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                    <span className="truncate">{vid.course?.title || 'Course Lecture'}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--border)]/60 flex flex-col gap-2 text-xs text-[var(--color-muted-foreground)]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="w-3.5 h-3.5 text-[var(--teacher-primary)]" /> Instructor
                    </span>
                    <span className="font-semibold text-[var(--color-foreground)] truncate max-w-[150px]">
                      {vid.uploadedBy?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-muted)]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Uploaded
                    </span>
                    <span>
                      {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}

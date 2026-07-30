'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

import { motion } from 'framer-motion';
import { Video, User, BookOpen, Calendar, ExternalLink } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import Tooltip from '@/components/ui/Tooltip';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';

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

  const filteredVideos = videos.filter((vid) => {
    const q = searchQuery.toLowerCase();
    return (
      vid.title.toLowerCase().includes(q) ||
      (vid.course?.title || '').toLowerCase().includes(q) ||
      (vid.uploadedBy?.name || '').toLowerCase().includes(q)
    );
  });

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-[var(--info-light)] rounded-xl">
          <Video className="w-6 h-6 text-[var(--info)]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">
            {t('admin.videoManagement') || 'Video Lectures'}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">
            {t('admin.videoDesc') || 'Monitor centrally hosted unlisted YouTube video lectures.'}
          </p>
        </div>
      </motion.div>

      {/* Alert */}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterPanel>
          <DashboardListFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearFilters}
            searchPlaceholder={t('admin.searchVideos') || 'Search lectures by title, course, or instructor...'}
          />
        </FilterPanel>
      </motion.div>

      {/* Video Inventory Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredVideos.length > 0 ? (
          filteredVideos.map((vid, idx) => (
            <motion.div
              key={vid._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.05 }}
              className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Thumbnail preview */}
              <div className="relative aspect-video bg-black flex items-center justify-center group overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip label={t('admin.openOnYouTube')}>
                    <a
                      href={`https://youtube.com/watch?v=${vid.youtubeVideoId}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t('admin.openOnYouTube')}
                      className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </Tooltip>
                </div>
                {vid.duration ? (
                  <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 text-white text-xs font-medium rounded">
                    {formatDuration(vid.duration)}
                  </span>
                ) : null}
              </div>

              {/* Body details */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-semibold text-[var(--color-foreground)] line-clamp-1">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-1 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="truncate">{vid.course?.title || 'Unknown Course'}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted-foreground)] flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> Instructor
                    </span>
                    <span className="font-medium text-[var(--color-foreground)] truncate max-w-[150px]">
                      {vid.uploadedBy?.name || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--color-muted-foreground)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Uploaded
                    </span>
                    <span className="text-[var(--color-foreground)]">
                      {vid.uploadedAt ? new Date(vid.uploadedAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl">
            <Video className="w-12 h-12 text-[var(--color-muted-foreground)] mb-3" />
            <p className="text-sm font-medium text-[var(--color-foreground)]">
              {t('admin.noVideosFound') || 'No video lectures found'}
            </p>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {t('admin.noVideosDesc') || 'Instructors have not uploaded any videos yet.'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

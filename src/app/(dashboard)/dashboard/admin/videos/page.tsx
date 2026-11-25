// src/app/(dashboard)/dashboard/admin/videos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Video, BookOpen, Clock } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { AdminVideoCard, type VideoLecture } from './_components/AdminVideoCard';

export default function AdminVideosPage() {
  const { t } = useTranslation();
  const [videos, setVideos] = useState<VideoLecture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ totalDurationMinutes: 0, uniqueCoursesCount: 0, totalVideos: 0 });

  const clearFilters = () => {
    setSearchQuery('');
    setPage(1);
  };

  useEffect(() => {
    let isMounted = true;

    async function fetchVideos(reset = false) {
      if (reset) {
        setIsLoading(true);
      } else {
        setIsFetchingMore(true);
      }

      const currentPage = reset ? 1 : page;

      try {
        const q = new URLSearchParams({ page: String(currentPage), limit: '20' });
        if (searchQuery) q.set('search', searchQuery);

        const res = await fetch(`/api/admin/videos?${q.toString()}`);
        if (!res.ok) throw new Error('Failed to load videos');

        const data = await res.json();

        if (isMounted) {
          setVideos((prev) => (reset ? (data.videos || []) : [...prev, ...(data.videos || [])]));
          setStats(data.stats || { totalDurationMinutes: 0, uniqueCoursesCount: 0, totalVideos: 0 });
          setHasMore(data.pagination?.page < data.pagination?.totalPages);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error fetching video inventory');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setIsFetchingMore(false);
        }
      }
    }

    if (page === 1) {
      fetchVideos(true);
    } else {
      fetchVideos(false);
    }

    return () => {
      isMounted = false;
    };
  }, [searchQuery, page]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (error) {
      addAlert({ type: 'error', message: error });
    }
  }, [error, addAlert]);

  if (isLoading && page === 1) return <PageSkeleton />;

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={Video}
        eyebrow={t('admin.videoManagement')}
        title={t('admin.videoManagement')}
        description={t('admin.videoDesc')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          icon={Video}
          value={stats.totalVideos}
          label={t('admin.videoManagement')}
          color="error"
          delay={0.05}
        />
        <StatCard
          icon={Clock}
          value={`${stats.totalDurationMinutes}m`}
          label="Total Duration"
          color="warning"
          delay={0.1}
          description="Content runtime"
        />
        <StatCard
          icon={BookOpen}
          value={stats.uniqueCoursesCount}
          label="Courses With Video"
          color="info"
          delay={0.15}
          description="Covered curriculum"
        />
      </div>

      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={clearFilters}
          searchPlaceholder={t('admin.searchVideos')}
        />
      </FilterPanel>

      {videos.length === 0 ? (
        <EmptyState
          title={t('admin.noVideosFound')}
          description={t('admin.noVideosDesc')}
          action={
            <Button onClick={clearFilters} variant="secondary">
              {t('common.reset')}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ResponsiveGrid variant="dense">
            {videos.map((vid) => (
              <AdminVideoCard key={vid._id} vid={vid} />
            ))}
          </ResponsiveGrid>

          {hasMore && (
            <div className="flex justify-center pt-2 pb-6">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                isLoading={isFetchingMore}
                className="min-w-[140px]"
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </PageWrapper>
  );
}

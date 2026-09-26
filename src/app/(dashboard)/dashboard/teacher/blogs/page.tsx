// src/app/(dashboard)/dashboard/teacher/blogs/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, BookOpen, Newspaper } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import BlogFilters, { type BlogLanguageFilter, type BlogStatusFilter } from '@/features/blogs/components/BlogFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useDeleteBlog, useUpdateBlog, usePaginatedBlogs, type Blog } from '@/lib/react-query/useBlogQueries';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';
import { PageWrapper } from '@/components/layout';
import TeacherBlogsStats from './_components/TeacherBlogsStats';
import TeacherBlogCard from './_components/TeacherBlogCard';

const PAGE_SIZE = 9;

export default function TeacherBlogsPage() {
  const session = useSessionStore((s) => s.session) as { user?: { id: string } };
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<BlogStatusFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<BlogLanguageFilter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push(ROUTES.login);
  }, [status, router]);

  const clearFilters = () => {
    setSearchInput('');
    setFilter('all');
    setLanguageFilter('all');
    setPage(1);
  };

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data, isLoading, isFetching } = usePaginatedBlogs({
    orgId,
    page,
    limit: PAGE_SIZE,
    search: searchTerm || undefined,
    status: filter,
    language: languageFilter !== 'all' ? languageFilter : undefined,
    includeDrafts: true,
    includeStats: true,
    author: 'self',
  });

  const blogs = data?.blogs ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats ?? { total: 0, published: 0, draft: 0 };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filter, languageFilter]);

  const deleteBlog = useDeleteBlog();
  const updateBlog = useUpdateBlog();

  const handleDelete = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBlog.mutateAsync(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
      addAlert({ type: 'success', message: t('blog.blogDeleted') });
    } catch (error) {
      console.error('Error deleting blog:', error);
      addAlert({ type: 'error', message: t('blog.failedDeleteBlog') });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateBlog.mutateAsync({ blogId: id, data: { isPublished: !currentStatus } });
      addAlert({ type: 'success', message: t('blog.blogUpdated') });
    } catch (error) {
      console.error('Error updating blog:', error);
      addAlert({ type: 'error', message: t('blog.failedUpdateBlog') });
    }
  };

  if (isLoading && !data) return <PageSkeleton />;

  return (
    <PageWrapper>
      {/* Hero Header Banner */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-3xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <Newspaper className="w-3.5 h-3.5" />
            <span>{t('blog.myBlogs')}</span>
          </div>
          <h1 className="heading-xl">{t('blog.myBlogs')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('blog.manageBlogsDesc')}</p>
        </div>
        <Link
          href={ROUTES.teacher.blogCreate}
          className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('blog.createBlog')}</span>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <TeacherBlogsStats stats={stats} />

      {/* Filters Toolbar */}
      <FilterPanel>
        <BlogFilters
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={filter}
          onStatusChange={(v) => { setFilter(v); setPage(1); }}
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          onClear={clearFilters}
          searchPlaceholder={t('blog.searchBlogs')}
        />
      </FilterPanel>

      {/* Blogs Grid or Empty State */}
      <div className={`space-y-6 ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}>
        {blogs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[var(--card-solid)] antigravity-glass rounded-3xl border border-dashed border-[var(--border)]">
            <BookOpen className="w-14 h-14 text-[var(--color-muted-foreground)] mx-auto mb-3 opacity-30" />
            <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-1">
              {searchTerm ? t('blog.noBlogsFound') : t('blog.noBlogsYetMsg')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-5">
              {searchTerm ? t('blog.tryAdjusting') : t('blog.createFirstBlog')}
            </p>
            {!searchTerm && (
              <Link href={ROUTES.teacher.blogCreate} className="btn-premium inline-flex items-center gap-2 min-h-[44px]">
                <Plus className="w-4 h-4" />
                <span>{t('blog.createBlog')}</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blogs.map((blog: Blog, idx: number) => (
              <TeacherBlogCard
                key={blog._id}
                blog={blog}
                index={idx}
                onTogglePublish={togglePublish}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <BlogListPagination page={page} pagination={pagination} onPageChange={setPage} />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={t('blog.deleteConfirmTitle')}
        message={t('blog.deleteConfirmMessage')}
        onConfirm={confirmDelete}
        onCancel={() => { setShowDeleteModal(false); setDeleteId(null); }}
        confirmText={t('blog.delete')}
        cancelText={t('blog.cancel')}
        type="danger"
      />
    </PageWrapper>
  );
}

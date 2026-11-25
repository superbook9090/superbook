// src/app/(dashboard)/dashboard/teacher/blogs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, BookOpen, Newspaper } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import BlogFilters, {
  type BlogLanguageFilter,
  type BlogStatusFilter,
} from '@/features/blogs/components/BlogFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import {
  useDeleteBlog,
  useUpdateBlog,
  usePaginatedBlogs,
  type Blog,
} from '@/lib/react-query/useBlogQueries';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';
import { PageWrapper, EmptyState } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';
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
      <TeacherPageBanner
        icon={Newspaper}
        eyebrow={t('common.blogs')}
        title={t('blog.myBlogs')}
        description={t('blog.manageBlogsDesc')}
        actions={
          <Link href={ROUTES.teacher.blogCreate} className="teacher-cta-btn w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            <span>{t('blog.createBlog')}</span>
          </Link>
        }
      />

      <TeacherBlogsStats stats={stats} />

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

      <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}>
        {blogs.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title={searchTerm ? t('blog.noBlogsFound') : t('blog.noBlogsYetMsg')}
            description={searchTerm ? t('blog.tryAdjusting') : t('blog.createFirstBlog')}
            action={
              !searchTerm ? (
                <Link href={ROUTES.teacher.blogCreate} className="teacher-cta-btn">
                  <Plus className="w-4 h-4" />
                  <span>{t('blog.createBlog')}</span>
                </Link>
              ) : undefined
            }
          />
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

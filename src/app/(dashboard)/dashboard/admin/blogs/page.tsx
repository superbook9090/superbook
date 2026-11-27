// src/app/(dashboard)/dashboard/admin/blogs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Button from '@/components/ui/Button';
import { useSessionStore } from '@/store/useSessionStore';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import BlogFilters, { type BlogLanguageFilter, type BlogStatusFilter } from '@/features/blogs/components/BlogFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useDeleteBlog, useUpdateBlog, usePaginatedBlogs } from '@/lib/react-query/useBlogQueries';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';

import { AdminBlogsHero } from './_components/AdminBlogsHero';
import { AdminBlogsStats } from './_components/AdminBlogsStats';
import { AdminBlogCard } from './_components/AdminBlogCard';

const PAGE_SIZE = 12;

export default function AdminBlogsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<BlogStatusFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<BlogLanguageFilter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const clearFilters = () => {
    setSearchInput('');
    setFilter('all');
    setLanguageFilter('all');
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filter, languageFilter]);

  const isSuper = isSuperAdmin(session?.user?.role);
  const isUserAdmin = isAdmin(session?.user?.role);
  const userOrgId = (session?.user as { organizationId?: string | null } | undefined)?.organizationId ?? null;
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
      return;
    }
    if (!isUserAdmin) {
      router.push(ROUTES.dashboard);
    }
  }, [status, isUserAdmin, router]);

  const orgId = userOrgId || (isSuper ? 'all' : 'self');
  const { data, isLoading } = usePaginatedBlogs(
    {
      orgId,
      page,
      limit: PAGE_SIZE,
      search: searchTerm || undefined,
      status: filter,
      language: languageFilter !== 'all' ? languageFilter : undefined,
      includeDrafts: true,
      includeStats: true,
    },
    status === 'authenticated' && isUserAdmin
  );

  const canManageBlog = (blog: { organizationId?: string | null; author?: { _id?: string } }) => {
    if (isSuper) return true;
    if (userId && blog.author?._id === userId) return true;
    return Boolean(userOrgId && blog.organizationId && blog.organizationId === userOrgId);
  };

  const blogs = data?.blogs ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats ?? { total: 0, published: 0, draft: 0 };

  const deleteBlog = useDeleteBlog();
  const updateBlog = useUpdateBlog();

  const handleTogglePublish = async (blogId: string, currentStatus: boolean) => {
    try {
      await updateBlog.mutateAsync({ blogId, data: { isPublished: !currentStatus } });
      addAlert({ type: 'success', message: t('admin.blogUpdated') });
    } catch {
      addAlert({ type: 'error', message: t('admin.failedUpdateBlog') });
    }
  };

  const handleDelete = async (blogId: string) => {
    try {
      await deleteBlog.mutateAsync(blogId);
      addAlert({ type: 'success', message: t('admin.blogDeleted') });
      setDeleteId(null);
    } catch {
      addAlert({ type: 'error', message: t('admin.failedDeleteBlog') });
    }
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <AdminBlogsHero isSuperAdmin={isSuper} />

      {/* KPI Stats Overview */}
      <AdminBlogsStats stats={stats} />

      {/* Filters */}
      <FilterPanel>
        <BlogFilters
          searchQuery={searchInput}
          onSearchChange={setSearchInput}
          statusFilter={filter}
          onStatusChange={setFilter}
          languageFilter={languageFilter}
          onLanguageChange={setLanguageFilter}
          onClear={clearFilters}
        />
      </FilterPanel>

      {/* Blog Cards Grid */}
      {blogs.length === 0 ? (
        <EmptyState
          title={t('admin.noBlogsFound')}
          description={t('admin.adjustSearch')}
          action={
            <Button onClick={clearFilters} variant="secondary">
              {t('common.reset')}
            </Button>
          }
        />
      ) : (
        <ResponsiveGrid variant="dense">
          {blogs.map((blog, index) => (
            <AdminBlogCard
              key={blog._id}
              blog={blog}
              index={index}
              canManage={canManageBlog(blog)}
              onTogglePublish={handleTogglePublish}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </ResponsiveGrid>
      )}

      {/* Pagination */}
      {pagination && (
        <BlogListPagination
          page={pagination.page}
          pagination={pagination}
          onPageChange={setPage}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteId)}
        title={t('admin.deleteBlog')}
        message={t('admin.deleteBlogConfirm')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
        type="danger"
      />
    </PageWrapper>
  );
}

'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  BookOpen,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Edit2,
  Plus,
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Tooltip from '@/components/ui/Tooltip';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { useSessionStore } from '@/store/useSessionStore';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import BlogFilters, { type BlogLanguageFilter, type BlogStatusFilter } from '@/features/blogs/components/BlogFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useDeleteBlog, useUpdateBlog, usePaginatedBlogs, type Blog } from '@/lib/react-query/useBlogQueries';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';

const PAGE_SIZE = 10;

export default function TeacherBlogsPage() {
  const session = useSessionStore((s) => s.session) as { user?: { id: string } };
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { theme } = useRoleTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
      return;
    }
  }, [status, router]);
  const [searchInput, setSearchInput] = useState('');
  const searchTerm = useDebouncedValue(searchInput, 300);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<BlogStatusFilter>('all');
  const [languageFilter, setLanguageFilter] = useState<BlogLanguageFilter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteBlog.mutateAsync(deleteId);
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting blog:', error);
      setAlertState({ type: 'error', message: t('blog.failedDeleteBlog') });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await updateBlog.mutateAsync({ blogId: id, data: { isPublished: !currentStatus } });
    } catch (error) {
      console.error('Error updating blog:', error);
      setAlertState({ type: 'error', message: t('blog.failedUpdateBlog') });
    }
  };

  const filteredBlogs = blogs;

  if (isLoading && !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex-1 w-full sm:w-auto">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('blog.myBlogs')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('blog.manageBlogsDesc')}</p>
        </div>
        <Link
          href={ROUTES.teacher.blogCreate}
          className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all`}
        >
          <Plus className="w-5 h-5 mr-2" />
          {t('blog.createBlog')}
        </Link>
      </motion.div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterPanel>
          <BlogFilters
            searchQuery={searchInput}
            onSearchChange={setSearchInput}
            statusFilter={filter}
            onStatusChange={(value) => {
              setFilter(value);
              setPage(1);
            }}
            languageFilter={languageFilter}
            onLanguageChange={setLanguageFilter}
            onClear={clearFilters}
            searchPlaceholder={t('blog.searchBlogs')}
          />
        </FilterPanel>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{stats.total}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('blog.totalBlogs')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{stats.published}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('blog.published')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[var(--color-muted-foreground)]">{stats.draft}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('blog.draft')}</p>
        </div>
      </motion.div>

      {/* Blogs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`space-y-4 ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[var(--card-solid)] rounded-2xl shadow-sm">
            <BookOpen className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
              {searchTerm ? t('blog.noBlogsFound') : t('blog.noBlogsYetMsg')}
            </h3>
            <p className="text-[var(--color-muted-foreground)] mb-6">
              {searchTerm
                ? t('blog.tryAdjusting')
                : t('blog.createFirstBlog')}
            </p>
            {!searchTerm && (
              <Link
                href={ROUTES.teacher.blogCreate}
                className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation`}
              >
                <Plus className="w-5 h-5 mr-2" />
                {t('blog.createBlog')}
              </Link>
            )}
          </div>
        ) : (
          filteredBlogs.map((blog: Blog, index: number) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[var(--card-solid)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)] line-clamp-1">{blog.title}</h3>
                    <Badge
                      variant={blog.isPublished ? 'success' : 'default'}
                      size="sm"
                    >
                      {blog.isPublished ? t('blog.published') : t('blog.draft')}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                    <Badge variant="primary" size="sm">{blog.topic}</Badge>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(blog.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-1">
                  <Tooltip label={blog.isPublished ? t('blog.unpublish') : t('blog.publish')}>
                    <button
                      onClick={() => togglePublish(blog._id, blog.isPublished)}
                      className={`p-2.5 sm:p-2 rounded-lg transition-colors touch-manipulation min-h-[44px] sm:min-h-0 ${
                        blog.isPublished
                          ? `${theme.activeBg} ${theme.text} hover:opacity-80`
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]/80'
                      }`}
                      aria-label={blog.isPublished ? t('blog.unpublish') : t('blog.publish')}
                    >
                      {blog.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </Tooltip>
                  <Tooltip label={t('blog.edit')}>
                    <Link
                      href={ROUTES.teacher.blogEdit(blog._id)}
                      className="p-2.5 sm:p-2 bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)]/80 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
                      aria-label={t('blog.edit')}
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                  </Tooltip>
                  <Tooltip label={t('blog.delete')}>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="p-2.5 sm:p-2 bg-[var(--error-light)] text-[var(--error)] rounded-lg hover:bg-[var(--error-light)]/80 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
                      aria-label={t('blog.delete')}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {pagination && (
        <BlogListPagination page={page} pagination={pagination} onPageChange={setPage} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title={t('blog.deleteConfirmTitle')}
        message={t('blog.deleteConfirmMessage')}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        confirmText={t('blog.delete')}
        cancelText={t('blog.cancel')}
        type="danger"
      />
    </div>
  );
}

'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  BookOpen,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
} from 'lucide-react';

import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { useSessionStore } from '@/store/useSessionStore';
import { useDeleteBlog, useUpdateBlog, usePaginatedBlogs, type Blog } from '@/lib/react-query/useBlogQueries';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';

const PAGE_SIZE = 10;
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import BlogFilters, { type BlogLanguageFilter, type BlogStatusFilter } from '@/features/blogs/components/BlogFilters';
import { FilterPanel } from '@/components/filters/DashboardListFilters';

export default function AdminBlogsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const { t } = useTranslation();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [status, router]);

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
  });

  const blogs = data?.blogs ?? [];
  const pagination = data?.pagination;
  const stats = data?.stats ?? { total: 0, published: 0, draft: 0 };

  const deleteBlog = useDeleteBlog();
  const updateBlog = useUpdateBlog();

  const handleTogglePublish = async (blogId: string, currentStatus: boolean) => {
    try {
      await updateBlog.mutateAsync({ blogId, data: { isPublished: !currentStatus } });
      setMessage({ type: 'success', text: t('admin.blogUpdated') });
    } catch {
      setMessage({ type: 'error', text: t('admin.failedUpdateBlog') });
    }
  };

  const handleDelete = async (blogId: string) => {
    try {
      await deleteBlog.mutateAsync(blogId);
      setMessage({ type: 'success', text: t('admin.blogDeleted') });
      setDeleteId(null);
    } catch {
      setMessage({ type: 'error', text: t('admin.failedDeleteBlog') });
    }
  };

  const filteredBlogs = blogs;

  if (isLoading && !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-[var(--info-light)] rounded-xl">
          <BookOpen className="w-6 h-6 text-[var(--info)]" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('admin.manageBlogs')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.manageBlogsDesc')}</p>
        </div>
      </motion.div>

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
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
            searchPlaceholder={t('admin.searchBlogs')}
            statusLabels={{
              all: t('admin.allBlogs'),
              published: t('admin.published'),
              draft: t('admin.drafts'),
            }}
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
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('admin.totalBlogs')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[var(--success)]">{stats.published}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('admin.published')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-[var(--color-muted-foreground)]">{stats.draft}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('admin.drafts')}</p>
        </div>
      </motion.div>

      {/* Blogs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center py-16 px-4 bg-[var(--card-solid)] rounded-2xl shadow-sm">
            <BookOpen className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">{t('admin.noBlogsFound')}</h3>
            <p className="text-[var(--color-muted-foreground)]">{t('admin.adjustSearch')}</p>
          </div>
        ) : (
          filteredBlogs.map((blog: Blog, index: number) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.gradient} text-white`}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={blog.isPublished ? 'primary' : 'default'} size="sm">
                      {blog.isPublished ? t('admin.published') : t('common.draft')}
                    </Badge>
                    <Badge variant="info" size="sm">
                      {blog.language === 'hi' ? 'हिंदी' : 'EN'}
                    </Badge>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2">
                  {blog.title}
                </h3>

                {/* Content */}
                <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-3">
                  {blog.content}
                </p>

                {/* Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <User className="w-4 h-4 mr-2" />
                    {blog.author?.name ?? t('blog.teacher')}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(blog.createdAt)}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {blog.topic}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                  <Button
                    type="button"
                    variant={blog.isPublished ? 'primary' : 'secondary'}
                    onClick={() => handleTogglePublish(blog._id, blog.isPublished)}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    {blog.isPublished ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('admin.unpublish')}</span>
                        <span className="sm:hidden">{t('admin.hide')}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('admin.publish')}</span>
                        <span className="sm:hidden">{t('admin.show')}</span>
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => {
                      setDeleteId(blog._id);
                    }}
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('common.delete')}
                  </Button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteId === blog._id && (
                <div className="px-6 pb-6">
                  <div className="bg-[var(--error-light)] border border-[var(--error)] rounded-xl p-4">
                    <p className="text-sm text-[var(--error)] mb-3">
                      {t('admin.deleteBlogConfirm')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(blog._id)}
                        className="flex-1"
                      >
                        {t('common.delete')}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setDeleteId(null)}
                        className="flex-1"
                      >
                        {t('common.cancel')}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {pagination && (
        <BlogListPagination page={page} pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}

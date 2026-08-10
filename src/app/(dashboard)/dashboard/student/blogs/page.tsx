'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { useFeature } from '@/contexts/AppSettingsContext';
import {
  BookOpen,
  Heart,
  Calendar,
  User,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { useAddFavorite, useRemoveFavorite } from '@/lib/react-query/hooks';
import { usePaginatedBlogs, type Blog } from '@/lib/react-query/useBlogQueries';
import { blogTopicKeys, type BlogTopicKey } from '@/i18n/config';
import BlogFilters, { type BlogSortOption } from '@/features/blogs/components/BlogFilters';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';
import { FilterPanel } from '@/components/filters/DashboardListFilters';

const topics = ['all', ...blogTopicKeys] as const;
const PAGE_SIZE = 10;

export default function StudentBlogsPage() {
  const { session, status, favorites } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const featureEnabled = useFeature('enableBlogs');

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 1200);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'hi'>('all');
  const [sort, setSort] = useState<BlogSortOption>('newest');
  const [hasRedirected, setHasRedirected] = useState(false);

  const { data, isLoading, isFetching } = usePaginatedBlogs(
    {
      orgId,
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      topic: selectedTopic !== 'all' ? selectedTopic : undefined,
      language: languageFilter !== 'all' ? languageFilter : undefined,
      sort,
    },
    status === 'authenticated' && featureEnabled
  );

  const blogs = data?.blogs ?? [];
  const pagination = data?.pagination;
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const clearFilters = () => {
    setSearchInput('');
    setSelectedTopic('all');
    setLanguageFilter('all');
    setSort('newest');
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedTopic, languageFilter, sort]);

  const topicOptions = topics.map((topic) => ({
    id: topic,
    label: topic === 'all' ? t('topics.all') : t(`topics.${topic}` as `topics.${BlogTopicKey}`),
  }));

  useEffect(() => {
    if (status === 'loading') return;
    if (hasRedirected) return;

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.push(ROUTES.login);
      return;
    }

    if (status === 'authenticated' && !featureEnabled) {
      router.push(ROUTES.student.root);
    }
  }, [status, featureEnabled, hasRedirected, router]);

  const toggleFavorite = async (blogId: string) => {
    const isFavorited = favorites.has(blogId);

    try {
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync(blogId);
      } else {
        await addFavoriteMutation.mutateAsync(blogId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
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
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] truncate">{t('blog.learningBlog')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">
            {t('blog.blogDesc')}
          </p>
        </div>
        <Link
          href={ROUTES.student.favorites}
          className={`inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-4 py-3 sm:px-6 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all`}
        >
          <Bookmark className="w-5 h-5 mr-2" />
          {t('blog.myFavorites')}
        </Link>
      </motion.div>

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
            languageFilter={languageFilter}
            onLanguageChange={setLanguageFilter}
            selectedTopic={selectedTopic}
            onTopicChange={(value) => {
              setSelectedTopic(value);
              setPage(1);
            }}
            topicOptions={topicOptions}
            sort={sort}
            onSortChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            onClear={clearFilters}
            searchPlaceholder={t('blog.searchBlogsStudent')}
          />
        </FilterPanel>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-[var(--background)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{pagination?.total ?? 0}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('blog.totalArticles')}</p>
        </div>
        <div className="bg-[var(--background)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{favorites.size}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('nav.favorites')}</p>
        </div>
      </motion.div>

      {/* Blogs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`grid grid-cols-1 md:grid-cols-2 gap-[var(--card-gap)] ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
      >
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center py-16 card-panel">
            <BookOpen className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
              {debouncedSearch || selectedTopic !== 'all'
                ? t('blog.noBlogsFound')
                : t('blog.noBlogsYet')}
            </h3>
            <p className="text-[var(--color-muted-foreground)]">
              {debouncedSearch || selectedTopic !== 'all'
                ? t('blog.tryAdjusting')
                : t('blog.checkBackLater')}
            </p>
          </div>
        ) : (
          filteredBlogs.map((blog: Blog, index: number) => {
            const isFavorited = favorites.has(blog._id);
            // Strip HTML tags for excerpt
            const plainText = blog.content.replace(/<[^>]*>/g, '');
            const excerpt =
              plainText.substring(0, 150) +
              (plainText.length > 150 ? '...' : '');

            return (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all overflow-hidden group"
              >
                <div className="card-body">
                  {/* Topic Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <Tooltip label={isFavorited ? t('favorites.removeFromFavorites') : t('blog.addToFavorites')}>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => toggleFavorite(blog._id)}
                        aria-label={isFavorited ? t('favorites.removeFromFavorites') : t('blog.addToFavorites')}
                        className="p-2 rounded-full flex items-center justify-center"
                      >
                        <Heart
                          className={`w-5 h-5 transition-colors ${
                            isFavorited
                              ? 'fill-current text-[var(--primary)]'
                              : 'text-[var(--color-muted-foreground)] hover:text-[var(--primary)]'
                          }`}
                        />
                      </Button>
                    </Tooltip>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-3">
                    {excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)] mb-4">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {blog.author?.name || t('blog.teacher')}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(blog.createdAt)}
                    </span>
                  </div>

                  {/* Read More */}
                  <Link
                    href={ROUTES.student.blog(blog._id)}
                    className={`inline-flex items-center ${theme.text} font-medium hover:opacity-80 transition-colors touch-manipulation`}
                  >
                    {t('blog.readMore')}
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {pagination && (
        <BlogListPagination page={page} pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}

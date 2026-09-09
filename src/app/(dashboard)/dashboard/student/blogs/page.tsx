'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { useFeature } from '@/contexts/AppSettingsContext';
import { BookOpen, Bookmark } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAddFavorite, useRemoveFavorite } from '@/lib/react-query/hooks';
import { usePaginatedBlogs, type Blog } from '@/lib/react-query/useBlogQueries';
import { blogTopicKeys, type BlogTopicKey } from '@/i18n/config';
import BlogFilters, { type BlogSortOption } from '@/features/blogs/components/BlogFilters';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { StudentBlogCard } from './_components/StudentBlogCard';

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

  if (isLoading && !data) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl"
      >
        <div className="flex-1 w-full sm:w-auto">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--color-foreground)] truncate">
            {t('blog.learningBlog')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1 max-w-xl">
            {t('blog.blogDesc')}
          </p>
        </div>
        <Link
          href={ROUTES.student.favorites}
          className="btn-premium inline-flex items-center justify-center w-full sm:w-auto min-h-[44px] px-6 py-2.5 text-sm font-bold shadow-md shadow-[var(--student-primary)]/20"
        >
          <Bookmark className="w-4 h-4 mr-2" />
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
        <div className="antigravity-glass rounded-2xl p-4 border border-[var(--border)] shadow-xs">
          <p className="text-2xl font-black text-[var(--student-primary)] tabular-nums">{pagination?.total ?? 0}</p>
          <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)]">{t('blog.totalArticles')}</p>
        </div>
        <div className="antigravity-glass rounded-2xl p-4 border border-[var(--border)] shadow-xs">
          <p className="text-2xl font-black text-[var(--student-primary)] tabular-nums">{favorites.size}</p>
          <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)]">{t('nav.favorites')}</p>
        </div>
      </motion.div>

      {/* Blogs Grid */}
      <div className="perspective-1000">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isFetching ? 'opacity-60 pointer-events-none' : ''}`}
        >
          {blogs.length === 0 ? (
            <div className="col-span-full text-center py-16 antigravity-glass rounded-3xl border border-dashed border-[var(--border)] p-8">
              <BookOpen className="w-14 h-14 text-[var(--color-muted-foreground)] mx-auto mb-3 opacity-25" />
              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-1">
                {debouncedSearch || selectedTopic !== 'all'
                  ? t('blog.noBlogsFound')
                  : t('blog.noBlogsYet')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                {debouncedSearch || selectedTopic !== 'all'
                  ? t('blog.tryAdjusting')
                  : t('blog.checkBackLater')}
              </p>
            </div>
          ) : (
            blogs.map((blog: Blog, index: number) => (
              <StudentBlogCard
                key={blog._id}
                blog={blog}
                index={index}
                isFavorited={favorites.has(blog._id)}
                onToggleFavorite={toggleFavorite}
                themeText={theme.text}
                t={t}
              />
            ))
          )}
        </motion.div>
      </div>

      {pagination && (
        <BlogListPagination page={page} pagination={pagination} onPageChange={setPage} />
      )}
    </div>
  );
}

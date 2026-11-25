'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Bookmark, Newspaper } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { useFeature } from '@/contexts/AppSettingsContext';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, EmptyState } from '@/components/layout';
import { useAddFavorite, useRemoveFavorite } from '@/lib/react-query/hooks';
import { usePaginatedBlogs, type Blog } from '@/lib/react-query/useBlogQueries';
import { blogTopicKeys, type BlogTopicKey } from '@/i18n/config';
import BlogFilters, { type BlogSortOption } from '@/features/blogs/components/BlogFilters';
import BlogListPagination from '@/features/blogs/components/BlogListPagination';
import { FilterPanel } from '@/components/filters/DashboardListFilters';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';
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
  const debouncedSearch = useDebouncedValue(searchInput, 500);
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
    if (status === 'loading' || hasRedirected) return;
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

  if (isLoading && !data) return <PageSkeleton />;

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Newspaper}
        eyebrow={t('common.blogs')}
        title={t('blog.learningBlog')}
        description={t('blog.blogDesc')}
        actions={
          <Link href={ROUTES.student.favorites} className="student-cta-btn w-full sm:w-auto">
            <Bookmark className="w-4 h-4" />
            <span>{t('blog.myFavorites')}</span>
            {favorites.size > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white">
                {favorites.size}
              </span>
            )}
          </Link>
        }
      />

      {/* Compact Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="student-card p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {t('blog.totalArticles')}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-[var(--student-primary)] tabular-nums mt-0.5">
              {pagination?.total ?? 0}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center shrink-0">
            <Newspaper className="w-5 h-5" />
          </span>
        </div>

        <div className="student-card p-3.5 sm:p-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              {t('nav.favorites')}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-[var(--student-primary)] tabular-nums mt-0.5">
              {favorites.size}
            </p>
          </div>
          <span className="w-10 h-10 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5" />
          </span>
        </div>
      </div>

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

      {blogs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={
            debouncedSearch || selectedTopic !== 'all'
              ? t('blog.noBlogsFound')
              : t('blog.noBlogsYet')
          }
          description={
            debouncedSearch || selectedTopic !== 'all'
              ? t('blog.tryAdjusting')
              : t('blog.checkBackLater')
          }
        />
      ) : (
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-opacity ${
            isFetching ? 'opacity-60 pointer-events-none' : ''
          }`}
        >
          {blogs.map((blog: Blog, index: number) => (
            <StudentBlogCard
              key={blog._id}
              blog={blog}
              index={index}
              isFavorited={favorites.has(blog._id)}
              onToggleFavorite={toggleFavorite}
              themeText={theme.text}
              t={t}
            />
          ))}
        </div>
      )}

      {pagination && (
        <BlogListPagination page={page} pagination={pagination} onPageChange={setPage} />
      )}
    </PageWrapper>
  );
}

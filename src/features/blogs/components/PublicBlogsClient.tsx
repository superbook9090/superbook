'use client';

import React, { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { useAddFavorite, useRemoveFavorite } from '@/lib/react-query/hooks';
import { normalizeRole } from '@/lib/roles';
import type { PublicBlogItem, BlogPagination, BlogLanguageType, BlogSortType } from './types';
import BlogHeroHeader from './BlogHeroHeader';
import BlogTopicTabs from './BlogTopicTabs';
import BlogFeaturedSpotlight from './BlogFeaturedSpotlight';
import BlogCard from './BlogCard';
import BlogCardSkeleton from './BlogCardSkeleton';
import BlogListPagination from './BlogListPagination';

interface PublicBlogsClientProps {
  blogs: PublicBlogItem[];
  topics: string[];
  pagination: BlogPagination;
}

export default function PublicBlogsClient({
  blogs,
  topics,
  pagination,
}: PublicBlogsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const [isPending, startTransition] = useTransition();

  const { session, favorites } = useSessionStore();
  const role = session?.user?.role ? normalizeRole(session.user.role) : 'guest';
  const currentUserId = session?.user?.id;

  const currentTopic = searchParams.get('topic') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentLang = (searchParams.get('language') as BlogLanguageType) || 'all';
  const currentSort = (searchParams.get('sort') as BlogSortType) || 'latest';

  const [searchQuery, setSearchQuery] = useState(currentSearch);
  const [selectedTopic, setSelectedTopic] = useState(currentTopic);
  const [languageFilter, setLanguageFilter] = useState<BlogLanguageType>(currentLang);
  const [sort, setSort] = useState<BlogSortType>(currentSort);

  useEffect(() => {
    setSearchQuery(currentSearch);
    setSelectedTopic(currentTopic);
    setLanguageFilter(currentLang);
    setSort(currentSort);
  }, [currentSearch, currentTopic, currentLang, currentSort]);

  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();

  const applyUrlFilters = (
    newSearch: string,
    newTopic: string,
    newLang: BlogLanguageType,
    newSort: BlogSortType,
    newPage = 1
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());

    if (newSearch.trim()) params.set('search', newSearch.trim());
    else params.delete('search');

    if (newTopic && newTopic !== 'All') params.set('topic', newTopic);
    else params.delete('topic');

    if (newLang && newLang !== 'all') params.set('language', newLang);
    else params.delete('language');

    if (newSort && newSort !== 'latest') params.set('sort', newSort);
    else params.delete('sort');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    applyUrlFilters(val, selectedTopic, languageFilter, sort);
  };

  const handleTopicChange = (topic: string) => {
    setSelectedTopic(topic);
    applyUrlFilters(searchQuery, topic, languageFilter, sort);
  };

  const handleLanguageChange = (lang: BlogLanguageType) => {
    setLanguageFilter(lang);
    applyUrlFilters(searchQuery, selectedTopic, lang, sort);
  };

  const handleSortChange = (newSort: BlogSortType) => {
    setSort(newSort);
    applyUrlFilters(searchQuery, selectedTopic, languageFilter, newSort);
  };

  const handlePageChange = (newPage: number) => {
    applyUrlFilters(searchQuery, selectedTopic, languageFilter, sort, newPage);
  };

  const handleToggleFavorite = async (blogId: string) => {
    if (role === 'guest') {
      addAlert({
        type: 'info',
        message: t('blog.signInToSave') || 'Please sign in to save articles to your favorites',
      });
      return;
    }
    const isFavorited = favorites.has(blogId);
    try {
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync(blogId);
        addAlert({ type: 'success', message: t('blog.removedSuccess') || 'Removed from favorites' });
      } else {
        await addFavoriteMutation.mutateAsync(blogId);
        addAlert({ type: 'success', message: t('blog.savedSuccess') || 'Added to favorites' });
      }
    } catch {
      addAlert({ type: 'error', message: t('blog.failedUpdateFavorite') || 'Could not update favorite' });
    }
  };

  // When browsing first page without active query, spotlight the top featured/trending post
  const isDefaultView = pagination.page === 1 && !searchQuery && selectedTopic === 'All' && languageFilter === 'all';
  const spotlightBlog = isDefaultView && blogs.length > 0 ? blogs[0] : null;
  const gridBlogs = spotlightBlog ? blogs.slice(1) : blogs;

  return (
    <div className="stack-page">
      {/* Hero Header with Role-Adaptive Action Banners */}
      <BlogHeroHeader
        role={role}
        userName={session?.user?.name}
        favoritesCount={favorites.size}
        totalBlogs={pagination.total}
      />

      {/* Dynamic Topic & Filter Navigation */}
      <BlogTopicTabs
        topics={topics}
        selectedTopic={selectedTopic}
        onSelectTopic={handleTopicChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClearSearch={() => handleSearchChange('')}
        languageFilter={languageFilter}
        onLanguageChange={handleLanguageChange}
        sort={sort}
        onSortChange={handleSortChange}
        totalCount={pagination.total}
      />

      {/* Loading Overlay State */}
      {isPending ? (
        <BlogCardSkeleton count={6} />
      ) : blogs.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card-solid)] p-10 sm:p-16 text-center shadow-[var(--shadow-sm)]">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[var(--color-foreground)]">
            {t('blog.noBlogsFound') || 'No articles found'}
          </h3>
          <p className="mt-1.5 max-w-md text-sm text-[var(--color-muted-foreground)]">
            {t('blog.tryAdjusting') || 'Try adjusting your search query, topic filter, or language.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedTopic('All');
              setLanguageFilter('all');
              applyUrlFilters('', 'All', 'all', 'latest');
            }}
            className="mt-6 rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-all"
          >
            {t('common.clearFilters') || 'Clear all filters'}
          </button>
        </div>
      ) : (
        /* Content Feed */
        <div className="space-y-8">
          {/* Spotlight Hero Article on Page 1 Default Feed */}
          {spotlightBlog && (
            <BlogFeaturedSpotlight
              blog={spotlightBlog}
              role={role}
              currentUserId={currentUserId}
              isFavorited={favorites.has(spotlightBlog._id)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {/* Grid of Articles */}
          {gridBlogs.length > 0 && (
            <div className="grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
              {gridBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  role={role}
                  currentUserId={currentUserId}
                  isFavorited={favorites.has(blog._id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="pt-4 border-t border-[var(--border)]">
              <BlogListPagination
                page={pagination.page}
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

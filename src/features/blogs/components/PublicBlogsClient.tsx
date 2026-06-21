'use client';

import React, { useTransition, useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import BackButton from '@/components/ui/BackButton';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  topic: string;
  slug: string;
  readingTimeMinutes: number;
  createdAt: string;
  author?: { _id: string; name: string | null };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicBlogsClientProps {
  blogs: Blog[];
  topics: string[];
  pagination: Pagination;
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
  const [isPending, startTransition] = useTransition();

  const currentTopic = searchParams.get('topic') || 'All';
  const currentSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(currentSearch);

  // Sync state with URL search parameters
  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  const updateFilters = (newSearch: string, newTopic: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset to page 1 on filter change

    if (newSearch.trim()) {
      params.set('search', newSearch);
    } else {
      params.delete('search');
    }

    if (newTopic && newTopic !== 'All') {
      params.set('topic', newTopic);
    } else {
      params.delete('topic');
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateFilters(value, currentTopic);
  };

  const handleTopicChange = (value: string) => {
    updateFilters(searchQuery, value);
  };

  const handleClear = () => {
    setSearchQuery('');
    updateFilters('', 'All');
  };

  // Convert topics to FilterChipOption format
  const topicOptions = [
    { id: 'All', label: t('common.all') || 'All' },
    ...topics.map((topic) => ({ id: topic, label: topic })),
  ];

  const chipGroups = [
    {
      label: t('blog.topic') || 'Topic',
      value: currentTopic,
      onChange: handleTopicChange,
      options: topicOptions,
      neutralValue: 'All',
    },
  ];

  return (
    <div className="stack-page">
      <div className="flex items-center justify-between">
        <BackButton
          href={ROUTES.home}
          label={t('privacy.backToHome') || 'Back to Home'}
        />
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-[var(--color-foreground)]">
          {t('blog.studyResources') || 'Study resources and exam preparation articles'}
        </h1>
        <p className="max-w-3xl text-[var(--color-muted-foreground)]">
          {t('blog.studyResourcesDesc') || 'Search public articles, browse by category, and discover featured explainers designed for organic discovery and sharing.'}
        </p>
      </div>

      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onClear={handleClear}
          searchPlaceholder={t('blog.searchBlogs') || 'Search blogs...'}
          chipGroups={chipGroups}
        />
      </FilterPanel>

      {isPending && (
        <div className="text-center py-4 text-sm text-[var(--color-muted-foreground)]">
          Loading...
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {blogs.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-[var(--card-solid)] border border-dashed border-[var(--border)] rounded-2xl">
            <h3 className="heading-md text-[var(--color-foreground)] mb-1">
              {t('blog.noBlogsFound') || 'No blogs found'}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-6">
              {t('courses.tryAdjustingFilters') || 'Try adjusting your search or category filters.'}
            </p>
          </div>
        ) : (
          blogs.map((blog) => (
            <article key={blog._id} className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="mb-3 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                  <span className="font-semibold px-2.5 py-0.5 bg-[var(--color-surface-muted)] rounded-full">{blog.topic}</span>
                  <span>{blog.readingTimeMinutes} {t('quiz.min') || 'min'} read</span>
                </div>
                <h2 className="text-xl font-bold text-[var(--color-foreground)] line-clamp-2">{blog.title}</h2>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)] line-clamp-3">{blog.excerpt}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--color-muted-foreground)]">
                <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start gap-4">
                  {blog.author?.name && (
                    <span className="flex items-center gap-1 font-semibold text-[var(--color-foreground)]">
                      <User className="w-3.5 h-3.5 text-[var(--color-muted)]" />
                      {blog.author.name}
                    </span>
                  )}
                  <span>
                    {new Date(blog.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <Link href={ROUTES.blog(blog.slug)} className="text-sm font-semibold text-[var(--color-primary)] hover:underline shrink-0">
                  {t('favorites.readArticle') || 'Read Article'}
                </Link>
              </div>
            </article>
          ))
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--border)]">
          <span className="text-sm text-[var(--color-muted-foreground)]">
            {t('common.pageOf') ? `${t('common.page')} ${pagination.page} ${t('common.of') || 'of'} ${pagination.totalPages}` : `Page ${pagination.page} of ${pagination.totalPages}`}
          </span>
          <div className="flex gap-2">
            {pagination.page > 1 && (
              <Link
                href={`/blogs?page=${pagination.page - 1}${currentTopic !== 'All' ? `&topic=${encodeURIComponent(currentTopic)}` : ''}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {t('common.previous') || 'Previous'}
              </Link>
            )}
            {pagination.page < pagination.totalPages && (
              <Link
                href={`/blogs?page=${pagination.page + 1}${currentTopic !== 'All' ? `&topic=${encodeURIComponent(currentTopic)}` : ''}${currentSearch ? `&search=${encodeURIComponent(currentSearch)}` : ''}`}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                {t('common.next') || 'Next'}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

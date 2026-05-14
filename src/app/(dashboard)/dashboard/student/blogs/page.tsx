'use client';

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
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Bookmark,
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useBlogs, useFavorites, useAddFavorite, useRemoveFavorite, type Blog } from '@/lib/react-query/hooks';
import { blogTopicKeys, supportedLanguages, type BlogTopicKey } from '@/i18n/config';

const topics = ['all', ...blogTopicKeys] as const;

export default function StudentBlogsPage() {
  const { session, status, favorites, addFavorite, removeFavorite } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const featureEnabled = useFeature('enableBlogs');

  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { data: blogs = [], isLoading } = useBlogs(orgId);
  const { data: favoritesData = [] } = useFavorites();
  const addFavoriteMutation = useAddFavorite();
  const removeFavoriteMutation = useRemoveFavorite();
  
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'hi'>('all');
  const [hasRedirected, setHasRedirected] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  useEffect(() => {
    if (status === 'loading') return;
    if (hasRedirected) return;

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && !featureEnabled) {
      router.push('/dashboard/student');
    }
  }, [status, featureEnabled, hasRedirected, router]);

  // Sync Zustand favorites with React Query data
  useEffect(() => {
    const favoriteIds = new Set(favoritesData.map((f: { blog: { _id: string } }) => f.blog._id));
    favoritesData.forEach((f: { blog: { _id: string } }) => {
      if (!favorites.has(f.blog._id)) {
        addFavorite(f.blog._id);
      }
    });
    // Remove favorites that are no longer in the API response
    favorites.forEach((blogId) => {
      if (!favoriteIds.has(blogId)) {
        removeFavorite(blogId);
      }
    });
  }, [favoritesData, favorites, addFavorite, removeFavorite]);

  const toggleFavorite = async (blogId: string) => {
    const isFavorited = favorites.has(blogId);

    try {
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync(blogId);
        removeFavorite(blogId);
      } else {
        await addFavoriteMutation.mutateAsync(blogId);
        addFavorite(blogId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredBlogs = blogs.filter((blog: Blog) => {
    const q = debouncedSearch.toLowerCase();
    const matchesSearch =
      !q ||
      blog.title.toLowerCase().includes(q) ||
      blog.topic.toLowerCase().includes(q);
    const matchesTopic = selectedTopic === 'all' || blog.topic.toLowerCase() === selectedTopic.toLowerCase();
    const matchesLanguage = languageFilter === 'all' || blog.language === languageFilter;
    return matchesSearch && matchesTopic && matchesLanguage;
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
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
          href="/dashboard/student/favorites"
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
        className="bg-[var(--background)] rounded-2xl p-4 shadow-sm"
      >
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder={t('blog.searchBlogs')}
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          />
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <Filter className="w-5 h-5 text-[var(--color-muted-foreground)] flex-shrink-0" />
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2.5 min-h-[44px] rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation ${
                selectedTopic === topic
                  ? `${theme.primary} text-white`
                  : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]/80'
              }`}
            >
              {topic === 'all' ? t('topics.all') : t(`topics.${topic}` as `topics.${BlogTopicKey}`)}
            </button>
          ))}
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 mt-3">
          <BookOpen className="w-5 h-5 text-[var(--color-muted-foreground)] flex-shrink-0" />
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as 'all' | 'en' | 'hi')}
            className="flex-1 sm:flex-none px-4 py-2.5 min-h-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
          >
            <option value="all">{t('blog.allLanguages')}</option>
            {supportedLanguages.map((language) => (
              <option key={language} value={language}>
                {t(language === 'en' ? 'common.english' : 'common.hindi')}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-4"
      >
        <div className="bg-[var(--background)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{blogs.length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('blog.totalArticles')}</p>
        </div>
        <div className="bg-[var(--background)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{favoritesData.length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('nav.favorites')}</p>
        </div>
      </motion.div>

      {/* Blogs Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
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
                className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  {/* Topic Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <button
                      onClick={() => toggleFavorite(blog._id)}
                      className="p-2 min-h-[44px] sm:min-h-0 rounded-full hover:bg-[var(--color-surface-muted)] transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorited
                            ? `fill-current ${theme.text}`
                            : `text-[var(--color-muted-foreground)] hover:${theme.text}`
                        }`}
                      />
                    </button>
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
                    href={`/dashboard/student/blogs/${blog._id}`}
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
    </div>
  );
}

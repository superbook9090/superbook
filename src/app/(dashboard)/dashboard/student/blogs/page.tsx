'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { debounce } from '@/lib/debounce';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useCachedStore } from '@/store/useCachedStore';
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
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  language: string;
  createdAt: string;
  author: { name: string };
}

const topics = [
  'all',
  'mathematics',
  'science',
  'english',
  'history',
  'geography',
  'computerScience',
  'physics',
  'chemistry',
  'biology',
  'literature',
  'other',
];

export default function StudentBlogsPage() {
  const { session, status, favorites, addFavorite, removeFavorite } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const featureEnabled = useFeature('enableBlogs');

  // Use cached store for blogs
  const orgId = session?.user?.organizationId || 'public';
  const { blogs, fetchBlogs } = useCachedStore();
  const blogState = blogs[orgId];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'hi'>('all');
  const [hasRedirected, setHasRedirected] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    debounce((...args: unknown[]) => setSearchTerm(args[0] as string), 300)(value);
  };

  // Fetch blogs using cached store
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    
    // Fetch blogs from cached store
    fetchBlogs(orgId);
  }, [session, status, orgId, languageFilter, fetchBlogs, router]);

  useEffect(() => {
    if (status === 'loading') return;
    if (hasRedirected) return;

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && featureEnabled) {
      fetchBlogs();
    }
  }, [status, featureEnabled, hasRedirected, fetchBlogs, router]);

  const toggleFavorite = async (blogId: string) => {
    const isFavorited = favorites.has(blogId);

    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${blogId}`, { method: 'DELETE' });
        removeFavorite(blogId);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogId }),
        });
        addFavorite(blogId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredBlogs = (blogState?.data || []).filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || blog.topic.toLowerCase() === selectedTopic.toLowerCase();
    const matchesLanguage = languageFilter === 'all' || blog.language === languageFilter;
    return matchesSearch && matchesTopic && matchesLanguage;
  });

  if (blogState?.loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Blog cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('blog.learningBlog')}</h1>
          <p className="text-gray-500 mt-1">
            {t('blog.blogDesc')}
          </p>
        </div>
        <Link
          href="/dashboard/student/favorites"
          className={`inline-flex items-center justify-center px-4 py-2.5 sm:w-auto w-full bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all`}
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
        className="bg-white rounded-2xl p-4 shadow-sm"
      >
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('blog.searchBlogs')}
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
          />
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-2 px-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all touch-manipulation ${
                selectedTopic === topic
                  ? `${theme.primary} text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t(`topics.${topic}`)}
            </button>
          ))}
        </div>

        {/* Language Filter */}
        <div className="flex items-center gap-2 mt-3">
          <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value as 'all' | 'en' | 'hi')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
          >
            <option value="all">{t('blog.allLanguages')}</option>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
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
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{(blogState?.data || []).length}</p>
          <p className="text-sm text-gray-500">{t('blog.totalArticles')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{favorites.size}</p>
          <p className="text-sm text-gray-500">{t('nav.favorites')}</p>
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
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || selectedTopic !== 'all'
                ? t('blog.noBlogsFound')
                : t('blog.noBlogsYet')}
            </h3>
            <p className="text-gray-500">
              {searchTerm || selectedTopic !== 'all'
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
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  {/* Topic Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <button
                      onClick={() => toggleFavorite(blog._id)}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorited
                            ? `fill-current ${theme.text}`
                            : `text-gray-400 hover:${theme.text}`
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {blog.author?.name || t('blog.teacher')}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(blog.createdAt).toLocaleDateString()}
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

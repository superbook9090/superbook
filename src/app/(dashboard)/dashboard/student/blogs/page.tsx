'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { debounce } from '@/lib/debounce';
import { useApiRequest } from '@/hooks/useApiRequest';
import {
  BookOpen,
  Heart,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
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

interface Favorite {
  _id: string;
  blog: Blog;
}

interface FavoritesResponse {
  favorites: Favorite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface FeatureToggles {
  enableBlogs: boolean;
  enableQuizzes: boolean;
  enableCourses: boolean;
  enableAnalytics: boolean;
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'hi'>('all');
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [checkingFeature, setCheckingFeature] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  const blogsRequest = useApiRequest<Blog[]>();
  const favoritesRequest = useApiRequest<FavoritesResponse>();

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  const fetchBlogs = useCallback(async () => {
    const params = new URLSearchParams();
    if (languageFilter !== 'all') {
      params.append('language', languageFilter);
    }
    const url = `/api/blogs${params.toString() ? `?${params.toString()}` : ''}`;

    blogsRequest.execute({
      fn: async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        return data.blogs;
      },
      onSuccess: (data) => {
        setBlogs(data);
        setIsLoading(false);
      },
      onError: (error) => {
        console.error('Error fetching blogs:', error);
        setIsLoading(false);
      },
    });
  }, [languageFilter, blogsRequest]);

  const fetchFavorites = useCallback(async () => {
    favoritesRequest.execute({
      fn: async () => {
        const response = await fetch('/api/favorites');
        if (!response.ok) throw new Error('Failed to fetch');
        return await response.json();
      },
      onSuccess: (data) => {
        const favoriteIds = new Set(data.favorites.map((fav) => fav.blog._id));
        setFavorites(favoriteIds);
      },
      onError: (error) => {
        console.error('Error fetching favorites:', error);
      },
    });
  }, [favoritesRequest]);

  useEffect(() => {
    if (checkingFeature) return; // Prevent multiple calls
    
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.featureToggles?.enableBlogs) {
          setFeatureEnabled(false);
        }
      })
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setCheckingFeature(false));
  }, [checkingFeature]);

  useEffect(() => {
    if (hasRedirected) return; // Prevent repeated redirects

    if (!featureEnabled) {
      setHasRedirected(true);
      router.push('/dashboard/student');
      return;
    }

    if (status === 'unauthenticated') {
      setHasRedirected(true);
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && featureEnabled) {
      fetchBlogs();
      fetchFavorites();
    }
  }, [status, featureEnabled, hasRedirected]);

  const toggleFavorite = async (blogId: string) => {
    const isFavorited = favorites.has(blogId);

    try {
      if (isFavorited) {
        await fetch(`/api/favorites/${blogId}`, { method: 'DELETE' });
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(blogId);
          return next;
        });
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogId }),
        });
        if (response.ok) {
          setFavorites((prev) => new Set(prev).add(blogId));
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic = selectedTopic === 'all' || blog.topic === selectedTopic;
    const matchesLanguage = languageFilter === 'all' || blog.language === languageFilter;
    return matchesSearch && matchesTopic && matchesLanguage;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('blog.learningBlog')}</h1>
          <p className="text-gray-500 mt-1">
            {t('blog.blogDesc')}
          </p>
        </div>
        <Link
          href="/dashboard/student/favorites"
          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
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
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearchHandler(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Topic Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedTopic === topic
                  ? 'bg-indigo-600 text-white'
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
            className="px-4 py-2 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
        className="flex gap-4"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
          <p className="text-2xl font-bold text-indigo-600">{blogs.length}</p>
          <p className="text-sm text-gray-500">{t('blog.totalArticles')}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex-1">
          <p className="text-2xl font-bold text-rose-500">{favorites.size}</p>
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
          filteredBlogs.map((blog, index) => {
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
                            ? 'fill-rose-500 text-rose-500'
                            : 'text-gray-400 hover:text-rose-500'
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
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
                    className="inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
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

'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import {
  Bookmark,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { Favorite } from '@/store/useSessionStore';

interface FavoritesListProps {
  initialFavorites: Favorite[];
}

export default function FavoritesList({ initialFavorites }: FavoritesListProps) {
  const { t } = useTranslation();
  const { removeFavorite: removeFavoriteFromStore } = useSessionStore();
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);

  const removeFavorite = async (favoriteId: string, blogId: string) => {
    try {
      const response = await fetch(`/api/favorites/${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav._id !== favoriteId));
        removeFavoriteFromStore(blogId);
        // Refetch favorites from API to ensure sync
        mutate('/api/favorites');
      }
    } catch {
      // Error handled silently - favorite remains in UI
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <Link
            href="/dashboard/student/blogs"
            className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('favorites.backToBlogs')}
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-rose-500" />
            {t('favorites.myFavorites')}
          </h1>
          <p className="text-gray-500 mt-1">
            {t('favorites.favoritesDesc')}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Bookmark className="w-7 h-7 fill-white" />
          </div>
          <div>
            <p className="text-3xl font-bold">{favorites.length}</p>
            <p className="text-rose-100">{t('favorites.savedArticles')}</p>
          </div>
        </div>
      </motion.div>

      {/* Favorites List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {favorites.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t('favorites.noFavoritesYet')}
            </h3>
            <p className="text-gray-500 mb-6">
              {t('favorites.startExploring')}
            </p>
            <Link
              href="/dashboard/student/blogs"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t('favorites.exploreBlogs')}
            </Link>
          </div>
        ) : (
          favorites.map((favorite, index) => {
            const blog = favorite.blog;
            // Strip HTML tags for excerpt
            const plainText = blog.content.replace(/<[^>]*>/g, '');
            const excerpt =
              plainText.substring(0, 100) +
              (plainText.length > 100 ? '...' : '');

            return (
              <motion.div
                key={favorite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <button
                      onClick={() => removeFavorite(favorite._id, blog._id)}
                      className="p-2 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                      title={t('favorites.removeFromFavorites')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
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
                    className="mt-4 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    {t('favorites.readArticle')}
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

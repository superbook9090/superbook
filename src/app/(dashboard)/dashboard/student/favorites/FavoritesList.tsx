'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Bookmark,
  User,
  ArrowRight,
  Trash2,
  BookOpen,
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { useRemoveFavorite, type Favorite } from '@/lib/react-query/hooks';

interface FavoritesListProps {
  initialFavorites: Favorite[];
  /** Total favorites (may exceed loaded page). */
  totalCount: number;
}

export default function FavoritesList({ initialFavorites, totalCount }: FavoritesListProps) {
  const { t } = useTranslation();
  const [favorites, setFavorites] = useState<Favorite[]>(initialFavorites);
  const removeFavoriteMutation = useRemoveFavorite();

  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  const removeFavorite = async (favoriteId: string, blogId: string) => {
    try {
      await removeFavoriteMutation.mutateAsync(blogId);
      setFavorites(favorites.filter((fav) => fav._id !== favoriteId));
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
          <BackButton
            href={ROUTES.student.blogs}
            label={t('favorites.backToBlogs')}
            className="hover:text-[var(--student-primary)] mb-2"
          />
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-[var(--error)]" />
            {t('favorites.myFavorites')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">
            {t('favorites.favoritesDesc')}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6 bg-[var(--card-solid)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-[var(--error-light)] text-[var(--error)] rounded-xl flex items-center justify-center">
            <Bookmark className="w-7 h-7 fill-current" />
          </div>
          <div>
            <p className="text-3xl font-bold tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)]">{totalCount}</p>
            <p className="text-[var(--color-muted-foreground)]">{t('favorites.savedArticles')}</p>
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
          <div className="col-span-full text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
            <Bookmark className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
              {t('favorites.noFavoritesYet')}
            </h3>
            <p className="text-[var(--color-muted-foreground)] mb-6">
              {t('favorites.startExploring')}
            </p>
            <Link
              href={ROUTES.student.blogs}
              className="inline-flex items-center min-h-[44px] px-5 py-3 sm:px-5 sm:py-2.5 bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white font-medium rounded-xl shadow-lg hover:shadow-xl hover:brightness-110 transition-all"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              {t('favorites.exploreBlogs')}
            </Link>
          </div>
        ) : (
          favorites.map((favorite, index) => {
            const blog = favorite.blog;
            const excerptSource = blog.excerpt ?? (blog.content ? blog.content.replace(/<[^>]*>/g, '') : '');
            const excerpt =
              excerptSource.substring(0, 100) + (excerptSource.length > 100 ? '...' : '');

            return (
              <motion.div
                key={favorite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <Tooltip label={t('favorites.removeFromFavorites')}>
                      <button
                        onClick={() => removeFavorite(favorite._id, blog._id)}
                        className="p-2 min-h-[44px] sm:min-h-0 rounded-full text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                        aria-label={t('favorites.removeFromFavorites')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Tooltip>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-2">
                    {excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {blog.author?.name || t('blog.teacher')}
                    </span>
                  </div>

                  {/* Read More */}
                  <Link
                    href={ROUTES.student.blog(blog._id)}
                    className="mt-4 inline-flex items-center text-[var(--student-primary)] font-medium hover:text-[var(--student-primary)]/80 transition-colors"
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

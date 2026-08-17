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

import { PageWrapper } from '@/components/layout';

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
    <PageWrapper>
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
        className="rounded-xl p-3.5 sm:p-4 bg-[var(--card-solid)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[var(--error-light)] text-[var(--error)] rounded-lg flex items-center justify-center shrink-0">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-bold tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)]">{totalCount}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">{t('favorites.savedArticles')}</p>
          </div>
        </div>
      </motion.div>

      {/* Favorites List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
      >
        {favorites.length === 0 ? (
          <div className="col-span-full text-center py-10 card-panel">
            <Bookmark className="w-10 h-10 text-[var(--color-muted-foreground)] mx-auto mb-2.5" />
            <h3 className="text-base font-semibold text-[var(--color-foreground)] mb-1">
              {t('favorites.noFavoritesYet')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-4">
              {t('favorites.startExploring')}
            </p>
            <Link
              href={ROUTES.student.blogs}
              className="btn-premium focus-ring"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
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
                className="bg-[var(--card-solid)] rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all overflow-hidden group"
              >
                <div className="p-3.5 sm:p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <Tooltip label={t('favorites.removeFromFavorites')}>
                      <button
                        onClick={() => removeFavorite(favorite._id, blog._id)}
                        className="p-1.5 rounded-full text-[var(--error)] hover:bg-[var(--error-light)] transition-colors"
                        aria-label={t('favorites.removeFromFavorites')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-1 line-clamp-1">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm mb-3 line-clamp-2">
                    {excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                    <span className="flex items-center">
                      <User className="w-3.5 h-3.5 mr-1" />
                      {blog.author?.name || t('blog.teacher')}
                    </span>
                  </div>

                  {/* Read More */}
                  <Link
                    href={ROUTES.student.blog(blog._id)}
                    className="mt-3 inline-flex items-center text-xs sm:text-sm text-[var(--student-primary)] font-semibold hover:text-[var(--student-primary)]/80 transition-colors"
                  >
                    {t('favorites.readArticle')}
                    <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </PageWrapper>
  );
}

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
        className="rounded-2xl p-4 antigravity-glass border border-[var(--border)] shadow-xs"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-[var(--error-light)] text-[var(--error)] rounded-xl flex items-center justify-center shrink-0 shadow-xs">
            <Bookmark className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xl sm:text-2xl font-black tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)]">{totalCount}</p>
            <p className="text-xs text-[var(--color-muted-foreground)] font-medium">{t('favorites.savedArticles')}</p>
          </div>
        </div>
      </motion.div>

      {/* Favorites List */}
      <div className="perspective-1000">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {favorites.length === 0 ? (
            <div className="col-span-full text-center py-14 antigravity-glass rounded-3xl border border-dashed border-[var(--border)] p-8">
              <div className="w-14 h-14 rounded-2xl bg-[var(--error-light)] text-[var(--error)] flex items-center justify-center mx-auto mb-3">
                <Bookmark className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[var(--color-foreground)] mb-1">
                {t('favorites.noFavoritesYet')}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mb-5 max-w-sm mx-auto">
                {t('favorites.startExploring')}
              </p>
              <Link
                href={ROUTES.student.blogs}
                className="btn-premium inline-flex items-center"
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
                  initial={{ opacity: 0, y: 16, rotateX: 4 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="antigravity-glass antigravity-card rounded-2xl border border-[var(--border)] shadow-xs hover:shadow-xl hover:border-[var(--student-primary)]/40 transition-all overflow-hidden group transform-3d"
                >
                  <div className="p-4 sm:p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2.5">
                      <Badge variant="primary" size="sm">
                        {blog.topic}
                      </Badge>
                      <Tooltip label={t('favorites.removeFromFavorites')}>
                        <button
                          onClick={() => removeFavorite(favorite._id, blog._id)}
                          className="p-1.5 rounded-full text-[var(--error)] hover:bg-[var(--error-light)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label={t('favorites.removeFromFavorites')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-1 line-clamp-1 group-hover:text-[var(--student-primary)] transition-colors">
                      {blog.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm mb-3.5 line-clamp-2 leading-relaxed">
                      {excerpt}
                    </p>

                    {/* Meta & Read More */}
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[var(--border)] text-[var(--color-muted-foreground)]">
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1" />
                        {blog.author?.name || t('blog.teacher')}
                      </span>
                      <Link
                        href={ROUTES.student.blog(blog._id)}
                        className="inline-flex items-center text-xs font-bold text-[var(--student-primary)] hover:opacity-80 transition-opacity"
                      >
                        {t('favorites.readArticle')}
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </PageWrapper>
  );
}

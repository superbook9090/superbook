'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, User, ArrowRight, Trash2, BookOpen } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/Badge';
import Tooltip from '@/components/ui/Tooltip';
import { useRemoveFavorite, type Favorite } from '@/lib/react-query/hooks';
import { PageWrapper, EmptyState } from '@/components/layout';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';

interface FavoritesListProps {
  initialFavorites: Favorite[];
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
      setFavorites((prev) => prev.filter((fav) => fav._id !== favoriteId));
    } catch {
      /* keep item visible on failure */
    }
  };

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Bookmark}
        eyebrow={t('common.favorites')}
        title={t('favorites.myFavorites')}
        description={t('favorites.favoritesDesc')}
        backHref={ROUTES.student.blogs}
        backLabel={t('favorites.backToBlogs')}
        actions={
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80">
            <Bookmark className="w-4 h-4 text-[var(--error)] fill-current shrink-0" />
            <span className="text-sm font-extrabold tabular-nums text-[var(--color-foreground)]">
              {totalCount}
            </span>
            <span className="text-xs text-[var(--color-muted-foreground)] font-medium">
              {t('favorites.savedArticles')}
            </span>
          </div>
        }
      />

      {favorites.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t('favorites.noFavoritesYet')}
          description={t('favorites.startExploring')}
          action={
            <Link href={ROUTES.student.blogs} className="student-cta-btn">
              <BookOpen className="w-4 h-4" />
              <span>{t('favorites.exploreBlogs')}</span>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((favorite) => {
            const blog = favorite.blog;
            const excerptSource =
              blog.excerpt ?? (blog.content ? blog.content.replace(/<[^>]*>/g, '') : '');
            const excerpt =
              excerptSource.substring(0, 120) + (excerptSource.length > 120 ? '...' : '');

            return (
              <article
                key={favorite._id}
                className="student-card overflow-hidden group flex flex-col justify-between"
              >
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="primary" size="sm">
                        {blog.topic}
                      </Badge>
                      <Tooltip label={t('favorites.removeFromFavorites')}>
                        <button
                          type="button"
                          onClick={() => removeFavorite(favorite._id, blog._id)}
                          aria-label={t('favorites.removeFromFavorites')}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer focus-ring"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </Tooltip>
                    </div>

                    <Link
                      href={ROUTES.student.blog(blog.slug || blog._id)}
                      className="block focus-ring rounded-lg"
                    >
                      <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-2 group-hover:text-[var(--student-primary)] transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                        {excerpt}
                      </p>
                    </Link>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-[var(--border)]/70 text-[var(--color-muted-foreground)]">
                    <span className="inline-flex items-center gap-1 truncate">
                      <User className="w-3.5 h-3.5 text-[var(--student-primary)] shrink-0" />
                      <span className="truncate">{blog.author?.name || t('blog.teacher')}</span>
                    </span>
                    <Link
                      href={ROUTES.student.blog(blog.slug || blog._id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[var(--student-primary)] hover:opacity-80 transition-opacity shrink-0"
                    >
                      <span>{t('favorites.readArticle')}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}

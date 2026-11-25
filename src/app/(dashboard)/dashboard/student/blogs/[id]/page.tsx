'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { Heart, Share2, Calendar, User, BookOpen, Hash } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { formatDate } from '@/lib/dateUtils';
import BackButton from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, EmptyState } from '@/components/layout';
import { getBlogById, type BlogDocument } from '@/lib/api/blogs';
import { addFavorite as postFavorite, removeFavorite as removeFavoriteApi } from '@/lib/api/favorites';
import { ApiClientError } from '@/lib/api/http';
import { queryKeys } from '@/lib/react-query/query-keys';

export default function BlogDetailPage() {
  const queryClient = useQueryClient();
  const { status, favorites, addFavorite, removeFavorite } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [blog, setBlog] = useState<BlogDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBlog = useCallback(async () => {
    try {
      const data = await getBlogById(blogId);
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
      return;
    }
    if (status === 'authenticated' && blogId) {
      fetchBlog();
    }
  }, [status, blogId, fetchBlog, router]);

  const toggleFavorite = async () => {
    const isFavorited = favorites.has(blogId);
    try {
      if (isFavorited) {
        await removeFavoriteApi(blogId);
        removeFavorite(blogId);
      } else {
        await postFavorite(blogId);
        addFavorite(blogId);
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : t('blog.failedUpdateFavorite');
      addAlert({ type: 'error', message, duration: 5000 });
    }
  };

  const handleShare = async () => {
    if (!blog) return;
    const shareSlug = blog.slug || blog._id;
    const shareUrl = `${window.location.origin}/blog/${shareSlug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: blog.title, text: blog.title, url: shareUrl });
        return;
      } catch {
        /* fallback to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      addAlert({ type: 'success', message: t('createBlogPage.urlCopied') });
    } catch {
      addAlert({ type: 'error', message: 'Failed to copy URL' });
    }
  };

  if (isLoading) return <PageSkeleton />;

  if (!blog) {
    return (
      <PageWrapper>
        <EmptyState
          icon={BookOpen}
          title={t('blog.blogNotFound')}
          description={t('blog.blogNotFoundDesc')}
          action={
            <BackButton
              href={ROUTES.student.blogs}
              label={t('blog.backToBlogs')}
              variant="button"
              className="student-cta-btn"
            />
          }
        />
      </PageWrapper>
    );
  }

  const isFav = favorites.has(blogId);
  const badgeText = (blog as BlogDocument & { topic?: string }).topic || t('common.blog');

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto w-full space-y-4">
        <BackButton
          href={ROUTES.student.blogs}
          label={t('blog.backToBlogs')}
          className="text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--student-primary)]"
        />

        <article className="student-panel overflow-hidden">
          <div
            className="h-[3px] w-full"
            style={{ background: 'var(--student-gradient)' }}
            aria-hidden
          />

          <div className="p-5 sm:p-7 border-b border-[var(--border)]/70">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="primary" size="md">
                <Hash className="w-3 h-3 mr-1" />
                {badgeText}
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] leading-tight mb-4">
              {blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              <span className="inline-flex items-center gap-1.5">
                <User className="w-4 h-4 text-[var(--student-primary)]" />
                <span>{blog.author?.name || t('blog.teacher')}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </span>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div
              className="prose prose-sm sm:prose-base max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
            />
          </div>

          <div className="px-5 sm:px-7 py-4 bg-[var(--surface-muted)]/60 border-t border-[var(--border)]/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <Button
              type="button"
              variant={isFav ? 'primary' : 'secondary'}
              onClick={toggleFavorite}
              className="min-h-[44px] rounded-xl flex items-center justify-center gap-2"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
              <span>{isFav ? t('blog.favorited') : t('blog.addToFavorites')}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              onClick={handleShare}
              className="min-h-[44px] rounded-xl flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('blog.share')}</span>
            </Button>
          </div>
        </article>
      </div>
    </PageWrapper>
  );
}

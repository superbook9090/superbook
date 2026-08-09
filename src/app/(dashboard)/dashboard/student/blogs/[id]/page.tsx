'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { formatDate } from '@/lib/dateUtils';
import {
  Heart,
  Share2,
  Calendar,
  User,
  BookOpen,
  Hash,
} from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DOMPurify from 'isomorphic-dompurify';
import { getBlogById, type BlogDocument } from '@/lib/api/blogs';
import { addFavorite as postFavorite, removeFavorite as removeFavoriteApi } from '@/lib/api/favorites';
import { ApiClientError } from '@/lib/api/http';
import { queryKeys } from '@/lib/react-query/query-keys';


export default function BlogDetailPage() {
  const queryClient = useQueryClient();
  const { status, favorites, addFavorite, removeFavorite } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
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
      const message =
        err instanceof ApiClientError ? err.message : t('blog.failedUpdateFavorite');
      addAlert({ type: 'error', message, duration: 5000 });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-12 h-12 border-4 border-[var(--color-surface-muted)] border-t-[var(--student-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="text-center py-16 px-4">
        <BookOpen className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
          {t('blog.blogNotFound')}
        </h3>
        <p className="text-[var(--color-muted-foreground)] mb-6">
          {t('blog.blogNotFoundDesc')}
        </p>
        <BackButton
          href={ROUTES.student.blogs}
          label={t('blog.backToBlogs')}
          variant="button"
          className={`min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <BackButton
          href={ROUTES.student.blogs}
          label={t('blog.backToBlogs')}
          className="text-[var(--student-primary)] hover:text-[var(--student-primary)]/80"
        />
      </motion.div>


      {/* Blog Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary" size="md">
              <Hash className="w-3 h-3 mr-1" />
              {blog.excerpt || 'Blog'}
            </Badge>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-foreground)] mb-4 leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {blog.author?.name || t('blog.teacher')}
            </span>
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(blog.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div
            className="prose prose-sm sm:prose-base prose-teal max-w-none text-[var(--color-foreground)] prose-headings:font-semibold prose-headings:text-[var(--color-foreground)] prose-p:text-[var(--color-muted-foreground)] prose-p:leading-relaxed prose-a:text-[var(--student-primary)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[var(--border)] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[var(--color-muted-foreground)] prose-ul:list-disc prose-ol:list-decimal prose-li:text-[var(--color-muted-foreground)] prose-img:rounded-lg prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
          />
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 lg:p-8 bg-[var(--color-surface-muted)] border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              type="button"
              variant={favorites.has(blogId) ? "primary" : "secondary"}
              onClick={toggleFavorite}
              className="flex items-center justify-center gap-2"
            >
              <Heart
                className={`w-5 h-5 ${favorites.has(blogId) ? 'fill-current' : ''}`}
              />
              <span className="hidden sm:inline">{favorites.has(blogId) ? t('blog.favorited') : t('blog.addToFavorites')}</span>
              <span className="sm:hidden">{favorites.has(blogId) ? t('blog.saved') : t('blog.save')}</span>
            </Button>

            <Button
              type="button"
              variant="primary"
              className="flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              {t('blog.share')}
            </Button>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

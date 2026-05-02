'use client';

import { useState, useEffect, useCallback } from 'react';
import { mutate } from 'swr';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  User,
  BookOpen,
  Hash,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import DOMPurify from 'isomorphic-dompurify';

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

export default function BlogDetailPage() {
  const { status, favorites, addFavorite, removeFavorite } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const params = useParams();
  const blogId = params.id as string;
  const { t } = useTranslation();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const fetchBlog = useCallback(async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setIsLoading(false);
    }
  }, [blogId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
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
        await fetch(`/api/favorites/${blogId}`, { method: 'DELETE' });
        removeFavorite(blogId);
        // Refetch favorites to sync across pages
        mutate('/api/favorites');
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blogId }),
        });
        if (response.ok || response.status === 409) {
          addFavorite(blogId);
          // Refetch favorites to sync across pages
          mutate('/api/favorites');
        }
      }
    } catch {
      setAlertState({ type: 'error', message: t('blog.failedUpdateFavorite') });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="w-12 h-12 border-4 border-[var(--color-muted)] border-t-[var(--student-primary)] rounded-full animate-spin" />
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
        <Link
          href="/dashboard/student/blogs"
          className={`inline-flex items-center justify-center min-h-[44px] px-4 py-3 sm:px-4 sm:py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-colors touch-manipulation`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlogs')}
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/dashboard/student/blogs"
          className="inline-flex items-center text-[var(--student-primary)] hover:text-[var(--student-primary)]/80 touch-manipulation"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlogs')}
        </Link>
      </motion.div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Blog Content */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="primary" size="md">
              <Hash className="w-3 h-3 mr-1" />
              {blog.topic}
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
            className="prose prose-sm sm:prose-base prose-indigo max-w-none text-[var(--color-foreground)] prose-headings:font-semibold prose-headings:text-[var(--color-foreground)] prose-p:text-[var(--color-muted-foreground)] prose-p:leading-relaxed prose-a:text-[var(--student-primary)] prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-[var(--border)] prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-[var(--color-muted-foreground)] prose-ul:list-disc prose-ol:list-decimal prose-li:text-[var(--color-muted-foreground)] prose-img:rounded-lg prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content) }}
          />
        </div>

        {/* Actions */}
        <div className="p-4 sm:p-6 lg:p-8 bg-[var(--color-muted)] border-t border-[var(--border)]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={toggleFavorite}
              className={`flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2.5 rounded-xl font-medium transition-all touch-manipulation ${
                favorites.has(blogId)
                  ? `${theme.activeBg} ${theme.text} hover:opacity-80`
                  : `${theme.activeBg} ${theme.text} hover:opacity-70`
              }`}
            >
              <Heart
                className={`w-5 h-5 ${favorites.has(blogId) ? 'fill-current' : ''}`}
              />
              <span className="hidden sm:inline">{favorites.has(blogId) ? t('blog.favorited') : t('blog.addToFavorites')}</span>
              <span className="sm:hidden">{favorites.has(blogId) ? t('blog.saved') : t('blog.save')}</span>
            </button>

            <button
              className={`flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 px-4 py-3 sm:px-4 sm:py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-all touch-manipulation`}
            >
              <Share2 className="w-4 h-4" />
              {t('blog.share')}
            </button>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Hash,
  FileText,
  Type,
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useSessionStore } from '@/store/useSessionStore';
import { getBlogById, updateBlog, type BlogDocument } from '@/lib/api/blogs';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';

const RichTextEditor = lazy(() => import('@/components/ui/RichTextEditor'));

const topics = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'Other',
];

export default function EditBlogPage() {
  const { status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    isPublished: true,
  });
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && blogId) {
      fetchBlog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, blogId]);

  const fetchBlog = async () => {
    try {
      const blog: BlogDocument = await getBlogById(blogId);
      setFormData({
        title: blog.title,
        topic: blog.topic,
        content: blog.content,
        isPublished: blog.isPublished,
      });
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.failedToLoadBlog');
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check if content is empty (handles HTML tags)
  const isContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    if (!formData.title.trim() || !formData.topic || isContentEmpty(formData.content)) {
      const errorMsg = t('blog.fillAllFields');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
      setIsSaving(false);
      return;
    }

    try {
      await updateBlog(blogId, {
        ...formData,
        isPublished: !saveAsDraft,
      });
      router.push('/dashboard/teacher/blogs');
    } catch (err) {
      const errorMsg =
        err instanceof ApiClientError
          ? err.message
          : t('blog.saveErrorGeneric');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--color-surface-muted)] border-t-[var(--teacher-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/dashboard/teacher/blogs"
          className="inline-flex items-center text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Link>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">Edit Blog</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">Update your blog post</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
      >
        {error && (
          <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)]/20 rounded-xl text-[var(--error)]">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Blog Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter an engaging title..."
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
              maxLength={200}
            />
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Topic
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Content
            </label>
            <Suspense fallback={<PageSkeleton variant="embed" />}>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog content here... Use the toolbar to format your text."
                theme="emerald"
              />
            </Suspense>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e, false)}
              isLoading={isSaving && formData.isPublished}
              className="flex-1"
            >
              <Eye className="w-5 h-5 mr-2" />
              {formData.isPublished ? 'Update & Publish' : 'Publish'}
            </Button>

            <Button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e, true)}
              isLoading={isSaving && !formData.isPublished}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <EyeOff className="w-5 h-5 mr-2" />
              Save as Draft
            </Button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

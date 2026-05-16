'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, BookOpen, Hash, FileText, Type } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useSessionStore } from '@/store/useSessionStore';
import { useCreateBlog } from '@/lib/react-query/hooks';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';
import { blogTopicKeys, blogTopicValues, supportedLanguages, type BlogTopicKey } from '@/i18n/config';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <PageSkeleton variant="embed" />
});

export default function CreateBlogPage() {
  const { status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const createBlogMutation = useCreateBlog();
  const isLoading = createBlogMutation.isPending;
  const [isDraft, setIsDraft] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    language: 'en',
  });
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Helper to check if content is empty (handles HTML tags)
  const isContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.topic || isContentEmpty(formData.content)) {
      const errorMsg = t('blog.fillAllFields');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
      return;
    }

    try {
      await createBlogMutation.mutateAsync({
        ...formData,
        isPublished: !isDraft,
      });
      router.push('/dashboard/teacher/blogs');
    } catch (err) {
      const errorMsg =
        err instanceof ApiClientError ? err.message : t('blog.saveErrorGeneric');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    }
  };

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
          {t('blog.backToBlogs')}
        </Link>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('createBlogPage.title')}</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('createBlogPage.description')}</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
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
              {t('createBlogPage.blogTitle')}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={t('createBlogPage.titlePlaceholder')}
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
              maxLength={200}
            />
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              {t('createBlogPage.charactersCount', { count: formData.title.length, max: 200 })}
            </p>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              {t('createBlogPage.topic')}
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
            >
              <option value="">{t('createBlogPage.selectTopic')}</option>
              {blogTopicKeys.map((topic) => (
                <option key={topic} value={blogTopicValues[topic]}>
                  {t(`topics.${topic}` as `topics.${BlogTopicKey}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              {t('createBlogPage.language')}
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
            >
              {supportedLanguages.map((language) => (
                <option key={language} value={language}>
                  {t(language === 'en' ? 'common.english' : 'common.hindi')}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              {t('createBlogPage.content')}
            </label>
            <Suspense fallback={<PageSkeleton variant="embed" />}>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder={t('createBlogPage.contentPlaceholder')}
                theme="emerald"
              />
            </Suspense>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => setIsDraft(false)}
              isLoading={isLoading && !isDraft}
              className="flex-1"
            >
              <Eye className="w-5 h-5 mr-2" />
              {t('createBlogPage.publish')}
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => setIsDraft(true)}
              isLoading={isLoading && isDraft}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <EyeOff className="w-5 h-5 mr-2" />
              {t('createBlogPage.saveDraft')}
            </Button>
          </div>
        </div>
      </motion.form>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-[var(--success-light)] rounded-xl p-4"
      >
        <h4 className="font-semibold text-[var(--success)] mb-2 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          {t('createBlogPage.tipsTitle')}
        </h4>
        <ul className="text-sm text-[var(--success)] space-y-1">
          <li>{t('createBlogPage.tipTitle')}</li>
          <li>{t('createBlogPage.tipSections')}</li>
          <li>{t('createBlogPage.tipLists')}</li>
          <li>{t('createBlogPage.tipLinks')}</li>
          <li>{t('createBlogPage.tipProofread')}</li>
        </ul>
      </motion.div>
    </div>
  );
}

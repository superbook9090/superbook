'use client';
import { ROUTES } from '@/constants/routes';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useCreateBlog } from '@/lib/react-query/useBlogQueries';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';
import { isBlogContentEmpty, type BlogFormData } from '@/features/blogs/components/BlogEditorForm';
import { LazyBlogEditorForm } from '@/lib/lazy';

export default function CreateBlogPage() {
  const { status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const createBlogMutation = useCreateBlog();
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    topic: '',
    content: '',
    language: 'en',
  });
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (status === 'unauthenticated') {
    router.push(ROUTES.login);
    return null;
  }

  const submit = async (asDraft: boolean) => {
    setError('');

    if (!formData.title.trim() || !formData.topic || isBlogContentEmpty(formData.content)) {
      const errorMsg = t('blog.fillAllFields');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
      return;
    }

    try {
      await createBlogMutation.mutateAsync({
        ...formData,
        isPublished: !asDraft,
      });
      router.push(ROUTES.teacher.blogs);
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.saveErrorGeneric');
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {alertState && (
        <Alert type={alertState.type} message={alertState.message} onClose={() => setAlertState(null)} />
      )}

      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <Link
          href={ROUTES.teacher.blogs}
          className="inline-flex items-center text-sm text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mb-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          {t('blog.backToBlogs')}
        </Link>
        <h1 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">{t('createBlogPage.title')}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{t('createBlogPage.description')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <LazyBlogEditorForm
          formData={formData}
          onChange={setFormData}
          error={error}
          isSaving={createBlogMutation.isPending}
          onPublish={() => submit(false)}
          onSaveDraft={() => submit(true)}
          publishLabel={t('createBlogPage.publish')}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-4 bg-[var(--success-light)] rounded-lg p-3"
      >
        <h4 className="text-sm font-semibold text-[var(--success)] mb-1.5 flex items-center">
          <BookOpen className="w-3.5 h-3.5 mr-1.5" />
          {t('createBlogPage.tipsTitle')}
        </h4>
        <ul className="text-xs text-[var(--success)] space-y-0.5">
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

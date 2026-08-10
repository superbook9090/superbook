'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import BackButton from '@/components/ui/BackButton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { getBlogById, updateBlog, type BlogDocument } from '@/lib/api/blogs';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';
import { isBlogContentEmpty, type BlogFormData } from '@/features/blogs/components/BlogEditorForm';
import { LazyBlogEditorForm } from '@/lib/lazy';

export default function EditBlogPage() {
  const { status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    topic: '',
    content: '',
    language: 'en',
    visibility: 'organization',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
  });
  const [isPublished, setIsPublished] = useState(true);
  const { addAlert } = useAlert();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
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
        language: blog.language || 'en',
        visibility: blog.visibility || 'organization',
        metaTitle: blog.metaTitle || '',
        metaDescription: blog.metaDescription || '',
        isFeatured: Boolean(blog.isFeatured),
      });
      setIsPublished(blog.isPublished);
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.failedToLoadBlog');
      addAlert({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async (saveAsDraft: boolean) => {
    setIsSaving(true);

    if (!formData.title.trim() || !formData.topic || isBlogContentEmpty(formData.content)) {
      addAlert({ type: 'error', message: t('blog.fillAllFields') });
      setIsSaving(false);
      return;
    }

    try {
      await updateBlog(blogId, {
        title: formData.title,
        topic: formData.topic,
        content: formData.content,
        language: formData.language,
        visibility: formData.visibility,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        isFeatured: formData.isFeatured,
        isPublished: !saveAsDraft,
      });
      router.push(ROUTES.teacher.blogs);
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.saveErrorGeneric');
      addAlert({ type: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-[var(--color-surface-muted)] border-t-[var(--teacher-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <BackButton
          href={ROUTES.teacher.blogs}
          label={t('blog.backToBlogs')}
          className="text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mb-3"
        />
        <h1 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">{t('editBlogPage.title')}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{t('editBlogPage.description')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <LazyBlogEditorForm
          formData={formData}
          onChange={setFormData}
          isSaving={isSaving}
          onPublish={() => submit(false)}
          onSaveDraft={() => submit(true)}
          publishLabel={
            isPublished ? t('editBlogPage.updateAndPublish') : t('editBlogPage.publish')
          }
        />
      </motion.div>
    </div>
  );
}

'use client';
import { ROUTES } from '@/constants/routes';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { useCreateBlog } from '@/lib/react-query/useBlogQueries';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';
import { isBlogContentEmpty, type BlogFormData } from '@/features/blogs/components/BlogEditorForm';
import { LazyBlogEditorForm } from '@/lib/lazy';
import { isAdmin, isStaffRole } from '@/lib/roles';
import { PageWrapper } from '@/components/layout';

export default function CreateBlogPage() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const router = useRouter();
  const createBlogMutation = useCreateBlog();
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
  const { addAlert } = useAlert();

  if (status === 'unauthenticated') {
    router.push(ROUTES.login);
    return null;
  }

  if (status === 'authenticated' && !isStaffRole(session?.user?.role)) {
    router.push(ROUTES.student.root);
    return null;
  }

  const isUserAdmin = isAdmin(session?.user?.role);
  const blogsHome = isUserAdmin ? ROUTES.admin.blogs : ROUTES.teacher.blogs;

  const submit = async (asDraft: boolean) => {
    if (!formData.title.trim() || !formData.topic || isBlogContentEmpty(formData.content)) {
      addAlert({ type: 'error', message: t('blog.fillAllFields') });
      return;
    }

    try {
      await createBlogMutation.mutateAsync({
        ...formData,
        isPublished: !asDraft,
      });
      router.push(blogsHome);
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.saveErrorGeneric');
      addAlert({ type: 'error', message: errorMsg });
    }
  };

  return (
    <PageWrapper className="max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <BackButton
          href={blogsHome}
          label={t('blog.backToBlogs')}
          className="text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mb-3"
        />
        <h1 className="heading-xl text-[var(--color-foreground)]">{t('createBlogPage.title')}</h1>
        <p className="text-sm text-[var(--color-muted-foreground)] mt-0.5">{t('createBlogPage.description')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <LazyBlogEditorForm
          formData={formData}
          onChange={setFormData}
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
        className="card-surface antigravity-glass rounded-2xl p-4 border border-[var(--teacher-border)] bg-[var(--teacher-soft)]/30"
      >
        <h4 className="text-sm font-bold text-[var(--teacher-primary)] mb-2 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          {t('createBlogPage.tipsTitle')}
        </h4>
        <ul className="text-xs text-[var(--color-muted-foreground)] space-y-1 pl-6 list-disc">
          <li>{t('createBlogPage.tipTitle')}</li>
          <li>{t('createBlogPage.tipSections')}</li>
          <li>{t('createBlogPage.tipLists')}</li>
          <li>{t('createBlogPage.tipLinks')}</li>
          <li>{t('createBlogPage.tipProofread')}</li>
        </ul>
      </motion.div>
    </PageWrapper>
  );
}

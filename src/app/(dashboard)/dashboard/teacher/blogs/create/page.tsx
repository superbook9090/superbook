'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, PenTool } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { useCreateBlog } from '@/lib/react-query/useBlogQueries';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';
import { isBlogContentEmpty, type BlogFormData } from '@/features/blogs/components/BlogEditorForm';
import { LazyBlogEditorForm } from '@/lib/lazy';
import { isAdmin, isStaffRole } from '@/lib/roles';
import { PageWrapper } from '@/components/layout';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';

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
    slug: '',
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
        slug: formData.slug?.trim() || undefined,
        isPublished: !asDraft,
      });
      router.push(blogsHome);
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.saveErrorGeneric');
      addAlert({ type: 'error', message: errorMsg });
    }
  };

  return (
    <PageWrapper className="max-w-4xl mx-auto w-full">
      <TeacherPageBanner
        icon={PenTool}
        eyebrow={t('common.blogs')}
        title={t('createBlogPage.title')}
        description={t('createBlogPage.description')}
        backHref={blogsHome}
        backLabel={t('blog.backToBlogs')}
      />

      <LazyBlogEditorForm
        formData={formData}
        onChange={setFormData}
        isSaving={createBlogMutation.isPending}
        onPublish={() => submit(false)}
        onSaveDraft={() => submit(true)}
        publishLabel={t('createBlogPage.publish')}
      />

      <div className="teacher-panel p-4 sm:p-5 border-[var(--teacher-border)] bg-[var(--teacher-soft)]/35">
        <h4 className="text-sm font-bold text-[var(--teacher-primary)] mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 shrink-0" />
          <span>{t('createBlogPage.tipsTitle')}</span>
        </h4>
        <ul className="text-xs text-[var(--color-muted-foreground)] space-y-1 pl-5 list-disc leading-relaxed">
          <li>{t('createBlogPage.tipTitle')}</li>
          <li>{t('createBlogPage.tipSections')}</li>
          <li>{t('createBlogPage.tipLists')}</li>
          <li>{t('createBlogPage.tipLinks')}</li>
          <li>{t('createBlogPage.tipProofread')}</li>
        </ul>
      </div>
    </PageWrapper>
  );
}

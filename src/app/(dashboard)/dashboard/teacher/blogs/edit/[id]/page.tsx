'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PenTool } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { getBlogById, updateBlog, type BlogDocument } from '@/lib/api/blogs';
import { ApiClientError } from '@/lib/api/http';
import { useTranslation } from '@/hooks/useTranslation';
import { isBlogContentEmpty, type BlogFormData } from '@/features/blogs/components/BlogEditorForm';
import { LazyBlogEditorForm } from '@/lib/lazy';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { TeacherPageBanner } from '@/features/teacher/components/TeacherPageBanner';

export default function EditBlogPage() {
  const { session, status } = useSessionStore();
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
    slug: '',
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
      const role = session?.user?.role;
      const userId = session?.user?.id;
      const userOrgId = (session?.user as { organizationId?: string | null } | undefined)?.organizationId ?? null;
      const blogAuthorId =
        typeof blog.author === 'object' && blog.author !== null ? blog.author._id : undefined;
      const blogOrgId = blog.organizationId ? String(blog.organizationId) : null;

      const allowed =
        isSuperAdmin(role) ||
        Boolean(userId && blogAuthorId && blogAuthorId === userId) ||
        (role === 'admin' && Boolean(userOrgId && blogOrgId && blogOrgId === userOrgId));

      if (!allowed) {
        addAlert({ type: 'error', message: t('blog.failedToLoadBlog') });
        router.replace(blogsHome);
        return;
      }

      setFormData({
        title: blog.title,
        topic: blog.topic,
        content: blog.content,
        language: blog.language || 'en',
        visibility: blog.visibility || 'organization',
        slug: blog.slug || '',
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

  const isUserAdmin = isAdmin(session?.user?.role);
  const blogsHome = isUserAdmin ? ROUTES.admin.blogs : ROUTES.teacher.blogs;

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
        slug: formData.slug?.trim() || undefined,
        metaTitle: formData.metaTitle,
        metaDescription: formData.metaDescription,
        isFeatured: formData.isFeatured,
        isPublished: !saveAsDraft,
      });
      router.push(blogsHome);
    } catch (err) {
      const errorMsg = err instanceof ApiClientError ? err.message : t('blog.saveErrorGeneric');
      addAlert({ type: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <PageWrapper className="max-w-4xl mx-auto w-full">
      <TeacherPageBanner
        icon={PenTool}
        eyebrow={t('common.blogs')}
        title={t('editBlogPage.title')}
        description={t('editBlogPage.description')}
        backHref={blogsHome}
        backLabel={t('blog.backToBlogs')}
      />

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
    </PageWrapper>
  );
}

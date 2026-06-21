'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Eye, EyeOff, BookOpen, Hash, FileText, Type, Globe, Star } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EditorField, editorInputClass, editorSelectClass } from '@/components/ui/editor/EditorField';
import { useTranslation } from '@/hooks/useTranslation';
import { blogTopicKeys, blogTopicValues, supportedLanguages, type BlogTopicKey } from '@/i18n/config';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <PageSkeleton variant="embed" />,
});

export type BlogFormData = {
  title: string;
  topic: string;
  content: string;
  language: string;
  visibility: 'public' | 'organization';
  metaTitle: string;
  metaDescription: string;
  isFeatured: boolean;
};

type BlogEditorFormProps = {
  formData: BlogFormData;
  onChange: (data: BlogFormData) => void;
  error?: string;
  isSaving: boolean;
  onPublish: () => void;
  onSaveDraft: () => void;
  publishLabel: string;
  draftLabel?: string;
  showLanguage?: boolean;
};

export function isBlogContentEmpty(html: string) {
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
}

export default function BlogEditorForm({
  formData,
  onChange,
  error,
  isSaving,
  onPublish,
  onSaveDraft,
  publishLabel,
  draftLabel,
  showLanguage = true,
}: BlogEditorFormProps) {
  const { t } = useTranslation();

  const patch = (partial: Partial<BlogFormData>) => onChange({ ...formData, ...partial });

  return (
    <div className="bg-[var(--card-solid)] rounded-xl shadow-sm p-4 sm:p-5">
      {error && (
        <div className="mb-4 p-3 text-sm bg-[var(--error-light)] border border-[var(--error)]/20 rounded-lg text-[var(--error)]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <EditorField
          label={
            <>
              <Type className="w-3.5 h-3.5 inline mr-1.5" />
              {t('createBlogPage.blogTitle')}
            </>
          }
          hint={t('createBlogPage.charactersCount', { count: formData.title.length, max: 200 })}
        >
          <input
            type="text"
            value={formData.title}
            onChange={(e) => patch({ title: e.target.value })}
            placeholder={t('createBlogPage.titlePlaceholder')}
            className={editorInputClass}
            maxLength={200}
          />
        </EditorField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditorField
            label={
              <>
                <Hash className="w-3.5 h-3.5 inline mr-1.5" />
                {t('createBlogPage.topic')}
              </>
            }
          >
            <select
              value={formData.topic}
              onChange={(e) => patch({ topic: e.target.value })}
              className={editorSelectClass}
            >
              <option value="">{t('createBlogPage.selectTopic')}</option>
              {blogTopicKeys.map((topic) => (
                <option key={topic} value={blogTopicValues[topic]}>
                  {t(`topics.${topic}` as `topics.${BlogTopicKey}`)}
                </option>
              ))}
            </select>
          </EditorField>

          {showLanguage && (
            <EditorField
              label={
                <>
                  <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('createBlogPage.language')}
                </>
              }
            >
              <select
                value={formData.language}
                onChange={(e) => patch({ language: e.target.value })}
                className={editorSelectClass}
              >
                {supportedLanguages.map((language) => (
                  <option key={language} value={language}>
                    {t(language === 'en' ? 'common.english' : 'common.hindi')}
                  </option>
                ))}
              </select>
            </EditorField>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EditorField
            label={
              <>
                <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                Blog Visibility
              </>
            }
          >
            <select
              value={formData.visibility}
              onChange={(e) => patch({ visibility: e.target.value as 'public' | 'organization' })}
              className={editorSelectClass}
            >
              <option value="organization">Organization Blog</option>
              <option value="public">Public SEO Blog</option>
            </select>
          </EditorField>

          <EditorField
            label={
              <>
                <Star className="w-3.5 h-3.5 inline mr-1.5" />
                Featured
              </>
            }
          >
            <label className="flex min-h-[44px] items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--color-foreground)]">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => patch({ isFeatured: e.target.checked })}
                disabled={formData.visibility !== 'public'}
              />
              Mark as featured public article
            </label>
          </EditorField>
        </div>

        <EditorField
          label={
            <>
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              {t('createBlogPage.content')}
            </>
          }
        >
          <Suspense fallback={<PageSkeleton variant="embed" />}>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => patch({ content })}
              placeholder={t('createBlogPage.contentPlaceholder')}
              theme="teacher"
              variant="compact"
            />
          </Suspense>
        </EditorField>

        {formData.visibility === 'public' && (
          <div className="grid grid-cols-1 gap-4">
            <EditorField label="Meta Title">
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => patch({ metaTitle: e.target.value })}
                placeholder="SEO title for search and social sharing"
                className={editorInputClass}
                maxLength={70}
              />
            </EditorField>

            <EditorField label="Meta Description">
              <textarea
                value={formData.metaDescription}
                onChange={(e) => patch({ metaDescription: e.target.value })}
                placeholder="SEO description for search engines and social cards"
                className={editorInputClass}
                rows={3}
                maxLength={180}
              />
            </EditorField>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            disabled={isSaving}
            onClick={onPublish}
            isLoading={isSaving}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            {publishLabel}
          </Button>
          <Button
            type="button"
            disabled={isSaving}
            onClick={onSaveDraft}
            variant="secondary"
            className="flex-1 sm:flex-none"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            {draftLabel ?? t('createBlogPage.saveDraft')}
          </Button>
        </div>
      </div>
    </div>
  );
}

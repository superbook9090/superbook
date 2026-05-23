'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Eye, EyeOff, BookOpen, Hash, FileText, Type } from 'lucide-react';
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

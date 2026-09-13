'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Eye, EyeOff, BookOpen, Hash, FileText, Type, Globe, Star, Link2, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { EditorField } from '@/components/ui/editor/EditorField';
import { TextField } from '@/components/ui/TextField';
import { Dropdown } from '@/components/ui/Dropdown';
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
  slug?: string;
  metaTitle: string;
  metaDescription: string;
  isFeatured: boolean;
};

type BlogEditorFormProps = {
  formData: BlogFormData;
  onChange: (data: BlogFormData) => void;
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

function sanitizeSlugInput(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200);
}

export default function BlogEditorForm({
  formData,
  onChange,
  isSaving,
  onPublish,
  onSaveDraft,
  publishLabel,
  draftLabel,
  showLanguage = true,
}: BlogEditorFormProps) {
  const { t } = useTranslation();

  const patch = (partial: Partial<BlogFormData>) => onChange({ ...formData, ...partial });

  const previewSlug = formData.slug?.trim() || (formData.title.trim() ? sanitizeSlugInput(formData.title) : 'your-custom-url');

  return (
    <div className="bg-[var(--card-solid)] rounded-xl shadow-sm p-4 sm:p-5">
      <div className="space-y-4">
        <TextField
          label={
            <>
              <Type className="w-3.5 h-3.5 inline mr-1.5" />
              {t('createBlogPage.blogTitle')}
            </>
          }
          helperText={t('createBlogPage.charactersCount', { count: formData.title.length, max: 200 })}
          type="text"
          value={formData.title}
          onChange={(e) => patch({ title: e.target.value })}
          placeholder={t('createBlogPage.titlePlaceholder')}
          maxLength={200}
          fullWidth
        />

        {/* Custom URL (Slug) field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-[var(--color-foreground)] flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
              {t('createBlogPage.customUrl')}
              <span className="text-xs font-normal text-[var(--color-muted-foreground)]">
                ({t('common.optional') || 'Optional'})
              </span>
            </label>
            {formData.title.trim() && (
              <button
                type="button"
                onClick={() => patch({ slug: sanitizeSlugInput(formData.title) })}
                className="text-xs font-medium text-[var(--teacher-primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                {t('createBlogPage.generateSlugFromTitle')}
              </button>
            )}
          </div>

          <div className="relative flex items-center rounded-xl border border-[var(--border)] bg-[var(--color-surface)] focus-within:border-[var(--teacher-primary)] focus-within:ring-1 focus-within:ring-[var(--teacher-primary)] transition-all overflow-hidden">
            <span className="hidden sm:inline-flex items-center px-3 py-2 text-xs font-mono text-[var(--color-muted-foreground)] bg-[var(--color-surface-muted)] border-r border-[var(--border)] select-none whitespace-nowrap">
              quizdo.in/blog/
            </span>
            <input
              type="text"
              value={formData.slug || ''}
              onChange={(e) => patch({ slug: sanitizeSlugInput(e.target.value) })}
              placeholder={t('createBlogPage.customUrlPlaceholder')}
              maxLength={200}
              className="w-full px-3 py-2 text-sm text-[var(--color-foreground)] bg-transparent outline-none font-mono placeholder:font-sans placeholder:text-[var(--color-muted-foreground)]/60"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted-foreground)]">
            <p>{t('createBlogPage.customUrlHelper')}</p>
            <div className="flex items-center gap-1 font-mono text-[11px] text-[var(--teacher-primary)] bg-[var(--teacher-soft)] px-2 py-0.5 rounded-md truncate max-w-full">
              <span className="font-sans font-semibold">Preview:</span>
              <span className="truncate">/blog/{previewSlug}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dropdown
            searchable
            allowCustom
            searchPlaceholder={t('createBlogPage.searchTopic') || 'Search or enter custom topic...'}
            customLabelPrefix={t('createBlogPage.useCustomTopic') || 'Use custom'}
            label={
              <>
                <Hash className="w-3.5 h-3.5 inline mr-1.5" />
                {t('createBlogPage.topic')}
              </>
            }
            value={formData.topic}
            onChange={(val) => patch({ topic: val })}
            options={blogTopicKeys.map((topic) => ({
              value: blogTopicValues[topic],
              label: t(`topics.${topic}` as `topics.${BlogTopicKey}`),
            }))}
            placeholder={t('createBlogPage.selectTopic')}
          />

          {showLanguage && (
            <Dropdown
              label={
                <>
                  <BookOpen className="w-3.5 h-3.5 inline mr-1.5" />
                  {t('createBlogPage.language')}
                </>
              }
              value={formData.language}
              onChange={(val) => patch({ language: val })}
              options={supportedLanguages.map((language) => ({
                value: language,
                label: t(language === 'en' ? 'common.english' : 'common.hindi'),
              }))}
              placeholder=""
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Dropdown
            label={
              <>
                <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                Blog Visibility
              </>
            }
            value={formData.visibility}
            onChange={(val) => patch({ visibility: val as 'public' | 'organization' })}
            options={[
              { value: 'organization', label: 'Organization Blog' },
              { value: 'public', label: 'Public SEO Blog' },
            ]}
            placeholder=""
          />

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
            <TextField
              label="Meta Title"
              type="text"
              value={formData.metaTitle}
              onChange={(e) => patch({ metaTitle: e.target.value })}
              placeholder="SEO title for search and social sharing"
              maxLength={70}
              fullWidth
            />

            <TextField
              label="Meta Description"
              multiline
              value={formData.metaDescription}
              onChange={(e) => patch({ metaDescription: e.target.value })}
              placeholder="SEO description for search engines and social cards"
              rows={3}
              maxLength={180}
              fullWidth
            />
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

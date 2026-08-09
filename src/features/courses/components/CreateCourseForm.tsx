'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useAlert } from '@/components/ui/AlertContainer';
import { createCourse, getCourseById, patchCourse } from '@/lib/api/courses';
import { fetchAccountInfo } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';
import { supportedLanguages } from '@/i18n/config';
import { useSessionStore } from '@/store/useSessionStore';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { generateInviteCode } from '@/lib/inviteCode';
import { Copy, RefreshCw, Lock } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import { Dropdown } from '@/components/ui/Dropdown';

type Props = {
  /** When set, form loads this course and PATCHes on submit. */
  courseId?: string;
};

export default function CreateCourseForm({ courseId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const queryClient = useQueryClient();
  const session = useSessionStore((s) => s.session);
  const { addAlert } = useAlert();
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';

  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!courseId);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    locale: 'en' as 'en' | 'hi',
    thumbnail: '',
    isPublished: true,
    isPrivateAccess: false,
    courseCode: '',
  });
  const [copied, setCopied] = useState(false);
  /** True when this teacher may only create private (course-code) courses. */
  const [privateOnly, setPrivateOnly] = useState(false);
  const [blockedNotice, setBlockedNotice] = useState(false);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setInitialLoading(true);
    try {
      const data = await getCourseById(courseId);
      const loc = data.locale ?? data.language ?? 'en';
      setFormData({
        title: data.title ?? '',
        description: data.description ?? '',
        price: String(data.price ?? 0),
        category: data.category ?? '',
        locale: loc === 'hi' ? 'hi' : 'en',
        thumbnail: data.thumbnail ?? '',
        isPublished: !!data.isPublished,
        isPrivateAccess: !!data.courseCode,
        courseCode: data.courseCode ?? '',
      });
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : t('createCourseForm.loadError');
      addAlert({
        type: 'error',
        message: message || t('createCourseForm.loadError'),
        duration: 5000,
      });
    } finally {
      setInitialLoading(false);
    }
  }, [courseId, t, addAlert]);

  useEffect(() => {
    if (courseId) {
      void loadCourse();
    }
  }, [courseId, loadCourse]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const account = await fetchAccountInfo();
        if (!cancelled) setPrivateOnly(account.canCreatePublicCourses === false);
      } catch {
        // Leave the toggle usable; the API rejects public courses regardless.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Runs again once an edited course has loaded, so loadCourse cannot re-open access.
  useEffect(() => {
    if (!privateOnly || initialLoading) return;
    setFormData((prev) =>
      prev.isPrivateAccess && prev.courseCode
        ? prev
        : {
            ...prev,
            isPrivateAccess: true,
            courseCode: prev.courseCode || generateInviteCode(8),
          }
    );
  }, [privateOnly, initialLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const invalidateCourseLists = () => {
    queryClient.invalidateQueries({ queryKey: ['courses', orgId, 'teacher'] });
    queryClient.invalidateQueries({ queryKey: ['courses', orgId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (privateOnly && !formData.isPrivateAccess) {
      setBlockedNotice(true);
      addAlert({
        type: 'error',
        message: t('createCourseForm.publicCourseNotAllowed'),
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    if (formData.isPrivateAccess && formData.courseCode.trim().length < 4) {
      addAlert({
        type: 'error',
        message: t('createCourseForm.courseCodePlaceholder'),
        duration: 5000,
      });
      setIsLoading(false);
      return;
    }

    const body = {
      title: formData.title,
      description: formData.description,
      price: Number(formData.price) || 0,
      category: formData.category,
      locale: formData.locale,
      thumbnail: formData.thumbnail,
      isPublished: formData.isPublished,
      courseCode: formData.isPrivateAccess
        ? formData.courseCode.trim().toUpperCase() || null
        : null,
    };

    try {
      if (courseId) {
        await patchCourse(courseId, body);
        invalidateCourseLists();
        addAlert({
          type: 'success',
          message: t('createCourseForm.updateSuccess'),
          duration: 3000,
        });
        router.push(ROUTES.teacher.courses);
      } else {
        await createCourse(body);
        invalidateCourseLists();
        addAlert({
          type: 'success',
          message: t('createCourseForm.createSuccess'),
          duration: 3000,
        });
        router.push(ROUTES.teacher.courses);
      }
    } catch (err) {
      const message =
        err instanceof ApiClientError
          ? err.message
          : err instanceof Error
            ? err.message
            : courseId
              ? t('createCourseForm.updateFailed')
              : t('createCourseForm.errorOccurred');
      addAlert({
        type: 'error',
        message,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({
      ...prev,
      isPrivateAccess: true,
      courseCode: generateInviteCode(8),
    }));
  };

  const handleCopyCode = async () => {
    if (!formData.courseCode) return;
    try {
      await navigator.clipboard.writeText(formData.courseCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  if (initialLoading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--color-muted-foreground)]" role="status">
        {t('common.loading')}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      <TextField
        label={t('createCourseForm.courseTitle')}
        type="text"
        name="title"
        id="title"
        required
        value={formData.title}
        onChange={handleChange}
        placeholder={t('createCourseForm.enterCourseTitle')}
        fullWidth
      />

      <TextField
        label={t('createCourseForm.description')}
        multiline
        name="description"
        id="description"
        rows={4}
        value={formData.description}
        onChange={handleChange}
        placeholder={t('createCourseForm.enterCourseDescription')}
        fullWidth
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <TextField
          label={t('createCourseForm.price')}
          type="number"
          name="price"
          id="price"
          min="0"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder={t('createCourseForm.pricePlaceholder')}
          fullWidth
        />

        <TextField
          label={t('createCourseForm.category')}
          type="text"
          name="category"
          id="category"
          value={formData.category}
          onChange={handleChange}
          placeholder={t('createCourseForm.categoryPlaceholder')}
          fullWidth
        />

        <Dropdown
          label={t('createCourseForm.language')}
          name="locale"
          id="locale"
          value={formData.locale}
          onChange={(val) => setFormData((prev) => ({ ...prev, locale: val as 'en' | 'hi' }))}
          options={supportedLanguages.map((language) => ({
            value: language,
            label: t(language === 'en' ? 'common.english' : 'common.hindi'),
          }))}
          placeholder=""
        />
      </div>

      <ImageUpload
        label={t('createCourseForm.thumbnailUrl')}
        value={formData.thumbnail}
        onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
        aspectRatio="video"
      />

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/30 p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            <Lock className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="flex items-center py-1"
              onClick={privateOnly ? () => setBlockedNotice(true) : undefined}
            >
              {/* Wrapper catches the click: a disabled input fires no events of its own. */}
              <span className={privateOnly ? 'inline-flex cursor-not-allowed' : 'inline-flex'}>
                <input
                  type="checkbox"
                  id="isPrivateAccess"
                  checked={formData.isPrivateAccess}
                  disabled={privateOnly}
                  aria-describedby={privateOnly ? 'privateAccessLocked' : undefined}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData((prev) => ({
                      ...prev,
                      isPrivateAccess: checked,
                      courseCode: checked && !prev.courseCode ? generateInviteCode(8) : prev.courseCode,
                    }));
                  }}
                  className={`h-5 w-5 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)] ${
                    privateOnly ? 'pointer-events-none opacity-70' : ''
                  }`}
                />
              </span>
              <label
                htmlFor="isPrivateAccess"
                className={`ml-3 text-sm font-medium text-[var(--color-foreground)] ${
                  privateOnly ? 'cursor-not-allowed' : ''
                }`}
              >
                {t('createCourseForm.privateAccess')}
              </label>
            </div>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              {t('createCourseForm.privateAccessDesc')}
            </p>
            {privateOnly && (
              <p
                id="privateAccessLocked"
                role="note"
                aria-live="polite"
                className={`mt-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                  blockedNotice
                    ? 'border-[var(--color-error)] bg-[var(--color-error-light)] text-[var(--color-error)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/60 text-[var(--color-muted-foreground)]'
                }`}
              >
                {t('createCourseForm.publicCourseNotAllowed')}
              </p>
            )}
          </div>
        </div>

        {formData.isPrivateAccess && (
          <div className="space-y-1.5 w-full">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <TextField
                label={t('createCourseForm.courseCode')}
                type="text"
                name="courseCode"
                id="courseCode"
                value={formData.courseCode}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    courseCode: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''),
                  }))
                }
                maxLength={12}
                required={formData.isPrivateAccess}
                className="font-mono uppercase tracking-widest"
                placeholder={t('createCourseForm.courseCodePlaceholder')}
                containerClassName="flex-1"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]"
                >
                  <RefreshCw className="h-4 w-4" />
                  {t('createCourseForm.generateCode')}
                </button>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  disabled={!formData.courseCode}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] px-3 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? t('createCourseForm.codeCopied') : t('createCourseForm.copyCode')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center py-2">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-5 w-5 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded cursor-pointer"
        />
        <label htmlFor="isPublished" className="ml-3 block text-base sm:text-sm text-[var(--color-foreground)] cursor-pointer">
          {t('createCourseForm.publishImmediately')}
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => router.push(ROUTES.teacher.courses)}
          className="px-4 py-3 sm:py-2 border border-[var(--color-border)] rounded-lg shadow-sm text-sm font-medium text-[var(--color-foreground)] bg-[var(--card-solid)] hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] touch-manipulation"
        >
          {t('createCourseForm.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={`px-4 py-3 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation`}
        >
          {isLoading
            ? courseId
              ? t('createCourseForm.saving')
              : t('createCourseForm.creating')
            : courseId
              ? t('createCourseForm.saveChanges')
              : t('createCourseForm.createCourse')}
        </button>
      </div>
    </form>
  );
}

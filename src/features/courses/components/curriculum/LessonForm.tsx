'use client';

import React, { useState, useEffect } from 'react';
import { X, Video, Clock, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useLesson, type Lesson } from '@/lib/react-query/hooks';
import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { EditorField, editorInputClass } from '@/components/ui/editor/EditorField';
import { EditorSection } from '@/components/ui/editor/EditorSection';
import { useSessionStore } from '@/store/useSessionStore';
import { cn } from '@/lib/utils';
import { LessonVideoUploader } from './LessonVideoUploader';
import { LessonResourcesSection } from './LessonResourcesSection';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <PageSkeleton variant="embed" />,
});

export interface LessonFormProps {
  lesson: Lesson | null;
  chapterId?: string;
  onClose: () => void;
  onSave: (data: Partial<Lesson>) => void;
  isSaving: boolean;
}

export function LessonForm({ lesson, onClose, onSave, isSaving }: LessonFormProps) {
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const { data: fullLesson, isLoading: loadingLesson } = useLesson(lesson?._id ?? '');

  const canUpload =
    session?.user?.canUploadVideos ||
    session?.user?.role === 'superadmin' ||
    session?.user?.role === 'admin';

  const [title, setTitle] = useState(lesson?.title || '');
  const [description, setDescription] = useState(lesson?.description || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
  const [youtubeVideoId, setYoutubeVideoId] = useState(lesson?.youtubeVideoId || '');
  const [videoEmbedUrl, setVideoEmbedUrl] = useState(lesson?.videoEmbedUrl || '');
  const [thumbnail, setThumbnail] = useState(lesson?.thumbnail || '');
  const [duration, setDuration] = useState(lesson?.duration || 0);
  const [content, setContent] = useState(lesson?.content || '');
  const [notesPdf, setNotesPdf] = useState(lesson?.notesPdf || '');
  const [isPreview, setIsPreview] = useState(lesson?.isPreview || false);
  const [attachments, setAttachments] = useState<string[]>(lesson?.attachments || []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!fullLesson) return;
    setTitle(fullLesson.title || '');
    setDescription(fullLesson.description || '');
    setVideoUrl(fullLesson.videoUrl || '');
    setYoutubeVideoId(fullLesson.youtubeVideoId || '');
    setVideoEmbedUrl(fullLesson.videoEmbedUrl || '');
    setThumbnail(fullLesson.thumbnail || '');
    setDuration(fullLesson.duration || 0);
    setContent(fullLesson.content || '');
    setNotesPdf(fullLesson.notesPdf || '');
    setIsPreview(fullLesson.isPreview || false);
    setAttachments(fullLesson.attachments || []);
  }, [fullLesson]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        className="w-full max-w-3xl h-screen bg-[var(--card-solid)] shadow-2xl flex flex-col"
      >
        <div className="px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {lesson ? t('curriculum.editLesson') : t('curriculum.addNewLesson')}
          </h3>
          <Tooltip label={t('common.close')}>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('common.close')}
              className="p-1.5 hover:bg-[var(--color-surface-muted)] rounded-full transition-colors text-[var(--color-foreground)]"
            >
              <X className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {loadingLesson && lesson ? (
            <PageSkeleton variant="embed" />
          ) : (
            <>
              <EditorField label={t('curriculum.lessonTitle')}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={editorInputClass}
                  placeholder={t('curriculum.lessonTitlePlaceholder')}
                />
              </EditorField>
              <EditorField label={t('curriculum.lessonDescription')}>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={cn(editorInputClass, 'min-h-[72px] resize-y')}
                  placeholder={t('curriculum.lessonDescriptionPlaceholder')}
                />
              </EditorField>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[var(--color-foreground)]">
                    {t('curriculum.videoUrl')} (External link)
                  </label>
                  <div className="relative">
                    <Video className="absolute left-3 top-3.5 w-5 h-5 text-[var(--color-muted)]" />
                    <input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-foreground)] outline-none"
                      placeholder="YouTube/Vimeo link"
                    />
                  </div>
                </div>
                <EditorField label={`${t('curriculum.duration')} (${t('curriculum.minutes')})`}>
                  <div className="relative">
                    <Clock className="absolute left-2.5 top-2.5 w-4 h-4 text-[var(--color-muted)]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={duration > 0 ? String(duration) : ''}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '');
                        setDuration(digits === '' ? 0 : parseInt(digits, 10));
                      }}
                      className={cn(editorInputClass, 'pl-9')}
                      placeholder="0"
                    />
                  </div>
                </EditorField>
              </div>

              {canUpload && (
                <LessonVideoUploader
                  title={title}
                  youtubeVideoId={youtubeVideoId}
                  thumbnail={thumbnail}
                  uploading={uploading}
                  setUploading={setUploading}
                  onVideoChange={(result) => {
                    setYoutubeVideoId(result.youtubeVideoId);
                    setVideoEmbedUrl(result.videoEmbedUrl);
                    setThumbnail(result.thumbnail);
                  }}
                  onRemoveVideo={() => {
                    setYoutubeVideoId('');
                    setVideoEmbedUrl('');
                    setThumbnail('');
                  }}
                />
              )}

              <LessonResourcesSection
                notesPdf={notesPdf}
                setNotesPdf={setNotesPdf}
                attachments={attachments}
                setAttachments={setAttachments}
              />

              <label className="flex items-center gap-2 px-1 cursor-pointer">
                <input
                  type="checkbox"
                  id="isPreview"
                  checked={isPreview}
                  onChange={(e) => setIsPreview(e.target.checked)}
                  className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)]"
                />
                <span className="text-xs sm:text-sm font-medium text-[var(--color-foreground)]">
                  {t('curriculum.freePreview')}
                </span>
              </label>

              <EditorSection title={t('curriculum.lessonContent')} defaultOpen>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  variant="compact"
                  minHeight={180}
                />
              </EditorSection>
            </>
          )}
        </div>

        <div className="px-4 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] flex justify-end gap-2 shrink-0">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={() =>
              onSave({
                title,
                description,
                videoUrl,
                duration,
                content,
                youtubeVideoId,
                videoEmbedUrl,
                thumbnail,
                notesPdf,
                attachments,
                isPreview,
              })
            }
            disabled={!title || isSaving || uploading}
            className="px-8"
          >
            {isSaving ? <X className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {t('common.save')}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

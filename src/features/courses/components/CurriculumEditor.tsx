'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Trash2, X, Video, Clock, Save, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useAddLesson, useUpdateLesson, useLesson, type Lesson } from '@/lib/react-query/hooks';
import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/Skeleton';

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <PageSkeleton variant="embed" />,
});

const CurriculumTreeEditor = dynamic(() => import('./curriculum/CurriculumTreeEditor'), {
  loading: () => <PageSkeleton variant="embed" />,
});
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { EditorField, editorInputClass } from '@/components/ui/editor/EditorField';
import { EditorSection } from '@/components/ui/editor/EditorSection';
import { useSessionStore } from '@/store/useSessionStore';
import { cn } from '@/lib/utils';
interface CurriculumEditorProps {
  courseId: string;
}

interface LessonFormProps {
  lesson: Lesson | null;
  chapterId?: string;
  onClose: () => void;
  onSave: (data: Partial<Lesson>) => void;
  isSaving: boolean;
}

export default function CurriculumEditor({ courseId }: CurriculumEditorProps) {
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState<{ chapterId: string } | null>(null);
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();

  return (
    <>
      <CurriculumTreeEditor
        courseId={courseId}
        onEditLesson={setEditingLesson}
        onAddLesson={(chapterId) => setIsAddingLesson({ chapterId })}
      />

      {(editingLesson || isAddingLesson) && (
        <LessonForm
          key={editingLesson?._id ?? isAddingLesson?.chapterId ?? 'new'}
          lesson={editingLesson}
          chapterId={isAddingLesson?.chapterId}
          onClose={() => {
            setEditingLesson(null);
            setIsAddingLesson(null);
          }}
          onSave={(data: Partial<Lesson>) => {
            if (editingLesson) {
              updateLesson.mutate({ lessonId: editingLesson._id, data });
            } else if (isAddingLesson) {
              addLesson.mutate({ chapterId: isAddingLesson.chapterId, data });
            }
            setEditingLesson(null);
            setIsAddingLesson(null);
          }}
          isSaving={updateLesson.isPending || addLesson.isPending}
        />
      )}
    </>
  );
}

function LessonForm({ lesson, onClose, onSave, isSaving }: LessonFormProps) {
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
  const [attachmentInput, setAttachmentInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side size validation (2GB)
    if (file.size > 2 * 1024 * 1024 * 1024) {
      setUploadError(t('curriculum.formatSizeHint') || 'File too large (max 2GB)');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    // Bypass Next.js buggy multipart/form-data parser by sending raw binary data
    const queryTitle = encodeURIComponent(title || 'Lecture Video');

    try {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      });

      const promise = new Promise<{ youtubeVideoId: string; videoEmbedUrl: string; thumbnail: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText);
              resolve(res);
            } catch {
              reject(new Error('Invalid upload response'));
            }
          } else {
            try {
              const res = JSON.parse(xhr.responseText);
              reject(new Error(res.message || 'Upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `/api/video/upload?title=${queryTitle}`);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);

      const result = await promise;
      setYoutubeVideoId(result.youtubeVideoId);
      setVideoEmbedUrl(result.videoEmbedUrl);
      setThumbnail(result.thumbnail);
    } catch (err: unknown) {
      if (err instanceof Error && (err.name === 'AbortError' || err.message === 'Upload cancelled')) {
        setUploadError(null);
      } else {
        setUploadError(err instanceof Error ? err.message : t('curriculum.uploadFailed'));
      }
    } finally {
      setUploading(false);
      xhrRef.current = null;
    }
  };

  const handleCancelUpload = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setUploadError(null);
      setUploading(false);
      setUploadProgress(0);
    }
  };

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
            <button type="button" onClick={onClose} aria-label={t('common.close')} className="p-1.5 hover:bg-[var(--color-surface-muted)] rounded-full transition-colors text-[var(--color-foreground)]">
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
              <label className="text-sm font-semibold text-[var(--color-foreground)]">{t('curriculum.videoUrl')} (External link)</label>
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

          {/* Centralized YouTube Upload Dropzone */}
          {canUpload && (
            <div className="space-y-3 p-4 bg-[var(--color-surface-muted)]/30 rounded-2xl border border-[var(--color-border)]">
              <label className="text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[var(--color-primary)]" />
                Centralized YouTube Video Lecture (Unlisted)
              </label>
              
              {youtubeVideoId ? (
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border border-[var(--color-border)] max-w-md">
                    {thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-[var(--color-muted-foreground)]">YouTube Video Connected</span>
                    )}
                    <div className="absolute top-2 right-2 bg-black/75 text-white text-xs px-2 py-0.5 rounded font-mono">
                      ID: {youtubeVideoId}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setYoutubeVideoId('');
                      setVideoEmbedUrl('');
                      setThumbnail('');
                    }}
                    className="text-xs text-[var(--color-error)] hover:underline font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Video Lecture
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-[var(--color-border)] rounded-xl p-6 text-center hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5 transition-all relative">
                    {!uploading && (
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    )}
                    <div className="flex flex-col items-center justify-center">
                      <UploadCloud className="w-10 h-10 text-[var(--color-muted)] mb-2" />
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {uploading ? t('curriculum.uploadingFile') : t('curriculum.dragDropVideo')}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                        {t('curriculum.formatSizeHint')}
                      </p>
                    </div>
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="w-full bg-[var(--color-surface-muted)] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[var(--color-primary)] h-full transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--color-muted-foreground)]">
                          {uploadProgress === 100 ? t('curriculum.processingVideo') : t('curriculum.uploadProgress')}
                        </span>
                        <span className="font-medium text-[var(--color-foreground)]">{uploadProgress}%</span>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleCancelUpload}
                          className="text-xs font-semibold text-[var(--color-error)] hover:underline"
                        >
                          {t('curriculum.cancelUpload')}
                        </button>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xs text-[var(--color-error)] font-medium text-center">
                        {uploadError}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <EditorSection title={t('curriculum.sectionResources')} defaultOpen={false}>
            <EditorField label={t('curriculum.notesPdf')}>
              <input
                value={notesPdf}
                onChange={(e) => setNotesPdf(e.target.value)}
                className={editorInputClass}
                placeholder="https://example.com/notes.pdf"
              />
            </EditorField>
            <EditorField label={t('curriculum.attachments')}>
              <div className="flex gap-2">
                <input
                  value={attachmentInput}
                  onChange={(e) => setAttachmentInput(e.target.value)}
                  className={cn(editorInputClass, 'flex-1')}
                  placeholder={t('curriculum.attachmentPlaceholder')}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (attachmentInput.trim()) {
                      setAttachments([...attachments, attachmentInput.trim()]);
                      setAttachmentInput('');
                    }
                  }}
                  className="px-3 py-2 text-sm bg-[var(--color-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity shrink-0"
                >
                  {t('common.add')}
                </button>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-2">
                  {attachments.map((url, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[var(--color-surface-muted)]/30 border border-[var(--color-border)] p-2 rounded-lg text-xs">
                      <span className="truncate flex-1 pr-3 text-[var(--color-foreground)]">{url}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                        className="text-[var(--color-error)] hover:underline font-semibold shrink-0"
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </EditorField>
          </EditorSection>

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
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button 
            onClick={() => onSave({ 
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
              isPreview 
            })}
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

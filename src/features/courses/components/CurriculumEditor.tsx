'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Pencil, 
  GripVertical, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  FileText, 
  Clock,
  PlusCircle,
  Save,
  X,
  Check,
  UploadCloud
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  useCourseCurriculum, 
  useAddChapter, 
  useUpdateChapter, 
  useDeleteChapter,
  useAddLesson,
  useUpdateLesson,
  useDeleteLesson,
  Chapter,
  Lesson
} from '@/lib/react-query/hooks';
import ConfirmModal from '@/components/ui/ConfirmModal';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Button from '@/components/ui/Button';
import { useSessionStore } from '@/store/useSessionStore';

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
  const { t } = useTranslation();
  const { data: chapters = [], isLoading } = useCourseCurriculum(courseId);
  
  const addChapter = useAddChapter();
  const deleteChapter = useDeleteChapter();
  const addLesson = useAddLesson();
  const updateLesson = useUpdateLesson();
  const deleteLesson = useDeleteLesson();

  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [isAddingLesson, setIsAddingLesson] = useState<{ chapterId: string } | null>(null);
  
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'chapter' | 'lesson'; id: string } | null>(null);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleAddChapter = () => {
    addChapter.mutate({ 
      courseId, 
      data: { title: t('curriculum.newChapterTitle') || 'New Module' } 
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'chapter') {
      deleteChapter.mutate(confirmDelete.id, {
        onSuccess: () => setConfirmDelete(null)
      });
    } else {
      deleteLesson.mutate(confirmDelete.id, {
        onSuccess: () => setConfirmDelete(null)
      });
    }
  };

  if (isLoading) return <div className="p-8 text-center">{t('common.loading')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[var(--color-foreground)]">{t('curriculum.title')}</h2>
        <Button onClick={handleAddChapter} disabled={addChapter.isPending} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {t('curriculum.addChapter')}
        </Button>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter: Chapter) => (
          <div key={chapter._id} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="p-4 flex items-center gap-3">
              <GripVertical className="w-5 h-5 text-[var(--color-muted)] cursor-grab active:cursor-grabbing" />
              
              {editingChapterId === chapter._id ? (
                <ChapterTitleEditor
                  chapter={chapter}
                  courseId={courseId}
                  onDone={() => setEditingChapterId(null)}
                />
              ) : (
                <div 
                  className="flex-1 font-semibold text-[var(--color-foreground)] cursor-pointer"
                  onClick={() => toggleChapter(chapter._id)}
                >
                  {chapter.title}
                  <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">({chapter.lessons?.length || 0} {t('curriculum.lessons')})</span>
                </div>
              )}

              {editingChapterId !== chapter._id && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingChapterId(chapter._id)}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                    aria-label={t('curriculum.editChapter')}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete({ type: 'chapter', id: chapter._id })}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors"
                    aria-label={t('curriculum.deleteChapterTitle')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter._id)}
                    className="p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors"
                    aria-label={t('curriculum.toggleChapter')}
                  >
                    {expandedChapters[chapter._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <AnimatePresence>
              {expandedChapters[chapter._id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-[var(--color-border)] bg-[var(--color-background)]/30"
                >
                  <div className="p-4 space-y-2">
                    {chapter.lessons?.map((lesson: Lesson) => (
                      <div 
                        key={lesson._id}
                        className="flex items-center gap-3 p-3 bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl hover:border-[var(--color-primary)]/30 transition-all group"
                      >
                        <GripVertical className="w-4 h-4 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
                        <div className="flex-1 flex items-center gap-3">
                          {lesson.videoUrl ? <Video className="w-4 h-4 text-[var(--color-primary)]" /> : <FileText className="w-4 h-4 text-[var(--color-muted)]" />}
                          <span className="text-sm font-medium text-[var(--color-foreground)]">{lesson.title}</span>
                          {lesson.duration > 0 && (
                            <span className="text-[10px] bg-[var(--color-surface-muted)] px-1.5 py-0.5 rounded text-[var(--color-muted-foreground)] flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {lesson.duration}m
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => setEditingLesson(lesson)}
                            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-primary)] rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => setConfirmDelete({ type: 'lesson', id: lesson._id })}
                            className="p-1.5 text-[var(--color-muted)] hover:text-[var(--color-error)] rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    <button 
                      onClick={() => setIsAddingLesson({ chapterId: chapter._id })}
                      className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[var(--color-border)] rounded-xl text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('curriculum.addLesson')}</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Lesson Edit/Add Form Overlay */}
      {(editingLesson || isAddingLesson) && (
        <LessonForm 
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

      <ConfirmModal
        isOpen={!!confirmDelete}
        title={confirmDelete?.type === 'chapter' ? t('curriculum.deleteChapterTitle') : t('curriculum.deleteLessonTitle')}
        message={confirmDelete?.type === 'chapter' ? t('curriculum.deleteChapterMessage') : t('curriculum.deleteLessonMessage')}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmText={t('common.delete')}
        type="danger"
        isLoading={deleteChapter.isPending || deleteLesson.isPending}
      />
    </div>
  );
}

interface ChapterTitleEditorProps {
  chapter: Chapter;
  courseId: string;
  onDone: () => void;
}

function ChapterTitleEditor({ chapter, courseId, onDone }: ChapterTitleEditorProps) {
  const { t } = useTranslation();
  const updateChapter = useUpdateChapter();
  const [title, setTitle] = useState(chapter.title);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(t('curriculum.chapterTitleRequired'));
      return;
    }
    if (trimmed === chapter.title) {
      onDone();
      return;
    }

    setError(null);
    updateChapter.mutate(
      { chapterId: chapter._id, courseId, data: { title: trimmed } },
      {
        onSuccess: () => onDone(),
        onError: (err) => {
          const message =
            err instanceof ApiClientError
              ? err.message
              : t('curriculum.saveChapterFailed');
          setError(message);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-1 min-w-0">
      <div className="flex flex-1 gap-2 min-w-0">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              onDone();
            }
          }}
          disabled={updateChapter.isPending}
          className="flex-1 min-w-0 bg-[var(--color-background)] border border-[var(--color-primary)] rounded-lg px-3 py-1.5 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-60"
          aria-label={t('curriculum.editChapter')}
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSave}
          disabled={updateChapter.isPending}
          className="p-2 text-white bg-[var(--color-primary)] hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
          aria-label={t('common.save')}
        >
          {updateChapter.isPending ? (
            <span className="w-4 h-4 block border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onDone}
          disabled={updateChapter.isPending}
          className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors disabled:opacity-50"
          aria-label={t('common.cancel')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <p className="text-xs text-[var(--color-error)] font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function LessonForm({ lesson, onClose, onSave, isSaving }: LessonFormProps) {
  const { t } = useTranslation();
  const { session } = useSessionStore();

  const canUpload =
    session?.user?.canUploadVideos ||
    session?.user?.role === 'superadmin' ||
    session?.user?.role === 'admin';

  const [title, setTitle] = useState(lesson?.title || '');
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
        <div className="p-6 border-b border-[var(--color-border)] flex justify-between items-center">
          <h3 className="text-xl font-bold text-[var(--color-foreground)]">
            {lesson ? t('curriculum.editLesson') : t('curriculum.addNewLesson')}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-muted)] rounded-full transition-colors text-[var(--color-foreground)]">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-foreground)]">{t('curriculum.lessonTitle')}</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-foreground)] outline-none"
              placeholder="e.g. Introduction to React"
            />
          </div>

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
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">{t('curriculum.duration')} (Minutes)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 w-5 h-5 text-[var(--color-muted)]" />
                <input 
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-foreground)] outline-none"
                />
              </div>
            </div>
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

          {/* Lesson PDF Notes */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-foreground)]">Lesson Notes (PDF URL)</label>
            <input 
              value={notesPdf}
              onChange={(e) => setNotesPdf(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-foreground)] outline-none"
              placeholder="e.g. https://example.com/notes.pdf"
            />
          </div>

          {/* Attachments Array */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-foreground)]">Lesson Attachments</label>
            <div className="flex gap-2">
              <input 
                value={attachmentInput}
                onChange={(e) => setAttachmentInput(e.target.value)}
                className="flex-1 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] text-[var(--color-foreground)] outline-none"
                placeholder="Attachment URL (e.g. source code, spreadsheet)"
              />
              <button
                type="button"
                onClick={() => {
                  if (attachmentInput.trim()) {
                    setAttachments([...attachments, attachmentInput.trim()]);
                    setAttachmentInput('');
                  }
                }}
                className="px-4 py-3 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                Add
              </button>
            </div>
            {attachments.length > 0 && (
              <div className="space-y-2 mt-2">
                {attachments.map((url, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[var(--color-surface-muted)]/30 border border-[var(--color-border)] p-2.5 rounded-xl text-xs">
                    <span className="truncate flex-1 pr-4 text-[var(--color-foreground)]">{url}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="text-[var(--color-error)] hover:underline font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lesson Preview Toggle */}
          <div className="flex items-center gap-2.5 p-4 bg-[var(--color-surface-muted)]/30 rounded-xl">
            <input
              type="checkbox"
              id="isPreview"
              checked={isPreview}
              onChange={(e) => setIsPreview(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] bg-[var(--color-background)]"
            />
            <label htmlFor="isPreview" className="text-sm font-semibold text-[var(--color-foreground)] select-none">
              Allow Free Preview (Students can view this lecture without course enrollment)
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-foreground)]">{t('curriculum.lessonContent')}</label>
            <div className="min-h-[400px] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-inner">
              <RichTextEditor 
                content={content} 
                onChange={setContent} 
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>{t('common.cancel')}</Button>
          <Button 
            onClick={() => onSave({ 
              title, 
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

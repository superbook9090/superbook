'use client';

import React, { useState } from 'react';
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
  X
} from 'lucide-react';
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
  const updateChapter = useUpdateChapter();
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
                <div className="flex-1 flex gap-2">
                  <input
                    autoFocus
                    defaultValue={chapter.title}
                    onBlur={(e) => {
                      updateChapter.mutate({ chapterId: chapter._id, data: { title: e.target.value } });
                      setEditingChapterId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        updateChapter.mutate({ chapterId: chapter._id, data: { title: e.currentTarget.value } });
                        setEditingChapterId(null);
                      }
                    }}
                    className="flex-1 bg-[var(--color-background)] border border-[var(--color-primary)] rounded-lg px-3 py-1 focus:outline-none"
                  />
                </div>
              ) : (
                <div 
                  className="flex-1 font-semibold text-[var(--color-foreground)] cursor-pointer"
                  onClick={() => toggleChapter(chapter._id)}
                >
                  {chapter.title}
                  <span className="ml-2 text-xs font-normal text-[var(--color-muted)]">({chapter.lessons?.length || 0} {t('curriculum.lessons')})</span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setEditingChapterId(chapter._id)}
                  className="p-2 text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setConfirmDelete({ type: 'chapter', id: chapter._id })}
                  className="p-2 text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleChapter(chapter._id)}
                  className="p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors"
                >
                  {expandedChapters[chapter._id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
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

function LessonForm({ lesson, onClose, onSave, isSaving }: LessonFormProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(lesson?.title || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.videoUrl || '');
  const [duration, setDuration] = useState(lesson?.duration || 0);
  const [content, setContent] = useState(lesson?.content || '');

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
          <button onClick={onClose} className="p-2 hover:bg-[var(--color-surface-muted)] rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--color-foreground)]">{t('curriculum.lessonTitle')}</label>
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="e.g. Introduction to React"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[var(--color-foreground)]">{t('curriculum.videoUrl')} (Optional)</label>
              <div className="relative">
                <Video className="absolute left-3 top-3.5 w-5 h-5 text-[var(--color-muted)]" />
                <input 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
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
                  className="w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                />
              </div>
            </div>
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
            onClick={() => onSave({ title, videoUrl, duration, content })}
            disabled={!title || isSaving}
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

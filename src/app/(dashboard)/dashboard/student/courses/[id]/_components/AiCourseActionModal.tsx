'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, X, BookOpen, Layers, HelpCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export type AiActionType = 'add-chapter' | 'add-lesson' | 'add-quiz';

interface AiCourseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: AiActionType | null;
  courseId: string;
  courseTitle: string;
  chapter?: { _id: string; title: string } | null;
  lesson?: { _id: string; title: string } | null;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function AiCourseActionModal({
  isOpen,
  onClose,
  actionType,
  courseId,
  courseTitle,
  chapter,
  lesson,
  onSuccess,
  onError,
}: AiCourseActionModalProps) {
  const [title, setTitle] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !actionType) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`/api/courses/${courseId}/ai-generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          chapterId: chapter?._id,
          lessonId: lesson?._id,
          title: title.trim() || undefined,
          numQuestions: actionType === 'add-quiz' ? numQuestions : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        onError(data.message || 'AI generation failed. Please try again.');
      } else {
        onSuccess(data.message || 'Successfully created content using AI!');
        onClose();
        setTitle('');
      }
    } catch (err) {
      onError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getHeadingInfo = () => {
    switch (actionType) {
      case 'add-chapter':
        return {
          title: 'Add Chapter using AI',
          icon: <Layers className="w-5 h-5 text-purple-500" />,
          subtitle: chapter?.title
            ? `Generate next chapter following "${chapter.title}" using course context.`
            : `Generate a new chapter for "${courseTitle}" using course context.`,
          placeholder: 'e.g. आधुनिक भारत का इतिहास (Modern Indian History) - leave blank to auto-suggest',
          buttonText: 'Add Chapter using AI',
        };
      case 'add-lesson':
        return {
          title: lesson?.title ? 'Generate Lesson using AI' : 'Add Lesson using AI',
          icon: <BookOpen className="w-5 h-5 text-purple-500" />,
          subtitle: lesson?.title
            ? `Generate notes & quiz for lesson: "${lesson.title}"`
            : `Generate notes & quiz for chapter: "${chapter?.title || ''}"`,
          placeholder: lesson?.title
            ? lesson.title
            : 'e.g. 1857 का स्वतंत्रता संग्राम (Revolt of 1857) - leave blank to auto-suggest',
          buttonText: lesson?.title ? 'Generate Lesson using AI' : 'Add Lesson using AI',
        };
      case 'add-quiz':
        return {
          title: 'Add Quiz using AI',
          icon: <HelpCircle className="w-5 h-5 text-purple-500" />,
          subtitle: lesson?.title
            ? `Generate practice quiz for lesson: "${lesson.title}"`
            : `Generate practice quiz for chapter: "${chapter?.title || ''}"`,
          placeholder: 'e.g. अभ्यास टेस्ट (Leave blank for default title)',
          buttonText: 'Add Quiz using AI',
        };
    }
  };

  const info = getHeadingInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] flex items-start justify-between gap-4 bg-[var(--surface-muted)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              {info.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
                <span>{info.title}</span>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Superadmin
                </span>
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 line-clamp-1">
                {info.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-foreground)] uppercase tracking-wider">
              {actionType === 'add-quiz' ? 'Quiz Title / Focus (Optional)' : 'Title / Topic (Optional)'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={info.placeholder}
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)]/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
            />
            <p className="text-[11px] text-[var(--color-muted-foreground)]">
              💡 Leave blank to let AI deduce the next optimal syllabus topic using course context.
            </p>
          </div>

          {actionType === 'add-quiz' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--color-foreground)] uppercase tracking-wider">
                Question Count
              </label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                disabled={isLoading}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
              >
                <option value={5}>5 Questions (Fast & Recommended)</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>
          )}

          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-[var(--color-muted-foreground)] space-y-1">
            <div className="font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Course Context Applied</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Course: <strong className="text-[var(--color-foreground)]">{courseTitle}</strong>
              {chapter && <> • Chapter: <strong className="text-[var(--color-foreground)]">{chapter.title}</strong></>}
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="btn-premium px-5 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Generating with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  <span>{info.buttonText}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

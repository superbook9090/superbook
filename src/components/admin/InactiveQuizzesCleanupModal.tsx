'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BookOpen,
  Calendar,
  User,
  ArrowLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';

export interface InactiveQuizPreviewItem {
  _id: string;
  title: string;
  isPublished: boolean;
  questionCount: number;
  timeLimit: number;
  createdAt: string;
  ageDays: number;
  course: {
    _id: string;
    title: string;
  } | null;
  instructor: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface InactiveQuizzesCleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (summaryMessage: string) => void;
}

export function InactiveQuizzesCleanupModal({
  isOpen,
  onClose,
  onCompleted,
}: InactiveQuizzesCleanupModalProps) {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [quizzes, setQuizzes] = useState<InactiveQuizPreviewItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const loadPreview = useCallback(async () => {
    setIsLoadingPreview(true);
    setError(null);
    setResultMessage(null);
    setStep('select');
    try {
      const res = await fetch('/api/admin/quizzes/cleanup-inactive');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load inactive quizzes preview');
      }
      const list: InactiveQuizPreviewItem[] = data.quizzes || [];
      setQuizzes(list);
      setSelectedIds(new Set(list.map((q) => q._id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void loadPreview();
    }
  }, [isOpen, loadPreview]);

  const selectedQuizzes = useMemo(
    () => quizzes.filter((q) => selectedIds.has(q._id)),
    [quizzes, selectedIds]
  );

  if (!isOpen) return null;

  const toggleQuiz = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(
      selectedIds.size === quizzes.length ? new Set() : new Set(quizzes.map((q) => q._id))
    );
  };

  const handleExecute = async () => {
    if (selectedIds.size === 0 || isExecuting) return;
    setIsExecuting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/quizzes/cleanup-inactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: true,
          quizIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete inactive quizzes');
      }
      const msg = String(data.message || 'Inactive quizzes cleaned up successfully.');
      setResultMessage(msg);
      setQuizzes((prev) => prev.filter((q) => !selectedIds.has(q._id)));
      setSelectedIds(new Set());
      setStep('select');
      onCompleted?.(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute cleanup');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/15 text-red-500 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
                {step === 'confirm'
                  ? 'Confirm Permanent Quiz Deletion'
                  : 'Clean Up Inactive Quizzes (10+ Days, 0 Attempts)'}
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {step === 'confirm'
                  ? 'Review the exact list of quizzes that will be permanently deleted (no emails will be sent)'
                  : 'Select quizzes to delete (no emails sent; contest & challenge quizzes excluded)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExecuting}
            className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-xs bg-red-500/10 text-red-500 border border-red-500/25">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resultMessage && (
            <div className="flex items-start gap-2 p-3.5 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resultMessage}</span>
            </div>
          )}

          {isLoadingPreview ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--primary)]" />
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Scanning quizzes older than 10 days with 0 attempts...
              </span>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="py-10 text-center space-y-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--color-surface-muted)]/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-[var(--color-foreground)]">
                No eligible inactive quizzes found
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] max-w-sm mx-auto">
                Every quiz created more than 10 days ago has student attempts or is actively linked to a contest or challenge.
              </p>
            </div>
          ) : step === 'confirm' ? (
            /* Step 2: Explicit Final List of Quizzes About to Be Deleted */
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    This action cannot be undone. The following {selectedQuizzes.length} quiz(zes) and all of their questions will be permanently deleted:
                  </p>
                  <p className="mt-1 opacity-90">No emails will be sent to instructors.</p>
                </div>
              </div>

              <div className="divide-y divide-[var(--border)] rounded-xl border border-red-500/30 overflow-hidden bg-[var(--card-solid)]">
                {selectedQuizzes.map((quiz, idx) => (
                  <div key={quiz._id} className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--color-foreground)]">
                        {idx + 1}. {quiz.title}
                      </span>
                      <span className="text-[11px] font-semibold text-red-500 shrink-0">
                        {quiz.ageDays}d old · 0 attempts
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">
                      {quiz.course ? `Course: ${quiz.course.title} · ` : ''}
                      Instructor: {quiz.instructor ? `${quiz.instructor.name} [${quiz.instructor.role}]` : 'Unknown'} · {quiz.questionCount} question(s)
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Step 1: Select & Preview Eligible Quizzes */
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--color-foreground)]">
                  Matching Quizzes ({selectedIds.size} of {quizzes.length} selected)
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  {selectedIds.size === quizzes.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
                {quizzes.map((quiz) => {
                  const checked = selectedIds.has(quiz._id);
                  return (
                    <label
                      key={quiz._id}
                      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                        checked ? 'bg-red-500/5' : 'bg-[var(--card-solid)] opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQuiz(quiz._id)}
                        disabled={isExecuting}
                        className="mt-1 w-4 h-4 rounded border-[var(--border)] accent-red-500 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[var(--color-foreground)] truncate">
                            {quiz.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-muted-foreground)]">
                            {quiz.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">
                            0 Attempts
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-muted-foreground)]">
                          {quiz.course && (
                            <span className="inline-flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {quiz.course.title}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {quiz.instructor
                              ? `${quiz.instructor.name} [${quiz.instructor.role}]`
                              : 'Unknown Instructor'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {quiz.ageDays}d old ({new Date(quiz.createdAt).toLocaleDateString()})
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" />
                            {quiz.questionCount} Qs
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2.5 px-5 py-3.5 border-t border-[var(--border)] bg-[var(--color-surface-muted)]/30">
          {step === 'confirm' ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setStep('select')}
              disabled={isExecuting}
              className="inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Selection</span>
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2.5">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={isExecuting}>
              {resultMessage ? 'Close' : 'Cancel'}
            </Button>
            {quizzes.length > 0 && step === 'select' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={selectedIds.size === 0 || isLoadingPreview}
                onClick={() => setStep('confirm')}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Review {selectedIds.size} Quiz(zes) to Delete</span>
              </Button>
            )}
            {quizzes.length > 0 && step === 'confirm' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={selectedIds.size === 0 || isExecuting}
                onClick={handleExecute}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 inline-flex items-center gap-1.5"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting Quizzes...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Permanent Delete ({selectedIds.size})</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InactiveQuizzesCleanupModal;

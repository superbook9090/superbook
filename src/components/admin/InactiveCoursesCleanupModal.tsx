'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  X,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Mail,
  BookOpen,
  Calendar,
  User,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import CleanupDaysSelector from '@/components/admin/CleanupDaysSelector';

export interface InactiveCoursePreviewItem {
  _id: string;
  title: string;
  category: string;
  isPublished: boolean;
  lessonCount: number;
  chapterCount: number;
  quizzes?: Array<{ _id: string; title: string }>;
  createdAt: string;
  ageDays: number;
  instructor: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface CleanupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: (summaryMessage: string) => void;
}

export function InactiveCoursesCleanupModal({
  isOpen,
  onClose,
  onCompleted,
}: CleanupModalProps) {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  const [days, setDays] = useState(10);
  const [cutoffDate, setCutoffDate] = useState<string | null>(null);
  const [courses, setCourses] = useState<InactiveCoursePreviewItem[]>([]);
  const [emailMessage, setEmailMessage] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const loadPreview = useCallback(async (targetDays: number) => {
    setIsLoadingPreview(true);
    setError(null);
    setResultMessage(null);
    setStep('select');
    try {
      const res = await fetch(`/api/admin/courses/cleanup-inactive?days=${targetDays}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to load inactive courses preview');
      }
      const list: InactiveCoursePreviewItem[] = data.courses || [];
      setCourses(list);
      setCutoffDate(data.cutoffDate || null);
      setEmailMessage(data.emailMessage || '');
      setSelectedIds(new Set(list.map((c) => c._id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      void loadPreview(days);
    }
  }, [isOpen, days, loadPreview]);

  const handleApplyDays = (nextDays: number) => {
    if (nextDays === days) {
      void loadPreview(nextDays);
    } else {
      setDays(nextDays);
    }
  };

  const selectedCourses = useMemo(
    () => courses.filter((c) => selectedIds.has(c._id)),
    [courses, selectedIds]
  );

  const totalSelectedQuizzes = useMemo(
    () => selectedCourses.reduce((sum, c) => sum + (c.quizzes?.length || 0), 0),
    [selectedCourses]
  );

  const selectedUniqueEmails = useMemo(
    () =>
      new Set(
        selectedCourses
          .map((c) => c.instructor?.email?.trim().toLowerCase())
          .filter(Boolean)
      ).size,
    [selectedCourses]
  );

  if (!isOpen) return null;

  const toggleCourse = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds(
      selectedIds.size === courses.length ? new Set() : new Set(courses.map((c) => c._id))
    );
  };

  const handleExecute = async () => {
    if (selectedIds.size === 0 || isExecuting) return;
    setIsExecuting(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/courses/cleanup-inactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: true,
          days,
          courseIds: Array.from(selectedIds),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete inactive courses');
      }
      const msg = String(data.message || 'Inactive courses cleaned up successfully.');
      setResultMessage(msg);
      setCourses((prev) => prev.filter((c) => !selectedIds.has(c._id)));
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
                  ? 'Confirm Permanent Deletion'
                  : `Clean Up Inactive Courses (${days}+ Days, 0 Enrollments)`}
              </h2>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {step === 'confirm'
                  ? 'Review the exact list of courses and linked quizzes that will be permanently deleted'
                  : 'Select courses to delete & notify instructors'}
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

          {step === 'select' && (
            <CleanupDaysSelector
              days={days}
              cutoffDate={cutoffDate}
              disabled={isLoadingPreview || isExecuting}
              onApplyDays={handleApplyDays}
            />
          )}

          {isLoadingPreview ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5">
              <Loader2 className="w-7 h-7 animate-spin text-[var(--primary)]" />
              <span className="text-xs text-[var(--color-muted-foreground)]">
                Scanning courses older than {days} day(s) with 0 verified student enrollments...
              </span>
            </div>
          ) : courses.length === 0 ? (
            <div className="py-10 text-center space-y-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--color-surface-muted)]/30">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-[var(--color-foreground)]">
                No eligible inactive courses found
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)] max-w-sm mx-auto">
                Every course created more than {days} day(s) ago currently has at least 1 enrolled student.
              </p>
            </div>
          ) : step === 'confirm' ? (
            /* Step 2: Explicit Final List of Courses & Quizzes About to Be Deleted */
            <div className="space-y-4">
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">
                    This action cannot be undone. The following {selectedCourses.length} course(s)
                    {totalSelectedQuizzes > 0 ? ` and ${totalSelectedQuizzes} linked quiz(zes)` : ''} will be permanently deleted:
                  </p>
                  <p className="mt-1 opacity-90">
                    {selectedUniqueEmails} instructor(s) will receive the removal notice email.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-[var(--border)] rounded-xl border border-red-500/30 overflow-hidden bg-[var(--card-solid)]">
                {selectedCourses.map((course, idx) => (
                  <div key={course._id} className="p-3 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-[var(--color-foreground)]">
                        {idx + 1}. {course.title}
                      </span>
                      <span className="text-[11px] font-semibold text-red-500 shrink-0">
                        {course.ageDays}d old · 0 enrollments
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">
                      Instructor: {course.instructor ? `${course.instructor.name} (${course.instructor.email || 'no email'})` : 'Unknown'} · {course.lessonCount} lesson(s)
                    </p>
                    {course.quizzes && course.quizzes.length > 0 && (
                      <div className="mt-1 pl-3 border-l-2 border-red-500/40 space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 block">
                          Linked Quizzes Also Deleted ({course.quizzes.length}):
                        </span>
                        {course.quizzes.map((q) => (
                          <div key={q._id} className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-1">
                            <HelpCircle className="w-3 h-3 text-red-400 shrink-0" />
                            <span>{q.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Common Email That Will Be Sent</span>
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)] whitespace-pre-line leading-relaxed">
                  {emailMessage}
                </p>
              </div>
            </div>
          ) : (
            /* Step 1: Select & Preview Eligible Courses */
            <>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--color-foreground)]">
                  Matching Courses ({selectedIds.size} of {courses.length} selected
                  {totalSelectedQuizzes > 0 ? ` · ${totalSelectedQuizzes} linked quiz(zes)` : ''})
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="font-semibold text-[var(--primary)] hover:underline cursor-pointer"
                >
                  {selectedIds.size === courses.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
                {courses.map((course) => {
                  const checked = selectedIds.has(course._id);
                  const quizCount = course.quizzes?.length || 0;
                  return (
                    <label
                      key={course._id}
                      className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
                        checked ? 'bg-red-500/5' : 'bg-[var(--card-solid)] opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCourse(course._id)}
                        disabled={isExecuting}
                        className="mt-1 w-4 h-4 rounded border-[var(--border)] accent-red-500 cursor-pointer shrink-0"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-[var(--color-foreground)] truncate">
                            {course.title}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-muted-foreground)]">
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-500">
                            0 Enrollments
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[var(--color-muted-foreground)]">
                          <span className="inline-flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {course.instructor
                              ? `${course.instructor.name} (${course.instructor.email || 'no email'}) [${course.instructor.role}]`
                              : 'Unknown Instructor'}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {course.ageDays}d old ({new Date(course.createdAt).toLocaleDateString()})
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.lessonCount} lesson(s)
                          </span>
                          {quizCount > 0 && (
                            <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                              <HelpCircle className="w-3 h-3" />
                              +{quizCount} quiz(zes)
                            </span>
                          )}
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
            {courses.length > 0 && step === 'select' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={selectedIds.size === 0 || isLoadingPreview}
                onClick={() => setStep('confirm')}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Review {selectedIds.size} Item(s) to Delete</span>
              </Button>
            )}
            {courses.length > 0 && step === 'confirm' && (
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
                    <span>Deleting &amp; Sending Mail...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirm Delete ({selectedIds.size}) &amp; Send Mail</span>
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

export default InactiveCoursesCleanupModal;

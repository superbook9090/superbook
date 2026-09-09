'use client';

import React, { useState } from 'react';
import { useCourseDoubts, useAskCourseDoubt } from '@/lib/react-query/hooks';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { MessageCircle, Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoubtsTabProps {
  courseId: string;
}

export function DoubtsTab({ courseId }: DoubtsTabProps) {
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const { data: doubts = [], isLoading } = useCourseDoubts(courseId);
  const askDoubtMutation = useAskCourseDoubt();
  const [question, setQuestion] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    try {
      await askDoubtMutation.mutateAsync({ courseId, question: question.trim() });
      setQuestion('');
    } catch (error) {
      console.error('Failed to ask doubt:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-3 border-[var(--student-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Ask Question Form */}
      <div className="antigravity-glass border border-[var(--border)] rounded-2xl p-6 sm:p-7 shadow-xs">
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] mb-4 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center">
            <MessageCircle className="w-4.5 h-4.5" />
          </div>
          <span>{t('courseDoubts.askQuestion')}</span>
        </h3>
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('courseDoubts.questionPlaceholder')}
            className="w-full min-h-[120px] p-4 pb-14 rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)]/40 focus:ring-2 focus:ring-[var(--student-primary)]/20 focus:border-[var(--student-primary)] outline-none resize-y text-xs sm:text-sm text-[var(--color-foreground)] transition-all placeholder:text-[var(--color-muted-foreground)]/60"
            disabled={askDoubtMutation.isPending}
          />
          <div className="absolute bottom-3.5 right-3.5">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!question.trim() || askDoubtMutation.isPending}
              className="btn-premium px-5 rounded-xl text-xs font-bold"
            >
              {askDoubtMutation.isPending ? (
                t('courseDoubts.submitting')
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>{t('courseDoubts.submitQuestion')}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {doubts.length === 0 ? (
          <div className="text-center py-14 px-4 border border-[var(--border)] border-dashed rounded-2xl antigravity-glass">
            <div className="w-14 h-14 bg-[var(--student-soft)] text-[var(--student-primary)] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-[var(--color-foreground)] mb-1">
              {t('courseDoubts.noDoubts')}
            </h4>
            <p className="text-xs text-[var(--color-muted-foreground)] max-w-sm mx-auto">
              Have a question about this course or its assignments? Post it above and instructors will answer.
            </p>
          </div>
        ) : (
          doubts.map((doubt) => {
            const isAnswered = doubt.status === 'answered';
            const isAuthor = doubt.studentId._id === session?.user?.id;

            return (
              <div
                key={doubt._id}
                className="antigravity-glass border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-[var(--student-primary)]/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                      {doubt.studentId.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[var(--color-foreground)]">
                        {isAuthor ? t('courseDoubts.you') : doubt.studentId.name}
                      </h4>
                      <span className="text-[11px] text-[var(--color-muted-foreground)]">
                        {new Date(doubt.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs',
                      isAnswered
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    )}
                  >
                    {isAnswered ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    <span>{isAnswered ? t('courseDoubts.answered') : t('courseDoubts.pending')}</span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--color-foreground)] mb-4 leading-relaxed pl-12">
                  {doubt.question}
                </p>

                {isAnswered && doubt.answer && (
                  <div className="ml-12 bg-[var(--student-soft)]/60 border border-[var(--student-primary)]/25 rounded-2xl p-4 sm:p-5 relative shadow-2xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-lg bg-[var(--student-primary)] text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-300" />
                      </div>
                      <span className="font-bold text-xs text-[var(--student-primary)]">
                        {doubt.teacherId?.name || t('courseDoubts.teacher')}
                      </span>
                      <span className="text-[10px] text-[var(--color-muted-foreground)] ml-auto">
                        {new Date(doubt.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--color-foreground)] leading-relaxed pl-8">
                      {doubt.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

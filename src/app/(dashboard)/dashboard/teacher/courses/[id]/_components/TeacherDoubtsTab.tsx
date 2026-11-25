'use client';

import React, { useState } from 'react';
import { MessageCircle, CheckCircle2, Clock, Send } from 'lucide-react';
import { useCourseDoubts, useReplyCourseDoubt } from '@/lib/react-query/hooks';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { EmptyState } from '@/components/layout';
import { cn } from '@/lib/utils';

interface TeacherDoubtsTabProps {
  courseId: string;
}

export function TeacherDoubtsTab({ courseId }: TeacherDoubtsTabProps) {
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const { data: doubts = [], isLoading } = useCourseDoubts(courseId);
  const replyDoubtMutation = useReplyCourseDoubt();
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = async (doubtId: string) => {
    if (!replyText.trim()) return;
    try {
      await replyDoubtMutation.mutateAsync({ courseId, doubtId, answer: replyText.trim() });
      setActiveReplyId(null);
      setReplyText('');
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[var(--teacher-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-3.5">
      {doubts.length === 0 ? (
        <EmptyState icon={MessageCircle} title={t('courseDoubts.noDoubtsTeacher')} />
      ) : (
        doubts.map((doubt) => (
          <article key={doubt._id} className="teacher-card p-4 sm:p-5 flex flex-col gap-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--teacher-soft)] text-[var(--teacher-primary)] font-bold text-xs flex items-center justify-center shrink-0">
                  {doubt.studentId.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm text-[var(--color-foreground)] truncate">
                    {doubt.studentId.name}
                  </h4>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  'px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider inline-flex items-center gap-1 shrink-0',
                  doubt.status === 'answered'
                    ? 'bg-[var(--success-light)] text-[var(--success)]'
                    : 'bg-[var(--warning-light)] text-amber-800 dark:text-amber-300'
                )}
              >
                {doubt.status === 'answered' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {doubt.status === 'answered' ? t('courseDoubts.answered') : t('courseDoubts.pending')}
              </span>
            </div>

            <p className="text-sm text-[var(--color-foreground)] leading-relaxed font-medium sm:pl-12">
              {doubt.question}
            </p>

            <div className="sm:pl-12">
              {doubt.status === 'answered' && doubt.answer ? (
                <div className="bg-[var(--teacher-soft)]/70 border border-[var(--teacher-border)] rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg gradient-bg text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      {doubt.teacherId?.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <span className="font-semibold text-xs text-[var(--color-foreground)]">
                      {doubt.teacherId?._id === session?.user?.id
                        ? t('courseDoubts.you')
                        : doubt.teacherId?.name || t('courseDoubts.teacher')}
                    </span>
                    <span className="text-[11px] text-[var(--color-muted-foreground)] ml-auto">
                      {new Date(doubt.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-foreground)] leading-relaxed pl-8">
                    {doubt.answer}
                  </p>
                </div>
              ) : activeReplyId === doubt._id ? (
                <div className="space-y-2.5">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('courseDoubts.replyPlaceholder')}
                    className="w-full min-h-[100px] p-3.5 rounded-xl bg-[var(--surface-muted)] focus:bg-[var(--card-solid)] border border-[var(--border)] focus:border-[var(--teacher-primary)] focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:outline-none resize-y text-sm text-[var(--color-foreground)] transition-all"
                    disabled={replyDoubtMutation.isPending}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveReplyId(null)}
                      disabled={replyDoubtMutation.isPending}
                      className="min-h-[40px] rounded-xl"
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleReplySubmit(doubt._id)}
                      disabled={!replyText.trim() || replyDoubtMutation.isPending}
                      className="min-h-[40px] rounded-xl"
                    >
                      {replyDoubtMutation.isPending ? (
                        t('courseDoubts.submitting')
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1.5" />
                          {t('courseDoubts.submitReply')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setActiveReplyId(doubt._id);
                    setReplyText('');
                  }}
                  variant="outline"
                  size="sm"
                  className="min-h-[40px] rounded-xl"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  {t('courseDoubts.reply')}
                </Button>
              )}
            </div>
          </article>
        ))
      )}
    </div>
  );
}

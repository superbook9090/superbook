import React, { useState } from 'react';
import { useCourseDoubts, useReplyCourseDoubt } from '@/lib/react-query/hooks';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { MessageCircle, CheckCircle2, Clock, Send } from 'lucide-react';
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
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {doubts.length === 0 ? (
        <div className="text-center py-12 px-4 border border-[var(--border)] border-dashed rounded-2xl bg-[var(--color-surface-muted)]/30">
          <div className="w-16 h-16 bg-[var(--primary-soft)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8" />
          </div>
          <p className="text-[var(--color-muted-foreground)] font-medium">
            {t('courseDoubts.noDoubtsTeacher')}
          </p>
        </div>
      ) : (
        doubts.map((doubt) => (
          <div key={doubt._id} className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] font-bold flex items-center justify-center flex-shrink-0">
                  {doubt.studentId.name?.[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-[var(--color-foreground)]">
                    {doubt.studentId.name}
                  </h4>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {new Date(doubt.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={cn(
                "px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5",
                doubt.status === 'answered' 
                  ? "bg-[var(--success-light)] text-[var(--success)]"
                  : "bg-[var(--warning-light)] text-[var(--warning)]"
              )}>
                {doubt.status === 'answered' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                {doubt.status === 'answered' ? t('courseDoubts.answered') : t('courseDoubts.pending')}
              </div>
            </div>

            {/* Question */}
            <div className="pl-[3.25rem]">
              <p className="text-sm text-[var(--color-foreground)] leading-relaxed font-medium">
                {doubt.question}
              </p>
            </div>

            {/* Answer / Reply Box */}
            <div className="pl-[3.25rem]">
              {doubt.status === 'answered' && doubt.answer ? (
                <div className="bg-[var(--primary-soft)] border border-[var(--primary)]/20 rounded-xl p-4 relative before:absolute before:left-[-6px] before:top-6 before:w-3 before:h-3 before:bg-[var(--primary-soft)] before:border-l before:border-b before:border-[var(--primary)]/20 before:rotate-45 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-white text-[var(--primary)] flex items-center justify-center font-bold text-[10px]">
                      {doubt.teacherId?.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <span className="font-semibold text-xs text-[var(--color-foreground)]">
                      {doubt.teacherId?._id === session?.user?.id ? t('courseDoubts.you') : doubt.teacherId?.name || t('courseDoubts.teacher')}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-foreground)] ml-auto">
                      {new Date(doubt.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-foreground)]/90 leading-relaxed pl-8">
                    {doubt.answer}
                  </p>
                </div>
              ) : activeReplyId === doubt._id ? (
                <div className="mt-4 relative border border-[var(--border)] rounded-xl overflow-hidden shadow-inner">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t('courseDoubts.replyPlaceholder')}
                    className="w-full min-h-[100px] p-4 pb-14 bg-[var(--color-surface-muted)] focus:bg-[var(--card-solid)] focus:ring-0 focus:outline-none resize-y text-sm text-[var(--color-foreground)] transition-colors"
                    disabled={replyDoubtMutation.isPending}
                  />
                  <div className="absolute bottom-2 right-2 flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveReplyId(null)}
                      disabled={replyDoubtMutation.isPending}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleReplySubmit(doubt._id)}
                      disabled={!replyText.trim() || replyDoubtMutation.isPending}
                    >
                      {replyDoubtMutation.isPending ? t('courseDoubts.submitting') : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('courseDoubts.submitReply')}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setActiveReplyId(doubt._id);
                    setReplyText('');
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t('courseDoubts.reply')}
                </Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

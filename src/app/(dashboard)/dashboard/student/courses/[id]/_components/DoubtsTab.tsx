import React, { useState } from 'react';
import { useCourseDoubts, useAskCourseDoubt } from '@/lib/react-query/hooks';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { MessageCircle, Send, CheckCircle2, Clock } from 'lucide-react';
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
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Ask Question Form */}
      <div className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[var(--student-primary)]" />
          {t('courseDoubts.askQuestion')}
        </h3>
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={t('courseDoubts.questionPlaceholder')}
            className="w-full min-h-[120px] p-4 pb-14 rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)]/50 focus:ring-2 focus:ring-[var(--student-primary)]/20 focus:border-[var(--student-primary)] outline-none resize-y text-sm text-[var(--color-foreground)] transition-all"
            disabled={askDoubtMutation.isPending}
          />
          <div className="absolute bottom-3 right-3">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!question.trim() || askDoubtMutation.isPending}
              className="px-6 rounded-lg bg-[var(--student-primary)] hover:bg-[var(--student-primary-hover)] text-white"
            >
              {askDoubtMutation.isPending ? t('courseDoubts.submitting') : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  {t('courseDoubts.submitQuestion')}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Doubts List */}
      <div className="space-y-4">
        {doubts.length === 0 ? (
          <div className="text-center py-12 px-4 border border-[var(--border)] border-dashed rounded-2xl bg-[var(--color-surface-muted)]/30">
            <div className="w-16 h-16 bg-[var(--student-soft)] text-[var(--student-primary)] rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <p className="text-[var(--color-muted-foreground)] font-medium">
              {t('courseDoubts.noDoubts')}
            </p>
          </div>
        ) : (
          doubts.map((doubt) => (
            <div key={doubt._id} className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] font-bold flex items-center justify-center flex-shrink-0">
                    {doubt.studentId.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-[var(--color-foreground)]">
                      {doubt.studentId._id === session?.user?.id ? t('courseDoubts.you') : doubt.studentId.name}
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
              
              <p className="text-sm text-[var(--color-foreground)] mb-4 leading-relaxed pl-[3.25rem]">
                {doubt.question}
              </p>

              {doubt.status === 'answered' && doubt.answer && (
                <div className="ml-[3.25rem] bg-[var(--student-soft)] border border-[var(--student-primary)]/20 rounded-xl p-4 sm:p-5 relative before:absolute before:left-[-6px] before:top-6 before:w-3 before:h-3 before:bg-[var(--student-soft)] before:border-l before:border-b before:border-[var(--student-primary)]/20 before:rotate-45">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-white text-[var(--student-primary)] flex items-center justify-center font-bold text-[10px]">
                      {doubt.teacherId?.name?.[0]?.toUpperCase() || 'T'}
                    </div>
                    <span className="font-semibold text-xs text-[var(--color-foreground)]">
                      {doubt.teacherId?.name || t('courseDoubts.teacher')}
                    </span>
                    <span className="text-[10px] text-[var(--color-muted-foreground)] ml-auto">
                      {new Date(doubt.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-foreground)]/90 leading-relaxed pl-8">
                    {doubt.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

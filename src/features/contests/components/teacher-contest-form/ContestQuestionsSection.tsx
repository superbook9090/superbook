'use client';

import React from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';
import { QuizImportTool } from '@/features/quizzes/components/QuizImportTool';
import type { Question } from '@/features/quizzes/components/types';
import type { RoleTheme } from '@/lib/roleTheme';
import type { FormQuestion } from './types';

interface ContestQuestionsSectionProps {
  canEditQuestions: boolean;
  questions: FormQuestion[];
  theme: RoleTheme;
  triggerAiModalOpen: number;
  enableNegativeMarking: boolean;
  negativeMarks: string;
  onImportQuestions: (imported: Question[]) => void;
  onAddQuestion: () => void;
  onRemoveQuestion: (index: number) => void;
  onQuestionChange: (index: number, text: string) => void;
  onOptionChange: (qIndex: number, optIndex: number, text: string) => void;
  onSetCorrectAnswer: (qIndex: number, optIndex: number) => void;
  onAddOption: (qIndex: number) => void;
  onRemoveOption: (qIndex: number, optIndex: number) => void;
  onPointsChange: (qIndex: number, val: number) => void;
  onNegativePointsChange: (qIndex: number, val: number) => void;
}

export function ContestQuestionsSection({
  canEditQuestions,
  questions,
  theme,
  triggerAiModalOpen,
  enableNegativeMarking,
  negativeMarks,
  onImportQuestions,
  onAddQuestion,
  onRemoveQuestion,
  onQuestionChange,
  onOptionChange,
  onSetCorrectAnswer,
  onAddOption,
  onRemoveOption,
  onPointsChange,
  onNegativePointsChange,
}: ContestQuestionsSectionProps) {
  const { t } = useTranslation();

  if (!canEditQuestions) {
    return (
      <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <span>{t('contest.questionsBuilder') || '5. Contest Questions'}</span>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {t('contest.questionsLockedDuringContest') || 'Questions cannot be modified once the contest has started or completed.'}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <span>{t('contest.questionsBuilder') || '5. Contest Questions'}</span>
        </div>
        <span className="text-xs font-bold text-[var(--primary)]">
          {questions.length} {t('common.questions') || 'Questions'}
        </span>
      </div>

      <QuizImportTool
        theme={theme}
        onImport={onImportQuestions}
        entityType="contest"
        triggerAiModalOpen={triggerAiModalOpen}
      />

      <div className="space-y-6">
        {questions.map((q, qIdx) => (
          <div
            key={qIdx}
            className="p-5 rounded-2xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)] space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-[var(--card-solid)] border border-[var(--border)] flex items-center justify-center">
                  {qIdx + 1}
                </span>
                Question #{qIdx + 1}
              </span>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(qIdx)}
                  className="text-xs font-bold text-[var(--error)] hover:opacity-80 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('common.remove') || 'Remove'}</span>
                </button>
              )}
            </div>

            <TextField
              label={t('contest.questionPrompt') || 'Question Text *'}
              value={q.question}
              onChange={(e) => onQuestionChange(qIdx, e.target.value)}
              placeholder="Enter the question prompt..."
              required
            />

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[var(--color-foreground)]">
                {t('contest.optionsAndCorrect') || 'Options & Correct Answer (Select radio for correct answer)'}
              </label>
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qIdx}`}
                    checked={q.correctAnswer === optIdx}
                    onChange={() => onSetCorrectAnswer(qIdx, optIdx)}
                    className="w-4 h-4 text-[var(--primary)]"
                    title="Mark as correct answer"
                  />
                  <span className="w-6 text-xs font-bold text-[var(--color-muted)] font-mono">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => onOptionChange(qIdx, optIdx, e.target.value)}
                    placeholder={`Option ${optIdx + 1}`}
                    required
                    className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                  />
                  {q.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onRemoveOption(qIdx, optIdx)}
                      className="p-1.5 text-[var(--color-muted)] hover:text-[var(--error)] rounded-lg"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}

              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => onAddOption(qIdx)}
                  className="text-xs font-bold text-[var(--primary)] hover:opacity-80 pt-1 block"
                >
                  {t('contest.addOption') || '+ Add Option'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[var(--border)]">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--color-foreground)] mb-1">
                  {t('contest.questionPoints') || 'Positive Points'}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={q.points || 1}
                  onChange={(e) => onPointsChange(qIdx, parseFloat(e.target.value) || 1)}
                  className="w-32 px-3 py-1.5 text-xs rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              {enableNegativeMarking && (
                <div>
                  <label className="block text-[11px] font-semibold text-[var(--color-foreground)] mb-1">
                    {t('contest.negativePoints') || 'Negative Penalty'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={q.negativePoints !== undefined ? q.negativePoints : (parseFloat(negativeMarks) || 0.25)}
                    onChange={(e) => onNegativePointsChange(qIdx, parseFloat(e.target.value) || 0)}
                    className="w-32 px-3 py-1.5 text-xs rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddQuestion}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--border)] text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>{t('contest.addAnotherQuestion') || 'Add Another Question'}</span>
        </button>
      </div>
    </div>
  );
}

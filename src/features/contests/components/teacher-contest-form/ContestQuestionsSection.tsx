'use client';

import React from 'react';
import { Layers, Plus, Trash2, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
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
      <div className="p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-[var(--color-foreground)]">
            {t('contest.questionsBuilder')}
          </h3>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {t('contest.questionsLockedDuringContest')}
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl group transition-all duration-500 hover:shadow-2xl hover:bg-[var(--card-solid)]/60 space-y-6">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border)]/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
              {t('contest.questionsBuilder')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Build your question bank manually, upload files, or generate instantly with AI
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{questions.length} {t('common.questions')}</span>
        </div>
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
            className="p-5 sm:p-6 rounded-2xl bg-[var(--surface-muted)]/40 border border-[var(--border)]/60 hover:border-[var(--border)] space-y-5 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  {qIdx + 1}
                </span>
                <span>Question #{qIdx + 1}</span>
              </span>

              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveQuestion(qIdx)}
                  className="text-xs font-bold text-red-500 hover:bg-red-500/10 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t('common.remove')}</span>
                </button>
              )}
            </div>

            {/* Question Prompt */}
            <div>
              <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 uppercase tracking-wider">
                {t('contest.questionPrompt')} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                value={q.question}
                onChange={(e) => onQuestionChange(qIdx, e.target.value)}
                placeholder="Type or paste the question text..."
                required
                className="w-full px-4 py-3 text-sm font-medium rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all resize-y"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                  {t('contest.optionsAndCorrect')}
                </label>
                <span className="text-[11px] text-[var(--color-muted-foreground)]">
                  Select the radio button next to the correct answer
                </span>
              </div>

              <div className="space-y-2.5">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctAnswer === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-3 p-2 rounded-2xl border transition-all ${
                        isCorrect
                          ? 'bg-[var(--primary)]/5 border-[var(--primary)]/50 ring-1 ring-[var(--primary)]/30'
                          : 'bg-[var(--card-solid)] border-[var(--border)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${qIdx}`}
                        checked={isCorrect}
                        onChange={() => onSetCorrectAnswer(qIdx, optIdx)}
                        className="w-4 h-4 ml-2 text-[var(--primary)] cursor-pointer"
                        title="Mark as correct answer"
                      />
                      <span className={`w-5 text-xs font-bold font-mono ${isCorrect ? 'text-[var(--primary)]' : 'text-[var(--color-muted-foreground)]'}`}>
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => onOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        required
                        className="flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-transparent border-0 text-[var(--color-foreground)] focus:outline-none"
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => onRemoveOption(qIdx, optIdx)}
                          className="p-1.5 text-[var(--color-muted-foreground)] hover:text-red-500 rounded-lg mr-1 cursor-pointer transition-colors"
                          title="Remove option"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {q.options.length < 6 && (
                <button
                  type="button"
                  onClick={() => onAddOption(qIdx)}
                  className="text-xs font-bold text-[var(--primary)] hover:underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('contest.addOption')}</span>
                </button>
              )}
            </div>

            {/* Points & Negative Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border)]/40">
              <div>
                <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wider">
                  {t('contest.questionPoints')}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="100"
                  value={q.points || 1}
                  onChange={(e) => onPointsChange(qIdx, parseFloat(e.target.value) || 1)}
                  className="w-32 px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              {enableNegativeMarking && (
                <div>
                  <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-1.5 uppercase tracking-wider">
                    {t('contest.negativePoints')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={q.negativePoints !== undefined ? q.negativePoints : (parseFloat(negativeMarks) || 0.25)}
                    onChange={(e) => onNegativePointsChange(qIdx, parseFloat(e.target.value) || 0)}
                    className="w-32 px-3.5 py-2 text-xs font-bold rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAddQuestion}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-[var(--border)] text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)]/5 hover:border-[var(--primary)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t('contest.addAnotherQuestion')}</span>
        </button>
      </div>
    </div>
  );
}

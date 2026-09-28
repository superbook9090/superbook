'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { QuizImportTool } from '../QuizImportTool';
import type { Question } from '../types';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

type Props = {
  theme: { gradient: string; activeBg: string; activeText: string };
  questions: Question[];
  onImport: (imported: Question[]) => void;
  onQuestionChange: (index: number, field: string, value: string) => void;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onAddQuestion: () => void;
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function QuizQuestionsSection({
  theme,
  questions,
  onImport,
  onQuestionChange,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
  onAddQuestion,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* 1. Quick Import & AI Tools Card */}
      <div className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl">
        <QuizImportTool
          theme={theme}
          onImport={onImport}
          entityType="quiz"
        />
      </div>

      {/* 2. Question Count & Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('createQuizForm.questions')}
          </h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
            {questions.length}
          </span>
        </div>
      </div>

      {/* 3. Question Cards List */}
      <div className="space-y-6">
        {questions.map((question, qIndex) => {
          return (
            <div
              key={qIndex}
              className="p-5 sm:p-7 rounded-[2rem] bg-[var(--card-solid)]/70 backdrop-blur-xl border border-[var(--border)] shadow-xl space-y-5 transition-all hover:border-[var(--primary)]/30"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold text-xs">
                    #{qIndex + 1}
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                    {t('createQuizForm.question')} {qIndex + 1}
                  </span>
                </div>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveQuestion(qIndex)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('createQuizForm.remove')}</span>
                  </button>
                )}
              </div>

              {/* Question Input */}
              <div>
                <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2">
                  {t('createQuizForm.question')} Prompt <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) => onQuestionChange(qIndex, 'question', e.target.value)}
                  rows={2}
                  placeholder={t('createQuizForm.enterQuestion')}
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-[var(--surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all resize-y"
                />
              </div>

              {/* Options */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[var(--color-muted-foreground)]">
                  {t('createQuizForm.options')} & Correct Answer
                </label>

                <div className="space-y-2.5">
                  {question.options.map((option, oIndex) => {
                    const isCorrect = question.correctAnswer === oIndex;
                    const letter = OPTION_LETTERS[oIndex] || `${oIndex + 1}`;

                    return (
                      <div
                        key={oIndex}
                        className={`flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                          isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                            : 'bg-[var(--surface-muted)] border-[var(--border)]'
                        }`}
                      >
                        {/* Radio selection for correct answer */}
                        <button
                          type="button"
                          onClick={() => onQuestionChange(qIndex, 'correctAnswer', oIndex.toString())}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-all cursor-pointer ${
                            isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] border border-[var(--border)]'
                          }`}
                          title="Select as correct answer"
                        >
                          {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : letter}
                        </button>

                        {/* Option Text Input */}
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => onQuestionChange(qIndex, `option${oIndex}`, e.target.value)}
                          placeholder={`${t('createQuizForm.option')} ${letter}`}
                          required
                          className="flex-1 bg-transparent px-2 py-1 text-sm font-medium text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]/60 focus:outline-none"
                        />

                        {isCorrect && (
                          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            {t('createQuizForm.correctAnswerBadge')}
                          </span>
                        )}

                        {question.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => onRemoveOption(qIndex, oIndex)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-muted-foreground)] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0"
                            title="Remove option"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => onAddOption(qIndex)}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('createQuizForm.addOption')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Add Question Action Card */}
      <button
        type="button"
        onClick={onAddQuestion}
        className="w-full py-5 rounded-[2rem] border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] bg-[var(--card-solid)]/40 hover:bg-[var(--primary)]/5 text-[var(--color-muted-foreground)] hover:text-[var(--primary)] flex flex-col sm:flex-row items-center justify-center gap-2 font-bold text-sm transition-all cursor-pointer shadow-sm group"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--surface-muted)] group-hover:bg-[var(--primary)] group-hover:text-white flex items-center justify-center transition-all">
          <Plus className="w-4 h-4" />
        </div>
        <span>{t('createQuizForm.addQuestion')}</span>
      </button>
    </div>
  );
}

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Question } from './types';

type Props = {
  questions: Question[];
  onQuestionChange: (index: number, field: string, value: string) => void;
  onRemoveQuestion: (index: number) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onAddQuestion: () => void;
};

export function QuizQuestionsEditor({
  questions,
  onQuestionChange,
  onRemoveQuestion,
  onAddOption,
  onRemoveOption,
  onAddQuestion,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="max-h-[600px] overflow-y-auto pr-2 space-y-4">
      {questions.map((question, qIndex) => (
        <div key={qIndex} className="bg-[var(--color-accent)] rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.question')} {qIndex + 1}</h4>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveQuestion(qIndex)}
                className="text-[var(--color-error)] hover:opacity-80 text-sm"
              >
                {t('createQuizForm.remove')}
              </button>
            )}
          </div>

          <div className="mb-3">
            <input
              type="text"
              value={question.question}
              onChange={(e) => onQuestionChange(qIndex, 'question', e.target.value)}
              className="px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)]"
              placeholder={t('createQuizForm.enterQuestion')}
              required
            />
          </div>

          <div className="space-y-2">
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={question.correctAnswer === oIndex}
                  onChange={() => onQuestionChange(qIndex, 'correctAnswer', oIndex.toString())}
                  className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)]"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => onQuestionChange(qIndex, `option${oIndex}`, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)]"
                  placeholder={`${t('createQuizForm.option')} ${oIndex + 1}`}
                  required
                />
                {question.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemoveOption(qIndex, oIndex)}
                    className="text-[var(--color-error)] hover:opacity-80 text-sm"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onAddOption(qIndex)}
            className="mt-3 text-sm text-[var(--color-primary)] hover:opacity-80"
          >
            {t('createQuizForm.addOption')}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={onAddQuestion}
        className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-md text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        {t('createQuizForm.addQuestion')}
      </button>
    </div>
  );
}

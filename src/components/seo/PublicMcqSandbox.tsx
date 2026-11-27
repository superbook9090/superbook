'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Trash2, Copy, Check, Play, Edit3, Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { SampleQuizQuestion } from '@/data/seo-guides';
import { PublicInteractiveQuiz } from './PublicInteractiveQuiz';

interface PublicMcqSandboxProps {
  title: string;
  subtitle: string;
  initialQuestions: SampleQuizQuestion[];
}

export function PublicMcqSandbox({
  title,
  subtitle,
  initialQuestions,
}: PublicMcqSandboxProps) {
  const [questions, setQuestions] = useState<SampleQuizQuestion[]>(initialQuestions);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [copied, setCopied] = useState(false);

  const updateQuestion = (index: number, patch: Partial<SampleQuizQuestion>) => {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const nextOpts = [...q.options] as [string, string, string, string];
        nextOpts[optIndex] = value;
        return { ...q, options: nextOpts };
      })
    );
  };

  const addQuestion = () => {
    if (questions.length >= 10) return;
    setQuestions((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        subject: 'Custom Topic',
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const copyFormatted = () => {
    const formatted = questions
      .map((q, idx) => {
        const opts = q.options
          .map((o, oi) => `  ${String.fromCharCode(65 + oi)}) ${o || 'Option'}`)
          .join('\n');
        const ans = String.fromCharCode(65 + q.correctIndex);
        return `Q${idx + 1}. ${q.question || 'Untitled Question'}\n${opts}\nAnswer: ${ans}${
          q.explanation ? `\nExplanation: ${q.explanation}` : ''
        }`;
      })
      .join('\n\n');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validPreviewQuestions = questions.filter(
    (q) => q.question.trim() && q.options.every((o) => o.trim())
  );

  return (
    <section
      aria-label={title}
      className="rounded-3xl border border-[var(--border)] bg-[var(--card-solid)] p-6 sm:p-8 shadow-[var(--shadow-sm)] space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--teacher-primary)]">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            <span>Live Interactive Tool • Free Without Login</span>
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-foreground)] mt-1">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-1">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mode === 'edit'
                  ? 'bg-[var(--card-solid)] text-[var(--color-foreground)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit ({questions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`inline-flex items-center gap-1.5 min-h-[38px] px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                mode === 'preview'
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Live Student Preview</span>
            </button>
          </div>

          <button
            type="button"
            onClick={copyFormatted}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-muted-strong)] text-xs font-bold text-[var(--color-foreground)] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy MCQs'}</span>
          </button>
        </div>
      </div>

      {mode === 'preview' ? (
        <PublicInteractiveQuiz
          title="Live Student Preview"
          subtitle="Answer your drafted questions below exactly as students experience them on Quiz Do."
          questions={validPreviewQuestions.length > 0 ? validPreviewQuestions : initialQuestions}
          compact
        />
      ) : (
        <div className="space-y-4">
          {questions.map((q, qIdx) => (
            <div
              key={q.id}
              className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-muted)]/40 border border-[var(--border)] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  Question {qIdx + 1}
                </span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(qIdx)}
                    aria-label={`Remove question ${qIdx + 1}`}
                    className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="text"
                value={q.question}
                onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                placeholder="Type your multiple-choice question here..."
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-sm font-semibold text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isCorrect = q.correctIndex === optIdx;
                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-[var(--card-solid)] ${
                        isCorrect ? 'border-emerald-500/60' : 'border-[var(--border)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={isCorrect}
                        onChange={() => updateQuestion(qIdx, { correctIndex: optIdx })}
                        aria-label={`Mark option ${String.fromCharCode(65 + optIdx)} correct`}
                        className="accent-emerald-600 cursor-pointer shrink-0"
                      />
                      <span className="text-xs font-bold text-[var(--color-muted-foreground)] shrink-0">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                        className="w-full bg-transparent text-xs sm:text-sm text-[var(--color-foreground)] focus:outline-none"
                      />
                    </div>
                  );
                })}
              </div>

              <input
                type="text"
                value={q.explanation}
                onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
                placeholder="Optional explanation shown to students after answering..."
                className="w-full px-3.5 py-2 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-xs text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={addQuestion}
              disabled={questions.length >= 10}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[var(--surface-muted-strong)] disabled:opacity-50 text-xs sm:text-sm font-bold text-[var(--color-foreground)] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question ({questions.length}/10)</span>
            </button>

            <Link
              href={`${ROUTES.register}?role=teacher`}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2 rounded-xl bg-[var(--primary)] text-white text-xs sm:text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <span>Publish Full Timed Quiz Free on Quiz Do</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

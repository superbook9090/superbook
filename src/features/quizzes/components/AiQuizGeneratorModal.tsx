'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, AlertCircle, HelpCircle, Globe, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Question } from './types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (questions: Question[]) => void;
  theme: { gradient: string; activeBg: string; activeText: string };
};

export function AiQuizGeneratorModal({ isOpen, onClose, onSuccess, theme }: Props) {
  const { t } = useTranslation();

  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [language, setLanguage] = useState('English');
  const [instructions, setInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!topic.trim()) {
      setErrorMsg(t('aiQuiz.topicRequired') || 'Please enter a quiz topic or subject.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/quizzes/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          numQuestions: Math.min(10, Math.max(1, numQuestions)),
          difficulty,
          language,
          instructions: instructions.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t('aiQuiz.generationFailed') || 'Failed to generate quiz.');
      }

      if (data.usage) {
        setUsageInfo(data.usage);
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        onSuccess(data.questions);
        onClose();
      } else {
        throw new Error(t('aiQuiz.noQuestionsReturned') || 'No questions returned from AI generator.');
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('aiQuiz.generationError') || 'An error occurred during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] bg-gradient-to-r ${theme.gradient} text-white`}>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold leading-tight">
                  {t('aiQuiz.modalTitle') || 'Generate Quiz with AI'}
                </h3>
                <p className="text-xs text-white/80">
                  {t('aiQuiz.modalSubtitle') || 'Instantly create multiple choice questions using Google Gemini'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[var(--color-error-light)] border border-[var(--color-error)]/30 text-[var(--color-error)] text-xs sm:text-sm font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {usageInfo && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
                <span>{t('aiQuiz.usageInfo') || 'AI Generations Quota:'}</span>
                <span className="font-bold text-[var(--color-foreground)]">
                  {usageInfo.used} / {usageInfo.limit} ({usageInfo.remaining} {t('aiQuiz.remaining') || 'remaining'})
                </span>
              </div>
            )}

            {/* Topic Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                  {t('aiQuiz.topicLabel') || 'Quiz Topic / Subject'} <span className="text-[var(--color-error)]">*</span>
                </span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    void handleGenerate(e);
                  }
                }}
                placeholder={t('aiQuiz.topicPlaceholder') || 'e.g., Photosynthesis and Cellular Respiration'}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>

            {/* Number of Questions & Difficulty Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Number of Questions (Max 10) */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" />
                    {t('aiQuiz.numQuestionsLabel') || 'Number of Questions'} (Max 10)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                    className="w-full accent-[var(--color-primary)] cursor-pointer"
                  />
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-sm font-bold text-[var(--color-foreground)] shrink-0 border border-[var(--color-border)]">
                    {numQuestions}
                  </span>
                </div>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[var(--color-primary)]" />
                    {t('aiQuiz.difficultyLabel') || 'Difficulty Level'}
                  </span>
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="easy">{t('aiQuiz.easy') || 'Easy'}</option>
                  <option value="medium">{t('aiQuiz.medium') || 'Medium'}</option>
                  <option value="hard">{t('aiQuiz.hard') || 'Hard'}</option>
                </select>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[var(--color-primary)]" />
                  {t('aiQuiz.languageLabel') || 'Language'}
                </span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Hinglish">Hinglish (Hindi in Roman script)</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
              </select>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                {t('aiQuiz.instructionsLabel') || 'Additional Context / Prompt (Optional)'}
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder={t('aiQuiz.instructionsPlaceholder') || 'e.g., Focus on light-dependent reactions and ATP synthesis'}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
              <button
                type="button"
                onClick={onClose}
                disabled={isGenerating}
                className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--color-border)] text-[var(--color-foreground)] hover:bg-[var(--color-accent)] transition-colors disabled:opacity-50"
              >
                {t('common.cancel') || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className={`inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('aiQuiz.generating') || 'Generating Quiz...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t('aiQuiz.generateBtn') || 'Generate Questions'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

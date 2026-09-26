'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, AlertCircle, HelpCircle, Globe, SlidersHorizontal, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { Question } from './types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (questions: Question[]) => void;
  theme: { gradient: string; activeBg: string; activeText: string };
  entityType?: 'quiz' | 'contest';
};

function sanitizeAiErrorMessage(rawMsg: string, fallback: string): string {
  if (!rawMsg) return fallback;
  const isTechnical =
    rawMsg.includes('models/') ||
    rawMsg.includes('API version') ||
    rawMsg.includes('gemini-') ||
    rawMsg.includes('openrouter') ||
    rawMsg.includes('Provider returned error') ||
    rawMsg.includes('RESOURCE_EXHAUSTED') ||
    rawMsg.includes('prepayment credits') ||
    rawMsg.includes('Interactions API') ||
    rawMsg.includes('fetch failed') ||
    rawMsg.includes('HTTP ') ||
    rawMsg.includes('Failed to generate quiz:');

  return isTechnical ? fallback : rawMsg;
}

export function AiQuizGeneratorModal({ isOpen, onClose, onSuccess, theme, entityType = 'quiz' }: Props) {
  const { t } = useTranslation();
  const isContest = entityType === 'contest';
  const globalMaxQuestions = useSettingsStore(
    (s) => s.settings.teacherLimits?.aiQuizMaxQuestions ?? 10
  );
  const [maxAllowedQuestions, setMaxAllowedQuestions] = useState<number>(() => Math.max(1, globalMaxQuestions));
  const [hasCustomLimit, setHasCustomLimit] = useState(false);

  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState<number>(() => Math.min(maxAllowedQuestions, 10));
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [language, setLanguage] = useState('English');
  const [instructions, setInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [usageInfo, setUsageInfo] = useState<{ used: number; limit: number; remaining: number } | null>(null);

  // Sync with global store fallback if no custom override is set
  useEffect(() => {
    if (!hasCustomLimit) {
      setMaxAllowedQuestions(Math.max(1, globalMaxQuestions));
    }
  }, [globalMaxQuestions, hasCustomLimit]);

  // Fetch teacher's live quota and custom allowed questions from server
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    fetch('/api/quizzes/generate-ai')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (typeof data.maxQuestions === 'number' && data.maxQuestions >= 1) {
          setMaxAllowedQuestions(data.maxQuestions);
          if (data.hasCustomMaxQuestions) {
            setHasCustomLimit(true);
          }
        }
        if (data.usage) {
          setUsageInfo(data.usage);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isGenerating) return;
    if (!topic.trim()) {
      setErrorMsg(
        isContest
          ? t('contest.topicRequired')
          : t('aiQuiz.topicRequired')
      );
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
          numQuestions: Math.min(maxAllowedQuestions, Math.max(1, numQuestions)),
          difficulty,
          language,
          instructions: instructions.trim() || undefined,
          entityType,
        }),
      });

      const data = await res.json().catch(() => ({}));
      const fallbackError = isContest
        ? t('contest.generationFailed')
        : t('aiQuiz.generationFailed');

      if (!res.ok) {
        throw new Error(sanitizeAiErrorMessage(data?.message, fallbackError));
      }

      if (data.usage) {
        setUsageInfo(data.usage);
      }

      if (Array.isArray(data.questions) && data.questions.length > 0) {
        onSuccess(data.questions);
        onClose();
      } else {
        throw new Error(t('aiQuiz.noQuestionsReturned'));
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      const fallbackError = isContest
        ? t('contest.generationFailed')
        : t('aiQuiz.generationFailed');
      setErrorMsg(sanitizeAiErrorMessage(raw, fallbackError));
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
                  {isContest
                    ? t('contest.aiModalTitle')
                    : t('aiQuiz.modalTitle')}
                </h3>
                <p className="text-xs text-white/80">
                  {isContest
                    ? t('contest.aiModalSubtitle')
                    : t('aiQuiz.modalSubtitle')}
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
                <span>{t('aiQuiz.usageInfo')}</span>
                <span className="font-bold text-[var(--color-foreground)]">
                  {usageInfo.used} / {usageInfo.limit} ({usageInfo.remaining} {t('aiQuiz.remaining')})
                </span>
              </div>
            )}

            {/* Topic Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                  {isContest
                    ? t('contest.topicLabel')
                    : t('aiQuiz.topicLabel')} <span className="text-[var(--color-error)]">*</span>
                </span>
              </label>
              <input
                type="text"
                value={topic}
                disabled={isGenerating}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!isGenerating) void handleGenerate(e);
                  }
                }}
                placeholder={
                  isContest
                    ? t('contest.topicPlaceholder')
                    : t('aiQuiz.topicPlaceholder')
                }
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Number of Questions Slider */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                  <span className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" />
                    {t('aiQuiz.numQuestionsLabel')} (Max {maxAllowedQuestions})
                  </span>
                </label>
                {hasCustomLimit && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--color-primary)] text-[10px] font-bold border border-[var(--color-primary)]/20 shadow-2xs">
                    <Sparkles className="w-3 h-3" />
                    {t('aiQuiz.customLimitActive')}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={maxAllowedQuestions}
                  value={Math.min(numQuestions, maxAllowedQuestions)}
                  disabled={isGenerating}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                  className="w-full accent-[var(--color-primary)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-sm font-bold text-[var(--color-foreground)] shrink-0 border border-[var(--color-border)]">
                  {Math.min(numQuestions, maxAllowedQuestions)}
                </span>
              </div>
            </div>

            {/* Difficulty Level & Language Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Difficulty Level */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[var(--color-primary)]" />
                    {t('aiQuiz.difficultyLabel')}
                  </span>
                </label>
                <select
                  value={difficulty}
                  disabled={isGenerating}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="easy">{t('aiQuiz.easy')}</option>
                  <option value="medium">{t('aiQuiz.medium')}</option>
                  <option value="hard">{t('aiQuiz.hard')}</option>
                </select>
              </div>

              {/* Language Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[var(--color-primary)]" />
                    {t('aiQuiz.languageLabel')}
                  </span>
                </label>
                <select
                  value={language}
                  disabled={isGenerating}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Hinglish">Hinglish (Hindi in Roman script)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                  <option value="German">German (Deutsch)</option>
                </select>
              </div>
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[var(--color-foreground)] mb-1.5">
                {t('aiQuiz.instructionsLabel')}
              </label>
              <textarea
                value={instructions}
                disabled={isGenerating}
                onChange={(e) => setInstructions(e.target.value)}
                rows={2}
                placeholder={t('aiQuiz.instructionsPlaceholder')}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none disabled:opacity-60 disabled:cursor-not-allowed"
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
                {t('common.cancel')}
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
                    <span>
                      {isContest
                        ? t('contest.generating')
                        : t('aiQuiz.generating')}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isContest
                        ? t('contest.generateBtn')
                        : t('aiQuiz.generateBtn')}
                    </span>
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

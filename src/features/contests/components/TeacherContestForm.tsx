'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import {
  useCreateContest,
  useUpdateContest,
  useContest,
} from '@/features/contests/hooks/useContests';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  Trophy,
  Clock,
  Plus,
  Trash2,
  Award,
  Shield,
  Layers,
  Save,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import type { ContestPrize } from '@/lib/api/contests';

interface TeacherContestFormProps {
  contestId?: string;
}

interface FormQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export function TeacherContestForm({ contestId }: TeacherContestFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();

  const isEdit = Boolean(contestId);
  const { data: existingData, isLoading: fetchingExisting } = useContest(contestId);
  const createMutation = useCreateContest();
  const updateMutation = useUpdateContest();

  // Basic Info State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [scheduleType, setScheduleType] = useState<'one_time' | 'daily' | 'weekly'>('one_time');

  // Timing State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [solutionsReleaseAt, setSolutionsReleaseAt] = useState('');

  // Settings State
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'organization' | 'unlisted'>('public');
  const [leaderboardVisibility, setLeaderboardVisibility] = useState<'live' | 'after_end' | 'hidden'>('live');

  // Prizes State
  const [prizes, setPrizes] = useState<ContestPrize[]>([
    { rank: 1, title: '1st Place Trophy & Certificate', rewardType: 'trophy', value: 'Winner' },
    { rank: 2, title: 'Runner-up Certificate', rewardType: 'certificate', value: '2nd Place' },
    { rank: 3, title: '3rd Place Certificate', rewardType: 'certificate', value: '3rd Place' },
  ]);

  // Questions State
  const [questions, setQuestions] = useState<FormQuestion[]>([
    {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
    },
  ]);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && existingData?.contest) {
      const c = existingData.contest;
      setTitle(c.title || '');
      setDescription(c.description || '');
      setInstructions(c.instructions || '');
      setScheduleType(c.scheduleType || 'one_time');
      setDuration(String(c.duration || 30));
      setMaxAttempts(String(c.maxAttempts || 1));
      setMaxParticipants(c.maxParticipants ? String(c.maxParticipants) : '');
      setVisibility(c.visibility || 'public');
      setLeaderboardVisibility(c.leaderboardVisibility || 'live');
      if (c.prizes && c.prizes.length > 0) {
        setPrizes(c.prizes);
      }

      // Format ISO string to datetime-local input
      if (c.startTime) {
        setStartTime(new Date(c.startTime).toISOString().slice(0, 16));
      }
      if (c.endTime) {
        setEndTime(new Date(c.endTime).toISOString().slice(0, 16));
      }
      if (c.solutionsReleaseAt) {
        setSolutionsReleaseAt(new Date(c.solutionsReleaseAt).toISOString().slice(0, 16));
      }
    }
  }, [isEdit, existingData]);

  // Prize Handlers
  const handleAddPrize = () => {
    const nextRank = prizes.length + 1;
    setPrizes((prev) => [
      ...prev,
      { rank: nextRank, title: `Rank #${nextRank} Reward`, rewardType: 'certificate' },
    ]);
  };

  const handleUpdatePrize = (index: number, field: keyof ContestPrize, value: unknown) => {
    setPrizes((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, [field]: value } : p))
    );
  };

  const handleRemovePrize = (index: number) => {
    setPrizes((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Question Handlers
  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 },
    ]);
  };

  const handleQuestionChange = (index: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, question: text } : q))
    );
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex
          ? {
              ...q,
              options: q.options.map((opt, oIdx) => (oIdx === optIndex ? text : opt)),
            }
          : q
      )
    );
  };

  const handleSetCorrectAnswer = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, correctAnswer: optIndex } : q))
    );
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q
      )
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex || q.options.length <= 2) return q;
        const nextOpts = q.options.filter((_, oIdx) => oIdx !== optIndex);
        return {
          ...q,
          options: nextOpts,
          correctAnswer: q.correctAnswer >= nextOpts.length ? 0 : q.correctAnswer,
        };
      })
    );
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      addAlert({ type: 'error', message: 'Contest title is required' });
      return;
    }
    if (!startTime || !endTime) {
      addAlert({ type: 'error', message: 'Start and End times are required' });
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
      addAlert({ type: 'error', message: 'End time must be after start time' });
      return;
    }

    if (!isEdit) {
      // Validate questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) {
          addAlert({ type: 'error', message: `Question #${i + 1} prompt is required` });
          return;
        }
        for (let j = 0; j < q.options.length; j++) {
          if (!q.options[j].trim()) {
            addAlert({ type: 'error', message: `Option ${j + 1} in Question #${i + 1} cannot be empty` });
            return;
          }
        }
      }
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      instructions: instructions.trim() || undefined,
      scheduleType,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      duration: parseInt(duration, 10) || 30,
      solutionsReleaseAt: solutionsReleaseAt
        ? new Date(solutionsReleaseAt).toISOString()
        : new Date(endTime).toISOString(),
      maxAttempts: parseInt(maxAttempts, 10) || 1,
      maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
      visibility,
      leaderboardVisibility,
      prizes,
      ...(!isEdit
        ? {
            questions: questions.map((q) => ({
              question: q.question.trim(),
              options: q.options.map((o) => o.trim()),
              correctAnswer: q.correctAnswer,
              points: q.points || 1,
            })),
          }
        : {}),
    };

    try {
      if (isEdit && contestId) {
        await updateMutation.mutateAsync({ id: contestId, data: payload });
        addAlert({ type: 'success', message: 'Contest updated successfully!' });
      } else {
        await createMutation.mutateAsync(payload);
        addAlert({ type: 'success', message: 'Contest created and scheduled successfully!' });
      }
      router.push('/dashboard/teacher/contests');
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : 'Failed to save contest';
      addAlert({ type: 'error', message: msg });
    }
  };

  if (isEdit && fetchingExisting) {
    return <PageSkeleton />;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* 1. Basic Information */}
      <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-sm font-bold text-[var(--color-foreground)]">
          <Trophy className="w-4 h-4 text-[var(--primary)]" />
          <span>{t('contest.basicInfo') || '1. Contest Overview'}</span>
        </div>

        <div className="space-y-4">
          <TextField
            label={t('contest.title') || 'Contest Title *'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. National Mathematics Olympiad 2026"
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.description') || 'Description'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of the competition..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.instructions') || 'Contest Guidelines & Rules'}
            </label>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Rules, scoring guidelines, time limits, anti-cheat policy..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.scheduleType') || 'Contest Frequency / Recurrence'}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['one_time', 'daily', 'weekly'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setScheduleType(type)}
                  className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                    scheduleType === type
                      ? 'bg-[var(--primary-light)] border-[var(--primary)] text-[var(--primary)] shadow-xs'
                      : 'bg-[var(--color-surface-muted)] border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  {type.replace('_', '-')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Timing & Solutions Release */}
      <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-sm font-bold text-[var(--color-foreground)]">
          <Clock className="w-4 h-4 text-[var(--primary)]" />
          <span>{t('contest.timingAndSchedule') || '2. Schedule & Solutions Release'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.startTime') || 'Fixed Start Date & Time *'}
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.endTime') || 'Fixed End Date & Time *'}
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.durationMinutes') || 'Attempt Duration (Minutes) *'}
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.solutionsReleaseTime') || 'Solutions Unlock Time (Optional)'}
            </label>
            <input
              type="datetime-local"
              value={solutionsReleaseAt}
              onChange={(e) => setSolutionsReleaseAt(e.target.value)}
              placeholder="Defaults to Contest End Time"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none"
            />
            <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
              {t('contest.solutionsLockedHint') || 'Answers remain strictly locked for students until this exact time.'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Prizes & Rewards */}
      <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
            <Award className="w-4 h-4 text-[var(--warning)]" />
            <span>{t('contest.prizesBuilder') || '3. Prizes & Rewards Showcase'}</span>
          </div>
          <button
            type="button"
            onClick={handleAddPrize}
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:opacity-80"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('contest.addPrize') || 'Add Prize Tier'}</span>
          </button>
        </div>

        <div className="space-y-3">
          {prizes.map((prize, pIdx) => (
            <div
              key={pIdx}
              className="p-3.5 rounded-2xl bg-[var(--color-surface-muted)]/50 border border-[var(--border)] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
            >
              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                  {t('contest.rank') || 'Rank'}
                </label>
                <input
                  type="text"
                  value={String(prize.rank)}
                  onChange={(e) => handleUpdatePrize(pIdx, 'rank', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] font-bold text-[var(--color-foreground)]"
                  placeholder="1 or 1-3"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                  {t('contest.prizeTitle') || 'Prize Title'}
                </label>
                <input
                  type="text"
                  value={prize.title}
                  onChange={(e) => handleUpdatePrize(pIdx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                  placeholder="e.g. Gold Trophy + Certificate"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                  {t('contest.rewardType') || 'Reward Type'}
                </label>
                <select
                  value={prize.rewardType || 'trophy'}
                  onChange={(e) => handleUpdatePrize(pIdx, 'rewardType', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                >
                  <option value="trophy">🏆 Trophy</option>
                  <option value="certificate">📜 Certificate</option>
                  <option value="cash">💵 Cash / Voucher</option>
                  <option value="points">⭐ Points</option>
                  <option value="gift">🎁 Gift Hamper</option>
                  <option value="badge">🎖️ Badge</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-[var(--color-muted)] mb-0.5">
                  {t('contest.value') || 'Value'}
                </label>
                <input
                  type="text"
                  value={prize.value || ''}
                  onChange={(e) => handleUpdatePrize(pIdx, 'value', e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                  placeholder="e.g. ₹5,000"
                />
              </div>

              <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                <button
                  type="button"
                  onClick={() => handleRemovePrize(pIdx)}
                  className="p-1.5 text-[var(--error)] hover:bg-[var(--error-light)] rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Settings & Permissions */}
      <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-sm font-bold text-[var(--color-foreground)]">
          <Shield className="w-4 h-4 text-[var(--primary)]" />
          <span>{t('contest.settings') || '4. Contest Rules & Visibility'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.maxAttempts') || 'Max Attempts Allowed'}
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.maxParticipants') || 'Participant Capacity (Optional)'}
            </label>
            <input
              type="number"
              min="1"
              placeholder="Leave blank for unlimited"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.visibility') || 'Contest Visibility'}
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'organization' | 'unlisted')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
            >
              <option value="public">Public (Open Platform-wide)</option>
              <option value="organization">Organization Members Only</option>
              <option value="unlisted">Unlisted (Direct link only)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('contest.leaderboardVisibility') || 'Leaderboard Display'}
            </label>
            <select
              value={leaderboardVisibility}
              onChange={(e) => setLeaderboardVisibility(e.target.value as 'live' | 'after_end' | 'hidden')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)]"
            >
              <option value="live">Live (Real-time ranks during contest)</option>
              <option value="after_end">After End (Reveal only when contest ends)</option>
              <option value="hidden">Hidden (Teacher only)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Questions Builder (only when creating or draft) */}
      {!isEdit && (
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
                      onClick={() => handleRemoveQuestion(qIdx)}
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
                  onChange={(e) => handleQuestionChange(qIdx, e.target.value)}
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
                        onChange={() => handleSetCorrectAnswer(qIdx, optIdx)}
                        className="w-4 h-4 text-[var(--primary)]"
                        title="Mark as correct answer"
                      />
                      <span className="w-6 text-xs font-bold text-[var(--color-muted)] font-mono">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(qIdx, optIdx, e.target.value)}
                        placeholder={`Option ${optIdx + 1}`}
                        required
                        className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)]"
                      />
                      {q.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(qIdx, optIdx)}
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
                      onClick={() => handleAddOption(qIdx)}
                      className="text-xs font-bold text-[var(--primary)] hover:opacity-80 pt-1 block"
                    >
                      {t('contest.addOption') || '+ Add Option'}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddQuestion}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-[var(--border)] text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary-light)]/20 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('contest.addAnotherQuestion') || 'Add Another Question'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/dashboard/teacher/contests')}
        >
          {t('common.cancel') || 'Cancel'}
        </Button>

        <Button type="submit" disabled={isSaving} className="min-w-[160px]">
          <Save className="w-4 h-4" />
          <span>
            {isSaving
              ? 'Saving...'
              : isEdit
              ? t('contest.updateContest') || 'Update Contest'
              : t('contest.publishContest') || 'Publish & Schedule'}
          </span>
        </Button>
      </div>
    </form>
  );
}

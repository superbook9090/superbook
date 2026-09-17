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
  CalendarDays,
  Timer,
} from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import type { ContestPrize } from '@/lib/api/contests';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { QuizImportTool } from '@/features/quizzes/components/QuizImportTool';
import type { Question } from '@/features/quizzes/components/types';

interface TeacherContestFormProps {
  contestId?: string;
}

interface FormQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  negativePoints?: number;
}

export function TeacherContestForm({ contestId }: TeacherContestFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();
  const { theme } = useRoleTheme();

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
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState('0.25');

  // Questions are editable when creating or when contest is in draft or upcoming status
  const canEditQuestions =
    !isEdit ||
    (existingData?.contest?.computedState !== 'live' &&
      existingData?.contest?.computedState !== 'completed' &&
      existingData?.contest?.computedState !== 'cancelled');

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
      if (c.enableNegativeMarking !== undefined) {
        setEnableNegativeMarking(Boolean(c.enableNegativeMarking));
      }
      if (c.negativeMarks !== undefined) {
        setNegativeMarks(String(c.negativeMarks));
      }

      if (c.questionsForEditor && c.questionsForEditor.length > 0) {
        const allLoadedQuestions: FormQuestion[] = [];
        for (const group of c.questionsForEditor) {
          for (const q of (group.questions as Array<{
            // DB stores fields as prompt/correctOption
            prompt?: string;
            question?: string;
            options: string[];
            correctOption?: number;
            correctAnswer?: number;
            points?: number;
            negativePoints?: number;
          }> || [])) {
            allLoadedQuestions.push({
              // Support both legacy (question/correctAnswer) and current (prompt/correctOption) field names
              question: q.prompt || q.question || '',
              options: q.options || ['', '', '', ''],
              correctAnswer: typeof q.correctOption === 'number'
                ? q.correctOption
                : typeof q.correctAnswer === 'number'
                ? q.correctAnswer
                : 0,
              points: q.points || 1,
              negativePoints: q.negativePoints,
            });
          }
        }
        if (allLoadedQuestions.length > 0) {
          setQuestions(allLoadedQuestions);
        }
      }

      if (c.prizes && c.prizes.length > 0) {
        setPrizes(c.prizes);
      }

      // Format UTC ISO string to local datetime-local value (YYYY-MM-DDTHH:mm)
      const toLocalDateTimeInput = (isoStr: string) => {
        const d = new Date(isoStr);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      };

      if (c.startTime) {
        setStartTime(toLocalDateTimeInput(String(c.startTime)));
      }
      if (c.endTime) {
        setEndTime(toLocalDateTimeInput(String(c.endTime)));
      }
      if (c.solutionsReleaseAt) {
        setSolutionsReleaseAt(toLocalDateTimeInput(String(c.solutionsReleaseAt)));
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
      {
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        points: 1,
        negativePoints: enableNegativeMarking ? parseFloat(negativeMarks) || 0.25 : undefined,
      },
    ]);
  };

  const handleImportQuestions = (imported: Question[]) => {
    const defaultNeg = enableNegativeMarking ? parseFloat(negativeMarks) || 0.25 : undefined;
    const formatted: FormQuestion[] = imported.map((q) => ({
      question: q.question,
      options: q.options && q.options.length >= 2 ? q.options : ['', ''],
      correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
      points: q.points && q.points > 0 ? q.points : 1,
      negativePoints: q.negativePoints !== undefined ? q.negativePoints : defaultNeg,
    }));

    setQuestions((prev) => {
      const isDefaultSingleEmpty =
        prev.length === 1 &&
        !prev[0].question.trim() &&
        prev[0].options.every((opt) => !opt.trim());
      return isDefaultSingleEmpty ? formatted : [...prev, ...formatted];
    });

    addAlert({
      type: 'success',
      message: (
        t('contest.importQuestionsSuccess') || 'Successfully loaded {count} questions!'
      ).replace('{count}', String(formatted.length)),
    });
  };

  const handlePointsChange = (qIndex: number, val: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, points: Math.max(0.5, val) } : q))
    );
  };

  const handleNegativePointsChange = (qIndex: number, val: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex ? { ...q, negativePoints: Math.max(0, val) } : q))
    );
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

    if (!isEdit || canEditQuestions) {
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
      enableNegativeMarking,
      negativeMarks: enableNegativeMarking ? parseFloat(negativeMarks) || 0.25 : undefined,
      prizes,
      ...((!isEdit || canEditQuestions)
        ? {
            questions: questions.map((q) => ({
              question: q.question.trim(),
              options: q.options.map((o) => o.trim()),
              correctAnswer: q.correctAnswer,
              points: q.points || 1,
              negativePoints: enableNegativeMarking
                ? (q.negativePoints !== undefined ? q.negativePoints : parseFloat(negativeMarks) || 0.25)
                : undefined,
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
          {/* Start Time */}
          <div className="group">
            <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
              {t('contest.startTime') || 'Start Date & Time *'}
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* End Time */}
          <div className="group">
            <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
              {t('contest.endTime') || 'End Date & Time *'}
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="group">
            <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
              {t('contest.durationMinutes') || 'Attempt Duration (Minutes) *'}
            </label>
            <div className="relative">
              <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          {/* Solutions Release */}
          <div className="group">
            <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
              {t('contest.solutionsReleaseTime') || 'Solutions Unlock Time (Optional)'}
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="datetime-local"
                value={solutionsReleaseAt}
                onChange={(e) => setSolutionsReleaseAt(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
              {t('contest.solutionsLockedHint') || 'Answers remain locked for students until this time. Defaults to end time.'}
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

          {/* Negative Marking Configuration */}
          <div className="sm:col-span-2 p-4 rounded-2xl border border-[var(--border)] bg-[var(--color-surface-muted)]/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="enableNegativeMarking" className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="enableNegativeMarking"
                    name="enableNegativeMarking"
                    checked={enableNegativeMarking}
                    onChange={(e) => setEnableNegativeMarking(e.target.checked)}
                    className="h-4 w-4 text-[var(--primary)] focus:ring-[var(--primary)] border-[var(--border)] rounded cursor-pointer"
                  />
                  <span>{t('contest.enableNegativeMarking') || 'Enable Negative Marking'}</span>
                </label>
                <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 ml-6">
                  {t('contest.negativeMarkingDesc') || 'Deduct marks for incorrect answers to simulate competitive exam grading.'}
                </p>
              </div>
            </div>

            {enableNegativeMarking && (
              <div className="pt-2 border-t border-[var(--border)] space-y-3 ml-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1.5">
                    {t('contest.negativeMarks') || 'Penalty per incorrect answer'}
                  </label>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {[
                      { label: t('contest.negativeMarksPresetQuarter') || '1/4 (-0.25)', value: '0.25' },
                      { label: t('contest.negativeMarksPresetThird') || '1/3 (-0.33)', value: '0.33' },
                      { label: t('contest.negativeMarksPresetHalf') || '1/2 (-0.5)', value: '0.5' },
                      { label: t('contest.negativeMarksPresetOne') || '1 (-1.0)', value: '1' },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setNegativeMarks(preset.value)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                          negativeMarks === preset.value
                            ? 'bg-[var(--primary)] text-white border-transparent'
                            : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border-[var(--border)] hover:bg-[var(--color-surface-muted)]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={negativeMarks}
                    onChange={(e) => setNegativeMarks(e.target.value)}
                    placeholder="0.25"
                    className="w-32 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:ring-1 focus:ring-[var(--primary)]"
                  />
                  <span className="text-[11px] text-[var(--color-muted)] block mt-1">
                    {t('contest.negativeMarksHint') || 'Unattempted / skipped questions receive 0 deduction.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Questions Builder */}
      {canEditQuestions ? (
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

          {/* Import Questions Tool (Identical to Quiz Creator: Excel/CSV, pipe text, AI generator) */}
          <QuizImportTool theme={theme} onImport={handleImportQuestions} entityType="contest" />

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

                {/* Question Points and Negative Penalty */}
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
                      onChange={(e) => handlePointsChange(qIdx, parseFloat(e.target.value) || 1)}
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
                        onChange={(e) => handleNegativePointsChange(qIdx, parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-1.5 text-xs rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                      />
                    </div>
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
      ) : (
        <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-foreground)]">
            <Layers className="w-4 h-4 text-[var(--primary)]" />
            <span>{t('contest.questionsBuilder') || '5. Contest Questions'}</span>
          </div>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {t('contest.questionsLockedDuringContest') || 'Questions cannot be modified once the contest has started or completed.'}
          </p>
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

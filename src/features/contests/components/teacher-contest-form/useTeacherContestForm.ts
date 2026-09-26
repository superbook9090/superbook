'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import {
  useCreateContest,
  useUpdateContest,
  useContest,
} from '@/features/contests/hooks/useContests';
import type {
  FormQuestion,
  ScheduleType,
  VisibilityType,
  LeaderboardVisibilityType,
} from './types';
import { fetchDailyQuizCounter, toLocalDateTimeInput } from './autofillUtils';
import { useContestPrizesState } from './useContestPrizesState';
import { useContestQuestionsState } from './useContestQuestionsState';
import { submitContest } from './submitUtils';

export function useTeacherContestForm(contestId?: string) {
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
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<ScheduleType>('one_time');

  // Timing State
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState('30');
  const [solutionsReleaseAt, setSolutionsReleaseAt] = useState('');

  // Settings State
  const [maxAttempts, setMaxAttempts] = useState('1');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [visibility, setVisibility] = useState<VisibilityType>('public');
  const [leaderboardVisibility, setLeaderboardVisibility] = useState<LeaderboardVisibilityType>('live');
  const [enableNegativeMarking, setEnableNegativeMarking] = useState(false);
  const [negativeMarks, setNegativeMarks] = useState('0.25');
  const [notifyAllStudents, setNotifyAllStudents] = useState(true);
  const [triggerAiModalOpen, setTriggerAiModalOpen] = useState(0);

  const canEditQuestions =
    !isEdit ||
    (existingData?.contest?.computedState !== 'live' &&
      existingData?.contest?.computedState !== 'completed' &&
      existingData?.contest?.computedState !== 'cancelled');

  const { prizes, setPrizes, handleAddPrize, handleUpdatePrize, handleRemovePrize } = useContestPrizesState();
  const { setQuestions, ...questionsState } = useContestQuestionsState(enableNegativeMarking, negativeMarks);

  // Pre-fill form if editing
  useEffect(() => {
    if (isEdit && existingData?.contest) {
      const c = existingData.contest;
      setTitle(c.title || '');
      setDescription(c.description || '');
      setInstructions(c.instructions || '');
      setSlug(c.slug || '');
      setMetaTitle(c.metaTitle || '');
      setMetaDescription(c.metaDescription || '');
      setScheduleType(c.scheduleType || 'one_time');
      setDuration(String(c.duration || 30));
      setMaxAttempts(String(c.maxAttempts || 1));
      setMaxParticipants(c.maxParticipants ? String(c.maxParticipants) : '');
      setVisibility(c.visibility || 'public');
      setLeaderboardVisibility(c.leaderboardVisibility || 'live');
      if (c.enableNegativeMarking !== undefined) setEnableNegativeMarking(Boolean(c.enableNegativeMarking));
      if (c.negativeMarks !== undefined) setNegativeMarks(String(c.negativeMarks));

      if (c.questionsForEditor && c.questionsForEditor.length > 0) {
        const allLoaded: FormQuestion[] = [];
        for (const group of c.questionsForEditor) {
          for (const q of (group.questions as Array<{
            prompt?: string;
            question?: string;
            options: string[];
            correctOption?: number;
            correctAnswer?: number;
            points?: number;
            negativePoints?: number;
          }> || [])) {
            allLoaded.push({
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
        if (allLoaded.length > 0) setQuestions(allLoaded);
      }

      if (c.prizes && c.prizes.length > 0) setPrizes(c.prizes);
      if (c.startTime) setStartTime(toLocalDateTimeInput(new Date(c.startTime)));
      if (c.endTime) setEndTime(toLocalDateTimeInput(new Date(c.endTime)));
      if (c.solutionsReleaseAt) setSolutionsReleaseAt(toLocalDateTimeInput(new Date(c.solutionsReleaseAt)));
    }
  }, [isEdit, existingData, setPrizes, setQuestions]);

  const handleSuperAdminAutofill = async () => {
    const contestNumber = await fetchDailyQuizCounter();
    setTitle(`Daily Quiz Contest ${contestNumber}`);
    setDescription(
      t('contest.dailyQuizDesc')
    );
    setInstructions(
      t('contest.dailyQuizInstructions')
    );
    setDuration('20');

    const now = new Date();
    now.setMinutes(0, 0, 0);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    setStartTime(toLocalDateTimeInput(now));
    setEndTime(toLocalDateTimeInput(tomorrow));
    setSolutionsReleaseAt(toLocalDateTimeInput(tomorrow));
    setLeaderboardVisibility('after_end');
    setEnableNegativeMarking(true);
    setNegativeMarks('0.25');
    setTriggerAiModalOpen((prev) => prev + 1);

    addAlert({
      type: 'success',
      message: t('contest.aiAutofillSuccess'),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitContest({
      title, description, instructions, slug, metaTitle, metaDescription, scheduleType, startTime, endTime, duration,
      solutionsReleaseAt, maxAttempts, maxParticipants, visibility, leaderboardVisibility,
      enableNegativeMarking, negativeMarks, prizes, questions: questionsState.questions,
      notifyAllStudents, isEdit, contestId, canEditQuestions,
      createMutation, updateMutation, addAlert, router,
    });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return {
    isEdit,
    fetchingExisting,
    isSaving,
    canEditQuestions,
    title,
    setTitle,
    description,
    setDescription,
    instructions,
    setInstructions,
    slug,
    setSlug,
    metaTitle,
    setMetaTitle,
    metaDescription,
    setMetaDescription,
    scheduleType,
    setScheduleType,
    notifyAllStudents,
    setNotifyAllStudents,
    handleSuperAdminAutofill,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    duration,
    setDuration,
    solutionsReleaseAt,
    setSolutionsReleaseAt,
    prizes,
    handleAddPrize,
    handleUpdatePrize,
    handleRemovePrize,
    maxAttempts,
    setMaxAttempts,
    maxParticipants,
    setMaxParticipants,
    visibility,
    setVisibility,
    leaderboardVisibility,
    setLeaderboardVisibility,
    enableNegativeMarking,
    setEnableNegativeMarking,
    negativeMarks,
    setNegativeMarks,
    questions: questionsState.questions,
    triggerAiModalOpen,
    handleImportQuestions: questionsState.handleImportQuestions,
    handleAddQuestion: questionsState.handleAddQuestion,
    handleRemoveQuestion: questionsState.handleRemoveQuestion,
    handleQuestionChange: questionsState.handleQuestionChange,
    handleOptionChange: questionsState.handleOptionChange,
    handleSetCorrectAnswer: questionsState.handleSetCorrectAnswer,
    handleAddOption: questionsState.handleAddOption,
    handleRemoveOption: questionsState.handleRemoveOption,
    handlePointsChange: questionsState.handlePointsChange,
    handleNegativePointsChange: questionsState.handleNegativePointsChange,
    handleSubmit,
  };
}

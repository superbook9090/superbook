import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import type { Question } from '@/features/quizzes/components/types';
import type { FormQuestion } from './types';

export function useContestQuestionsState(enableNegativeMarking: boolean, negativeMarks: string) {
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [questions, setQuestions] = useState<FormQuestion[]>([
    { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 },
  ]);

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
        prev.length === 1 && !prev[0].question.trim() && prev[0].options.every((opt) => !opt.trim());
      return isDefaultSingleEmpty ? formatted : [...prev, ...formatted];
    });

    addAlert({
      type: 'success',
      message: (t('contest.importQuestionsSuccess') || 'Successfully loaded {count} questions!').replace(
        '{count}',
        String(formatted.length)
      ),
    });
  };

  const handlePointsChange = (qIndex: number, val: number) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === qIndex ? { ...q, points: Math.max(0.5, val) } : q)));
  };

  const handleNegativePointsChange = (qIndex: number, val: number) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === qIndex ? { ...q, negativePoints: Math.max(0, val) } : q)));
  };

  const handleQuestionChange = (index: number, text: string) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === index ? { ...q, question: text } : q)));
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) =>
        idx === qIndex ? { ...q, options: q.options.map((opt, oIdx) => (oIdx === optIndex ? text : opt)) } : q
      )
    );
  };

  const handleSetCorrectAnswer = (qIndex: number, optIndex: number) => {
    setQuestions((prev) => prev.map((q, idx) => (idx === qIndex ? { ...q, correctAnswer: optIndex } : q)));
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === qIndex && q.options.length < 6 ? { ...q, options: [...q.options, ''] } : q))
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

  return {
    questions,
    setQuestions,
    handleAddQuestion,
    handleImportQuestions,
    handlePointsChange,
    handleNegativePointsChange,
    handleQuestionChange,
    handleOptionChange,
    handleSetCorrectAnswer,
    handleAddOption,
    handleRemoveOption,
    handleRemoveQuestion,
  };
}

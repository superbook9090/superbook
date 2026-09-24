'use client';

import { useState, useCallback } from 'react';
import type { Question } from '../types';

export function useQuizQuestionsManager() {
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctAnswer: 0 },
  ]);

  const handleQuestionChange = useCallback((index: number, field: string, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (field === 'question') {
        updated[index] = { ...updated[index], question: value };
      } else if (field.startsWith('option')) {
        const optionIndex = parseInt(field.replace('option', ''), 10);
        const newOptions = [...updated[index].options];
        newOptions[optionIndex] = value;
        updated[index] = { ...updated[index], options: newOptions };
      } else if (field === 'correctAnswer') {
        updated[index] = { ...updated[index], correctAnswer: parseInt(value, 10) };
      }
      return updated;
    });
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions((prev) => [...prev, { question: '', options: ['', ''], correctAnswer: 0 }]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  const addOption = useCallback((questionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: [...updated[questionIndex].options, ''],
      };
      return updated;
    });
  }, []);

  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      if (updated[questionIndex].options.length > 2) {
        const newOptions = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
        let newCorrectAnswer = updated[questionIndex].correctAnswer;
        if (newCorrectAnswer >= newOptions.length) {
          newCorrectAnswer = newOptions.length - 1;
        }
        updated[questionIndex] = {
          ...updated[questionIndex],
          options: newOptions,
          correctAnswer: newCorrectAnswer,
        };
      }
      return updated;
    });
  }, []);

  return {
    questions,
    setQuestions,
    handleQuestionChange,
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
  };
}

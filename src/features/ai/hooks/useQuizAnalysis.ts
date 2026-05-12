// src/features/ai/hooks/useQuizAnalysis.ts

import { useState, useCallback } from 'react';
import { useSessionStore } from '@/store/useSessionStore';
import { 
  QuizAnalysisRequest, 
  QuizAnalysisResponse, 
  AIAnalysisError, 
  AIAnalysisState,
  UseQuizAnalysisReturn 
} from '../types';
import { aiService } from '../services';

export const useQuizAnalysis = (): UseQuizAnalysisReturn => {
  const [state, setState] = useState<AIAnalysisState>('idle');
  const [error, setError] = useState<AIAnalysisError | null>(null);
  const [data, setData] = useState<QuizAnalysisResponse | null>(null);

  const session = useSessionStore((s) => s.session);
  const userId = session?.user?.id;

  const analyze = useCallback(async (request: QuizAnalysisRequest): Promise<QuizAnalysisResponse> => {
    setState('loading');
    setError(null);
    setData(null);

    try {
      setState('generating');
      const response = await aiService.analyzeQuizAnswer(request, userId);
      setData(response);
      setState('success');
      return response;
    } catch (err) {
      const analysisError = err as AIAnalysisError;
      setError(analysisError);
      setState('error');
      throw analysisError;
    }
  }, [userId]);

  const reset = useCallback(() => {
    setState('idle');
    setError(null);
    setData(null);
  }, []);

  return {
    analyze,
    state,
    error,
    data,
    reset,
  };
};

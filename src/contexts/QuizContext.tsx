'use client';

import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

interface QuizContextType {
  isQuizActive: boolean;
  setQuizActive: (value: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [isQuizActive, setQuizActive] = useState(false);

  const value = useMemo(
    () => ({ isQuizActive, setQuizActive }),
    [isQuizActive]
  );

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface QuizContextType {
  isQuizActive: boolean;
  setQuizActive: (value: boolean) => void;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: ReactNode }) {
  const [isQuizActive, setQuizActive] = useState(false);

  return (
    <QuizContext.Provider value={{ isQuizActive, setQuizActive }}>
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

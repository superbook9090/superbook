// src/features/ai/types/index.ts

export interface QuizAnalysisRequest {
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  userAnswerText?: string;
  correctAnswerText?: string;
  questionType?: 'multiple-choice' | 'true-false' | 'short-answer';
  difficulty?: 'easy' | 'medium' | 'hard';
  subject?: string;
}

export interface QuizAnalysisResponse {
  summary: string;
  isCorrect: boolean;
  whySelectedAnswerIsRightOrWrong: string;
  whyCorrectAnswerIsCorrect: string;
  keyConceptExplanation: string;
  studyTip: string;
  confidenceLevel: number; // 0-100
  processingTime?: number; // in milliseconds
  modelUsed?: string;
}

export interface AIModelConfig {
  name: string;
  size: string; // e.g., "2b", "1b"
  provider: 'ollama' | 'llamacpp';
  endpoint: string;
  maxTokens: number;
  temperature: number;
  timeout: number; // in milliseconds
}

export interface AIServiceStatus {
  isAvailable: boolean;
  modelLoaded: boolean;
  endpoint: string;
  model: string;
  responseTime?: number;
  error?: string;
}

export interface CachedAnalysis {
  id: string;
  requestHash: string;
  response: QuizAnalysisResponse;
  createdAt: Date;
  expiresAt: Date;
}

export interface AIAnalysisError {
  code: 'MODEL_NOT_LOADED' | 'TIMEOUT' | 'RATE_LIMIT' | 'INVALID_INPUT' | 'NETWORK_ERROR' | 'UNKNOWN';
  message: string;
  retryable: boolean;
}

export type AIAnalysisState = 'idle' | 'loading' | 'generating' | 'success' | 'error';

export interface UseQuizAnalysisReturn {
  analyze: (request: QuizAnalysisRequest) => Promise<QuizAnalysisResponse>;
  state: AIAnalysisState;
  error: AIAnalysisError | null;
  data: QuizAnalysisResponse | null;
  reset: () => void;
}

// UI Component Props
export interface AnalysisButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface QuizAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  analysis?: QuizAnalysisResponse;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}

export interface AIThinkingLoaderProps {
  message?: string;
  progress?: number;
}

export interface AIResponseCardProps {
  analysis: QuizAnalysisResponse;
  onCopyExplanation?: () => void;
  onExplainSimpler?: () => void;
  onGiveExample?: () => void;
  loading?: boolean;
}

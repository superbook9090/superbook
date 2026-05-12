// src/features/ai/index.ts

// Types
export type {
  QuizAnalysisRequest,
  QuizAnalysisResponse,
  AIModelConfig,
  AIServiceStatus,
  CachedAnalysis,
  AIAnalysisError,
  AIAnalysisState,
  UseQuizAnalysisReturn,
  AnalysisButtonProps,
  QuizAnalysisModalProps,
  AIThinkingLoaderProps,
  AIResponseCardProps,
} from './types';

// Components
export {
  AnalysisButton,
  AIThinkingLoader,
  AIResponseCard,
  QuizAnalysisModal,
} from './components';

// Hooks
export { useQuizAnalysis } from './hooks/useQuizAnalysis';

// Services
export { aiService, AIService } from './services';
export { ollamaService, OllamaService } from './services/ollama';

// Config
export {
  AI_MODELS,
  AI_CONFIG,
  DEFAULT_MODEL,
  FALLBACK_MODEL,
  MODEL_SELECTION_STRATEGY,
  validateAIEnvironment,
  getOptimalModel,
} from './config';

// Prompts
export {
  generateQuizAnalysisPrompt,
  generateSimplerExplanationPrompt,
  generateExamplePrompt,
  generateSimilarQuestionPrompt,
  generateFollowUpPrompt,
  sanitizeInput,
  validateQuizAnalysisRequest,
  optimizePromptForModel,
  parseAnalysisResponse,
} from './prompts';

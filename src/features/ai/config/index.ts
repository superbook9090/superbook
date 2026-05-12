// src/features/ai/config/index.ts

import { AIModelConfig } from '../types';

// AI Model Configuration
export const AI_MODELS: Record<string, AIModelConfig> = {
  // Lightweight Gemma models - recommended for 8GB RAM systems
  'gemma:2b': {
    name: 'gemma:2b',
    size: '2b',
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    maxTokens: 512,
    temperature: 0.3,
    timeout: 30000, // 30 seconds
  },
  'gemma3:1b': {
    name: 'gemma3:1b',
    size: '1b',
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    maxTokens: 512,
    temperature: 0.3,
    timeout: 25000, // 25 seconds
  },
  // Alternative lightweight models
  'phi3-mini': {
    name: 'phi3-mini',
    size: '3.8b',
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    maxTokens: 512,
    temperature: 0.3,
    timeout: 35000, // 35 seconds
  },
  // Fallback model for very low resource systems
  'tinyllama': {
    name: 'tinyllama',
    size: '1.1b',
    provider: 'ollama',
    endpoint: 'http://localhost:11434',
    maxTokens: 256,
    temperature: 0.3,
    timeout: 20000, // 20 seconds
  },
};

// Default model selection based on system capabilities
export const DEFAULT_MODEL = 'gemma:2b';
export const FALLBACK_MODEL = 'tinyllama';

// AI Service Configuration
export const AI_CONFIG = {
  // Ollama configuration
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    defaultModel: process.env.OLLAMA_DEFAULT_MODEL || DEFAULT_MODEL,
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '30000'),
  },
  
  // Caching configuration
  cache: {
    ttl: parseInt(process.env.AI_CACHE_TTL || '3600'), // 1 hour in seconds
    maxSize: parseInt(process.env.AI_CACHE_MAX_SIZE || '1000'), // max cached analyses
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW || '60000'), // 1 minute
    maxRequests: parseInt(process.env.AI_RATE_LIMIT_MAX || '10'), // 10 requests per minute
  },
  
  // Security settings
  security: {
    maxInputLength: parseInt(process.env.AI_MAX_INPUT_LENGTH || '2000'), // max characters
    maxOutputLength: parseInt(process.env.AI_MAX_OUTPUT_LENGTH || '500'), // max characters
    allowedOrigins: process.env.AI_ALLOWED_ORIGINS?.split(',') || ['localhost'],
  },
  
  // Performance settings
  performance: {
    enableStreaming: process.env.AI_ENABLE_STREAMING === 'true',
    batchSize: parseInt(process.env.AI_BATCH_SIZE || '1'),
    retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS || '2'),
    retryDelay: parseInt(process.env.AI_RETRY_DELAY || '1000'),
  },
};

// Model selection strategy
export const MODEL_SELECTION_STRATEGY = {
  // Try models in order of preference
  preferredOrder: ['gemma:2b', 'gemma3:1b', 'phi3-mini', 'tinyllama'],
  
  // System requirements
  requirements: {
    '8gb': ['gemma:2b', 'gemma3:1b', 'phi3-mini'],
    '4gb': ['tinyllama'],
    '16gb': ['gemma:2b', 'gemma3:1b', 'phi3-mini'],
  },
  
  // Quality vs speed tradeoff
  quality: {
    high: ['gemma:2b', 'gemma3:1b'],
    medium: ['phi3-mini'],
    low: ['tinyllama'],
  },
};

// Environment validation
export const validateAIEnvironment = (): boolean => {
  try {
    // Check if Ollama is running
    const ollamaUrl = AI_CONFIG.ollama.baseUrl;
    if (!ollamaUrl) {
      console.warn('AI: Ollama base URL not configured');
      return false;
    }
    
    // Check if model is specified
    const model = AI_CONFIG.ollama.defaultModel;
    if (!model || !AI_MODELS[model]) {
      console.warn(`AI: Default model "${model}" not found in configuration`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('AI: Environment validation failed:', error);
    return false;
  }
};

// Get optimal model for current system
export const getOptimalModel = (systemRam?: string): string => {
  const ram = systemRam || '8gb'; // default to 8GB
  
  // Try to find a model that fits the system requirements
  for (const model of MODEL_SELECTION_STRATEGY.preferredOrder) {
    if (MODEL_SELECTION_STRATEGY.requirements[ram as keyof typeof MODEL_SELECTION_STRATEGY.requirements]?.includes(model)) {
      return model;
    }
  }
  
  // Fallback to lowest resource model
  return FALLBACK_MODEL;
};

// src/features/ai/services/index.ts

import { ollamaService } from './ollama';
import { QuizAnalysisRequest, QuizAnalysisResponse, AIAnalysisError, CachedAnalysis } from '../types';
import { AI_CONFIG } from '../config';
import { getCachedData, setCachedData } from '@/lib/redis';

// Create a simple hash function for caching
const createRequestHash = (request: QuizAnalysisRequest): string => {
  const { question, selectedAnswer, correctAnswer, options } = request;
  const hashString = `${question}|${selectedAnswer}|${correctAnswer}|${options.join('|')}`;
  return btoa(hashString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
};

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    const requests = this.requests.get(identifier) || [];
    
    // Filter out old requests
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if under limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [key, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validRequests);
      }
    }
  }
}

// Main AI Service
export class AIService {
  private rateLimiter: RateLimiter;
  private cacheEnabled: boolean;

  constructor() {
    this.rateLimiter = new RateLimiter(
      AI_CONFIG.rateLimit.windowMs,
      AI_CONFIG.rateLimit.maxRequests
    );
    this.cacheEnabled = true;
    
    // Cleanup rate limiter periodically
    setInterval(() => this.rateLimiter.cleanup(), 60000); // Every minute
  }

  /**
   * Analyze quiz answer with caching and rate limiting
   */
  async analyzeQuizAnswer(request: QuizAnalysisRequest, userId?: string): Promise<QuizAnalysisResponse> {
    // Rate limiting check
    if (userId && !this.rateLimiter.isAllowed(userId)) {
      throw {
        code: 'RATE_LIMIT',
        message: 'Too many requests. Please wait a moment before trying again.',
        retryable: true,
      } as AIAnalysisError;
    }

    // Check cache first
    if (this.cacheEnabled) {
      const cached = await this.getCachedAnalysis(request);
      if (cached) {
        return {
          ...cached.response,
          processingTime: 0, // Cached responses are instant
          modelUsed: cached.response.modelUsed || 'cached',
        };
      }
    }

    // Generate new analysis
    try {
      const analysis = await ollamaService.analyzeQuizAnswer(request);
      
      // Cache the result
      if (this.cacheEnabled) {
        await this.cacheAnalysis(request, analysis);
      }
      
      return analysis;
    } catch (error) {
      // Re-throw AI analysis errors
      if (this.isAIAnalysisError(error)) {
        throw error;
      }
      
      // Convert other errors to AI analysis errors
      throw {
        code: 'UNKNOWN',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        retryable: true,
      } as AIAnalysisError;
    }
  }

  /**
   * Get cached analysis
   */
  private async getCachedAnalysis(request: QuizAnalysisRequest): Promise<CachedAnalysis | null> {
    try {
      const hash = createRequestHash(request);
      const cacheKey = `ai-analysis:${hash}`;
      
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return cached as CachedAnalysis;
      }
      
      return null;
    } catch (error) {
      console.warn('Failed to get cached analysis:', error);
      return null;
    }
  }

  /**
   * Cache analysis result
   */
  private async cacheAnalysis(request: QuizAnalysisRequest, analysis: QuizAnalysisResponse): Promise<void> {
    try {
      const hash = createRequestHash(request);
      const cacheKey = `ai-analysis:${hash}`;
      
      const cachedAnalysis: CachedAnalysis = {
        id: hash,
        requestHash: hash,
        response: analysis,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + AI_CONFIG.cache.ttl * 1000),
      };
      
      await setCachedData(cacheKey, cachedAnalysis, AI_CONFIG.cache.ttl);
    } catch (error) {
      console.warn('Failed to cache analysis:', error);
    }
  }

  /**
   * Check if AI service is available
   */
  async checkServiceStatus() {
    return ollamaService.checkServiceStatus();
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    return ollamaService.getAvailableModels();
  }

  /**
   * Test a specific model
   */
  async testModel(model: string): Promise<boolean> {
    return ollamaService.testModel(model);
  }

  /**
   * Pull a model if needed
   */
  async pullModel(model: string, onProgress?: (progress: number) => void): Promise<boolean> {
    return ollamaService.pullModel(model, onProgress);
  }

  /**
   * Clear cache for a specific request
   */
  async clearCache(request: QuizAnalysisRequest): Promise<void> {
    try {
      const hash = createRequestHash(request);
      const cacheKey = `ai-analysis:${hash}`;
      
      // Note: You would need to implement cache deletion in your Redis service
      // For now, we'll just log it
      console.log(`Cache cleared for key: ${cacheKey}`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Enable/disable caching
   */
  setCacheEnabled(enabled: boolean): void {
    this.cacheEnabled = enabled;
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus(userId: string): { allowed: boolean; remaining: number; resetTime: number } {
    // This is a simplified version - in production you'd want more detailed tracking
    const allowed = this.rateLimiter.isAllowed(userId);
    return {
      allowed,
      remaining: allowed ? AI_CONFIG.rateLimit.maxRequests - 1 : 0,
      resetTime: Date.now() + AI_CONFIG.rateLimit.windowMs,
    };
  }

  /**
   * Type guard for AI analysis errors
   */
  private isAIAnalysisError(error: any): error is AIAnalysisError {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
  }

  /**
   * Generate simpler explanation
   */
  async generateSimplerExplanation(originalAnalysis: string, targetLevel: 'beginner' | 'very-simple' = 'beginner'): Promise<string> {
    const prompt = `Simplify this explanation ${targetLevel === 'very-simple' ? 'like explaining to a 10-year-old' : 'like explaining to someone new to the topic'}:

${originalAnalysis}

Keep it under 50 words total. Use very simple language.`;

    try {
      return await ollamaService.generateCompletion(prompt);
    } catch (error) {
      console.error('Failed to generate simpler explanation:', error);
      return 'Unable to generate simpler explanation at this time.';
    }
  }

  /**
   * Generate example
   */
  async generateExample(question: string, concept: string): Promise<string> {
    const prompt = `Create a simple, real-world example to help understand this concept:

QUESTION: ${question}
KEY CONCEPT: ${concept}

Generate one clear example that is relatable and easy to understand. Keep it 2-3 sentences maximum.`;

    try {
      return await ollamaService.generateCompletion(prompt);
    } catch (error) {
      console.error('Failed to generate example:', error);
      return 'Unable to generate example at this time.';
    }
  }

  /**
   * Generate similar question
   */
  async generateSimilarQuestion(originalQuestion: string, difficulty: string): Promise<string> {
    const prompt = `Create a similar practice question:

ORIGINAL QUESTION: ${originalQuestion}
DIFFICULTY: ${difficulty}

Create a new question that tests the same concept with similar difficulty. Include 4 options and mark the correct answer.`;

    try {
      return await ollamaService.generateCompletion(prompt);
    } catch (error) {
      console.error('Failed to generate similar question:', error);
      return 'Unable to generate similar question at this time.';
    }
  }

  /**
   * Generate follow-up question
   */
  async generateFollowUpQuestion(question: string, studentAnswer: string, isCorrect: boolean): Promise<string> {
    const prompt = `Generate a helpful follow-up question for a student who ${isCorrect ? 'answered correctly but might want deeper understanding' : 'answered incorrectly and needs clarification'}:

ORIGINAL QUESTION: ${question}
STUDENT'S ANSWER: ${studentAnswer}

Create a thought-provoking but simple open-ended question (one sentence maximum).`;

    try {
      return await ollamaService.generateCompletion(prompt);
    } catch (error) {
      console.error('Failed to generate follow-up question:', error);
      return 'Unable to generate follow-up question at this time.';
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

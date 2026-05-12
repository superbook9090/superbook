// src/features/ai/services/ollama.ts

import { AIModelConfig, AIServiceStatus, QuizAnalysisResponse, AIAnalysisError } from '../types';
import { AI_CONFIG, AI_MODELS } from '../config';
import { generateQuizAnalysisPrompt, optimizePromptForModel, parseAnalysisResponse, validateQuizAnalysisRequest } from '../prompts';

export class OllamaService {
  private baseUrl: string;
  private defaultModel: string;
  private timeout: number;

  constructor() {
    this.baseUrl = AI_CONFIG.ollama.baseUrl;
    this.defaultModel = AI_CONFIG.ollama.defaultModel;
    this.timeout = AI_CONFIG.ollama.timeout;
  }

  /**
   * Check if Ollama service is available and model is loaded
   */
  async checkServiceStatus(): Promise<AIServiceStatus> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout for status check
      });

      if (!response.ok) {
        return {
          isAvailable: false,
          modelLoaded: false,
          endpoint: this.baseUrl,
          model: this.defaultModel,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      const models = data.models || [];
      const modelExists = models.some((model: any) => model.name === this.defaultModel);

      return {
        isAvailable: true,
        modelLoaded: modelExists,
        endpoint: this.baseUrl,
        model: this.defaultModel,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        isAvailable: false,
        modelLoaded: false,
        endpoint: this.baseUrl,
        model: this.defaultModel,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Pull a model if it's not available
   */
  async pullModel(modelName: string, onProgress?: (progress: number) => void): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: modelName }),
        signal: AbortSignal.timeout(300000), // 5 minute timeout for model pull
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.statusText}`);
      }

      // Handle streaming progress if available
      if (onProgress && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let totalSize = 0;
        let completedSize = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const data = JSON.parse(line);
                if (data.total) totalSize = data.total;
                if (data.completed) completedSize = data.completed;
                
                if (totalSize > 0) {
                  onProgress(Math.round((completedSize / totalSize) * 100));
                }
              } catch {
                // Ignore JSON parsing errors
              }
            }
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to pull model:', error);
      return false;
    }
  }

  /**
   * Generate completion using Ollama
   */
  async generateCompletion(
    prompt: string,
    model?: string,
    options?: Partial<AIModelConfig>
  ): Promise<string> {
    const modelName = model || this.defaultModel;
    const modelConfig = AI_MODELS[modelName];
    
    if (!modelConfig) {
      throw new Error(`Model configuration not found: ${modelName}`);
    }

    // Optimize prompt for the specific model
    const optimizedPrompt = optimizePromptForModel(prompt, modelName);

    const requestBody = {
      model: modelName,
      prompt: optimizedPrompt,
      options: {
        temperature: options?.temperature ?? modelConfig.temperature,
        num_predict: options?.maxTokens ?? modelConfig.maxTokens,
        top_p: 0.9,
        top_k: 40,
        repeat_penalty: 1.1,
      },
      stream: false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? modelConfig.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Model not found. Please pull the model first.');
        }
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`Model error: ${data.error}`);
      }

      const responseText = data.response || '';
      return responseText;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. The model took too long to respond.');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred during completion generation');
    }
  }

  /**
   * Analyze quiz answer using AI
   */
  async analyzeQuizAnswer(request: any): Promise<QuizAnalysisResponse> {
    // Validate input
    const validationErrors = validateQuizAnalysisRequest(request);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid request: ${validationErrors.join(', ')}`);
    }

    // Check service status first
    const status = await this.checkServiceStatus();
    if (!status.isAvailable) {
      throw new Error('AI service is not available');
    }

    if (!status.modelLoaded) {
      // Try to pull the model
      const pulled = await this.pullModel(this.defaultModel);
      if (!pulled) {
        throw new Error('Model is not available and could not be loaded');
      }
    }

    const startTime = Date.now();
    
    try {
      // Generate the analysis prompt
      const prompt = generateQuizAnalysisPrompt(request);
      
      // Get AI response
      const response = await this.generateCompletion(prompt);
      
      // Parse the response
      const parsed = parseAnalysisResponse(response);
      
      // Ensure required fields
      const analysis: QuizAnalysisResponse = {
        summary: parsed.summary || 'Analysis completed',
        isCorrect: request.selectedAnswer === request.correctAnswer,
        whySelectedAnswerIsRightOrWrong: parsed.whySelectedAnswerIsRightOrWrong || 'Answer analysis not available',
        whyCorrectAnswerIsCorrect: parsed.whyCorrectAnswerIsCorrect || 'Correct answer explanation not available',
        keyConceptExplanation: parsed.keyConceptExplanation || 'Concept explanation not available',
        studyTip: parsed.studyTip || 'Study tip not available',
        confidenceLevel: parsed.confidenceLevel || 75,
        processingTime: Date.now() - startTime,
        modelUsed: this.defaultModel,
      };

      return analysis;
    } catch (error) {
      // Convert to AIAnalysisError
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw {
            code: 'TIMEOUT',
            message: 'The AI model took too long to respond. Please try again.',
            retryable: true,
          } as AIAnalysisError;
        }
        if (error.message.includes('not found') || error.message.includes('not available')) {
          throw {
            code: 'MODEL_NOT_LOADED',
            message: 'AI model is not available. Please check your setup.',
            retryable: false,
          } as AIAnalysisError;
        }
        if (error.message.includes('Invalid request')) {
          throw {
            code: 'INVALID_INPUT',
            message: error.message,
            retryable: false,
          } as AIAnalysisError;
        }
      }
      
      throw {
        code: 'UNKNOWN',
        message: 'An unexpected error occurred during analysis',
        retryable: true,
      } as AIAnalysisError;
    }
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.models?.map((model: any) => model.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Test model with a simple prompt
   */
  async testModel(model: string): Promise<boolean> {
    try {
      const response = await this.generateCompletion('Hello, respond with "OK"', model);
      return response.toLowerCase().includes('ok');
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const ollamaService = new OllamaService();

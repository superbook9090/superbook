// src/app/api/ai/quiz-analysis/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiService } from '@/features/ai/services';
import { QuizAnalysisRequest, QuizAnalysisResponse, AIAnalysisError } from '@/features/ai/types';
import { logApiError, type LogContext } from '@/lib/logger';
import { sanitizeInput, validateQuizAnalysisRequest } from '@/features/ai/prompts';

export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/ai/quiz-analysis',
  };

  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Parse request body
    const body = await request.json();
    const {
      question,
      options,
      selectedAnswer,
      correctAnswer,
      userAnswerText,
      correctAnswerText,
      questionType = 'multiple-choice',
      difficulty = 'medium',
      subject = 'general'
    } = body;

    // Validate required fields
    if (!question || !options || !Array.isArray(options) || 
        typeof selectedAnswer !== 'number' || typeof correctAnswer !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: question, options, selectedAnswer, correctAnswer' },
        { status: 400 }
      );
    }

    // Sanitize and validate input
    const sanitizedRequest: QuizAnalysisRequest = {
      question: sanitizeInput(question),
      options: options.map((opt: string) => sanitizeInput(opt)),
      selectedAnswer,
      correctAnswer,
      userAnswerText: userAnswerText ? sanitizeInput(userAnswerText) : undefined,
      correctAnswerText: correctAnswerText ? sanitizeInput(correctAnswerText) : undefined,
      questionType,
      difficulty,
      subject
    };

    // Validate the request
    const validationErrors = validateQuizAnalysisRequest(sanitizedRequest);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationErrors },
        { status: 400 }
      );
    }

    // Check AI service status
    const serviceStatus = await aiService.checkServiceStatus();
    if (!serviceStatus.isAvailable) {
      return NextResponse.json(
        { 
          error: 'AI service is not available',
          message: 'Please ensure Ollama is running and accessible',
          code: 'SERVICE_UNAVAILABLE'
        },
        { status: 503 }
      );
    }

    // Generate analysis
    const analysis = await aiService.analyzeQuizAnswer(sanitizedRequest, session.user.id);

    // Return successful response
    return NextResponse.json({
      success: true,
      data: analysis,
      metadata: {
        model: analysis.modelUsed,
        processingTime: analysis.processingTime,
        confidence: analysis.confidenceLevel,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logApiError(error as Error, 'POST', '/api/ai/quiz-analysis', logContext);

    // Handle specific AI analysis errors
    if (error && typeof error === 'object' && 'code' in error) {
      const aiError = error as AIAnalysisError;
      
      let statusCode = 500;
      switch (aiError.code) {
        case 'RATE_LIMIT':
          statusCode = 429;
          break;
        case 'TIMEOUT':
          statusCode = 408;
          break;
        case 'INVALID_INPUT':
          statusCode = 400;
          break;
        case 'MODEL_NOT_LOADED':
          statusCode = 503;
          break;
        case 'NETWORK_ERROR':
          statusCode = 503;
          break;
      }

      return NextResponse.json(
        {
          error: aiError.message,
          code: aiError.code,
          retryable: aiError.retryable
        },
        { status: statusCode }
      );
    }

    // Generic error handling
    return NextResponse.json(
      { 
        error: 'Failed to analyze quiz answer',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check AI service status
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/ai/quiz-analysis',
  };

  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Check AI service status
    const serviceStatus = await aiService.checkServiceStatus();
    const availableModels = await aiService.getAvailableModels();
    
    // Get rate limit status for the user
    const rateLimitStatus = aiService.getRateLimitStatus(session.user.id);

    return NextResponse.json({
      success: true,
      data: {
        service: serviceStatus,
        models: availableModels,
        rateLimit: rateLimitStatus,
        features: {
          analysis: serviceStatus.isAvailable && serviceStatus.modelLoaded,
          simplerExplanation: true,
          examples: true,
          similarQuestions: true,
          followUpQuestions: true
        }
      }
    });

  } catch (error) {
    logApiError(error as Error, 'GET', '/api/ai/quiz-analysis', logContext);

    return NextResponse.json(
      { 
        error: 'Failed to check AI service status',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

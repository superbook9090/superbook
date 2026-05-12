// src/app/api/ai/test/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/features/ai/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, options, selectedAnswer, correctAnswer } = body;

    // Test the AI analysis
    const analysis = await aiService.analyzeQuizAnswer({
      question,
      options,
      selectedAnswer,
      correctAnswer,
      questionType: 'multiple-choice',
      difficulty: 'medium',
      subject: 'general'
    });

    return NextResponse.json({
      success: true,
      analysis,
      debug: {
        input: { question, options, selectedAnswer, correctAnswer },
        output: analysis
      }
    });

  } catch (error) {
    console.error('AI Test Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Check AI service status
    const status = await aiService.checkServiceStatus();
    const models = await aiService.getAvailableModels();

    return NextResponse.json({
      success: true,
      status,
      availableModels: models,
      message: 'AI service is ready for testing'
    });

  } catch (error) {
    console.error('AI Status Check Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

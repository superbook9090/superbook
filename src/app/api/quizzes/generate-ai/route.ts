import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isStaffRole } from '@/lib/roles';
import { requireFeature, getTeacherLimit } from '@/lib/settingsHelpers';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { logApiError, logInfo } from '@/lib/logger';
import z from 'zod';

import { fetchStockanlyzerChat } from '@/lib/stockanlyzer/chat';

const generateAiQuizSchema = z.object({
  topic: z.string().min(2, 'Topic is required').max(300, 'Topic is too long'),
  numQuestions: z
    .number()
    .int()
    .min(1, 'At least 1 question is required')
    .max(10, 'Maximum 10 questions can be generated at a time')
    .default(5),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().default('medium'),
  language: z.string().optional().default('English'),
  instructions: z.string().max(500, 'Instructions too long').optional(),
});

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function POST(req: NextRequest) {
  const logContext = { path: '/api/quizzes/generate-ai' };
  try {
    // 1. Feature Toggle Check
    const featureCheck = await requireFeature('enableAiQuizGen');
    if (featureCheck) return featureCheck;

    // 2. Authentication Check
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!isStaffRole(userRole)) {
      return NextResponse.json(
        { message: 'Forbidden. Only teachers and staff can generate AI quizzes.' },
        { status: 403 }
      );
    }

    const userId = session.user.id;

    // 3. Database & Teacher Quota Limit Check
    await dbConnect();
    const user = await User.findById(userId).select('limits aiQuizGenerationsCount').lean();
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const effectiveLimit = await getTeacherLimit('aiQuizGenerations', userId);
    const currentCount = user.aiQuizGenerationsCount ?? 0;

    if (currentCount >= effectiveLimit) {
      return NextResponse.json(
        {
          message: `You have reached your limit of ${effectiveLimit} AI quiz generation(s). Please contact super admin to increase your quota.`,
          usage: { used: currentCount, limit: effectiveLimit, remaining: 0 },
        },
        { status: 403 }
      );
    }

    // 4. Input Validation
    const body = await req.json().catch(() => ({}));
    const parseResult = generateAiQuizSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: 'Invalid input parameters', errors: parseResult.error.issues },
        { status: 400 }
      );
    }

    const { topic, numQuestions, difficulty, language, instructions } = parseResult.data;

    // 5. AI Generation Logic
    let questions: GeneratedQuestion[] = [];
    let lastErrorMessage = '';

    const langLower = (language || 'English').toLowerCase();
    let scriptInstruction = '';
    if (langLower.includes('hinglish')) {
      scriptInstruction = 'Write questions and options in Hinglish (Hindi spoken language written using Latin/Roman script, e.g. "Photosynthesis kya hai?").';
    } else if (langLower.includes('hindi')) {
      scriptInstruction = 'Write questions and options strictly in Hindi using Devanagari script (हिंदी).';
    } else if (!langLower.includes('english')) {
      scriptInstruction = `Write all questions and options strictly in ${language}.`;
    }

    const prompt = `You are a master teacher and expert educational content creator.
Generate a high-quality, realistic, and pedagogically sound multiple-choice quiz with EXACTLY ${numQuestions} questions on the topic: "${topic}".

CRITICAL LANGUAGE REQUIREMENT:
- Target Language: ${language}
- ${scriptInstruction || `Write all questions, options, and text strictly in ${language}.`}
- DO NOT default to English unless the Target Language is English.

Parameters:
- Topic: ${topic}
- Target Language: ${language}
- Difficulty Level: ${difficulty}
${instructions ? `- Additional Instructions: ${instructions}` : ''}

CRITICAL QUALITY REQUIREMENTS:
1. Provide EXACTLY ${numQuestions} distinct questions written in ${language}.
2. Each question MUST have EXACTLY 4 distinct, plausible multiple-choice options written in ${language}.
3. Distractors (wrong options) MUST be realistic and relevant to the topic in ${language}.
4. Distribute the "correctAnswer" index (0 for A, 1 for B, 2 for C, 3 for D) randomly across questions so that option A (0) is not always the correct answer.
5. Return ONLY a valid JSON array of question objects matching this exact format without any additional commentary:
[
  {
    "question": "Question text written in ${language}",
    "options": ["Option A in ${language}", "Option B in ${language}", "Option C in ${language}", "Option D in ${language}"],
    "correctAnswer": 0
  }
]`;

function parseQuestionsFromAiOutput(rawText: string, numQuestions: number): GeneratedQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

  const jsonStart = cleaned.indexOf('[');
  const jsonEnd = cleaned.lastIndexOf(']');
  if (jsonStart !== -1) {
    if (jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    } else {
      cleaned = cleaned.substring(jsonStart) + '\n]';
    }
  }

  // Remove trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return sanitizeParsedQuestions(parsed, numQuestions);
    }
  } catch {
    // Attempt relaxed cleanup for unescaped newlines inside strings
    try {
      const relaxed = cleaned.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
      const parsed = JSON.parse(relaxed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeParsedQuestions(parsed, numQuestions);
      }
    } catch {
      // Fallthrough to regex extraction
    }
  }

  // Regex fallback for individual question objects
  const questionObjectRegex = /\{\s*"question"\s*:\s*"[\s\S]*?"\s*,\s*"options"\s*:\s*\[[\s\S]*?\]\s*(?:,\s*"correctAnswer"\s*:\s*\d+)?\s*\}/gi;
  const matches = rawText.match(questionObjectRegex);
  if (matches && matches.length > 0) {
    const extracted: unknown[] = [];
    for (const match of matches) {
      try {
        const cleanObj = match.replace(/,\s*([\]}])/g, '$1');
        extracted.push(JSON.parse(cleanObj));
      } catch {
        // Skip match
      }
    }
    if (extracted.length > 0) {
      return sanitizeParsedQuestions(extracted, numQuestions);
    }
  }

  return [];
}

function sanitizeParsedQuestions(parsed: unknown[], numQuestions: number): GeneratedQuestion[] {
  return parsed
    .slice(0, numQuestions)
    .map((item: unknown) => {
      const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
      const opts = Array.isArray(obj.options)
        ? obj.options.map((o: unknown) => String(o).trim()).filter(Boolean).slice(0, 4)
        : [];
      while (opts.length < 4) {
        opts.push(`Option ${String.fromCharCode(65 + opts.length)}`);
      }
      return {
        question: String(obj.question || '').trim(),
        options: opts,
        correctAnswer:
          typeof obj.correctAnswer === 'number' && obj.correctAnswer >= 0 && obj.correctAnswer <= 3
            ? obj.correctAnswer
            : 0,
      };
    })
    .filter((q) => q.question.length > 0);
}

// Attempt 1: Use primary AI_API_URL service
    try {
      const reply = await fetchStockanlyzerChat(prompt, 1, 3000);
      questions = parseQuestionsFromAiOutput(reply, numQuestions);
    } catch (err) {
      lastErrorMessage = err instanceof Error ? err.message : 'AI_API_URL fetch failed';
      console.warn('[AI_QUIZ_GEN] Primary AI_API_URL service failed, attempting fallback:', lastErrorMessage);
    }

    // Attempt 2: Fallback to Gemini API if primary AI_API_URL didn't yield questions
    if (questions.length === 0) {
      const apiKey =
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_AI_API_KEY ||
        process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (apiKey) {
        const modelsToTry = [
          'gemini-1.5-flash',
          'gemini-2.0-flash',
          'gemini-1.5-pro',
        ];

        for (const model of modelsToTry) {
          if (questions.length > 0) break;

          try {
            const res = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: prompt }] }],
                  generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2500,
                    responseMimeType: 'application/json',
                  },
                }),
              }
            );

            if (res.ok) {
              const resData = await res.json();
              const rawText: string =
                resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
              questions = parseQuestionsFromAiOutput(rawText, numQuestions);
            } else {
              const errorData = await res.json().catch(() => ({}));
              lastErrorMessage = errorData?.error?.message || res.statusText;
            }
          } catch (err) {
            lastErrorMessage = err instanceof Error ? err.message : 'Gemini fetch error';
          }
        }
      }
    }

    if (!questions || questions.length === 0) {
      logInfo('[AI_QUIZ_GEN] All AI generation attempts failed', logContext, { lastErrorMessage });
      return NextResponse.json(
        { message: `Failed to generate quiz: ${lastErrorMessage || 'AI service is temporarily unavailable.'}` },
        { status: 500 }
      );
    }

    // 6. Quota Increment
    await User.findByIdAndUpdate(userId, {
      $inc: { aiQuizGenerationsCount: 1 },
    });

    const newCount = currentCount + 1;
    const remaining = Math.max(0, effectiveLimit - newCount);

    return NextResponse.json({
      success: true,
      questions,
      usage: {
        used: newCount,
        limit: effectiveLimit,
        remaining,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/quizzes/generate-ai', logContext);
    return NextResponse.json(
      { message: 'Failed to generate quiz. Please try again.' },
      { status: 500 }
    );
  }
}

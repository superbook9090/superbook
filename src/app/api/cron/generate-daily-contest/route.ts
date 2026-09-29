import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import Contest from '@/models/Contest';
import { logApiError, logError, logInfo } from '@/lib/logger';
import { fetchOpenRouterChat } from '@/lib/ai/openrouter';
import { requireFeature } from '@/lib/settingsHelpers';
import { invalidatePattern } from '@/lib/redis';
import { sendAdminBroadcast } from '@/lib/server/services/notifications-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time for Vercel (Free tier limit)

interface GeneratedQuestion {
  question?: string;
  prompt?: string;
  options: string[];
  correctAnswer?: number | string;
  correct_answer?: number | string;
  correctOption?: number | string;
  answer?: number | string;
}

function processAndRandomizeContestQuestion(
  q: GeneratedQuestion,
  order: number,
  quizId: mongoose.Types.ObjectId
) {
  const promptText = (q.question || q.prompt || '').trim() || `Question ${order}`;

  // 1. Sanitize options (strings, non-empty, trimmed)
  let cleanOptions: string[] = [];
  if (Array.isArray(q.options)) {
    cleanOptions = q.options
      .map((opt) => String(opt ?? '').trim())
      .filter((opt) => opt.length > 0);
  }

  // Ensure at least 4 options exist
  while (cleanOptions.length < 4) {
    cleanOptions.push(`Option ${String.fromCharCode(65 + cleanOptions.length)}`);
  }
  cleanOptions = cleanOptions.slice(0, 4);

  // 2. Identify the correct answer from AI output
  const rawCorrect =
    q.correctAnswer !== undefined
      ? q.correctAnswer
      : q.correctOption !== undefined
        ? q.correctOption
        : q.correct_answer !== undefined
          ? q.correct_answer
          : q.answer;

  let resolvedCorrectIndex = -1;

  if (typeof rawCorrect === 'number' && Number.isFinite(rawCorrect)) {
    const idx = Math.floor(rawCorrect);
    if (idx >= 0 && idx < cleanOptions.length) {
      resolvedCorrectIndex = idx;
    }
  } else if (typeof rawCorrect === 'string') {
    const trimmed = rawCorrect.trim();
    const parsedNum = parseInt(trimmed, 10);
    if (!isNaN(parsedNum) && parsedNum >= 0 && parsedNum < cleanOptions.length) {
      resolvedCorrectIndex = parsedNum;
    } else {
      // Check for letter A, B, C, D (e.g. "A", "Option A", "(B)")
      const letterMatch = trimmed.toUpperCase().match(/\b([A-D])\b/);
      if (letterMatch && letterMatch[1]) {
        resolvedCorrectIndex = letterMatch[1].charCodeAt(0) - 65;
      } else {
        // Check if string matches text of one of the options
        const matchIdx = cleanOptions.findIndex(
          (opt) => opt.toLowerCase() === trimmed.toLowerCase()
        );
        if (matchIdx !== -1) {
          resolvedCorrectIndex = matchIdx;
        }
      }
    }
  }

  // Fallback: if AI provided an unrecognized correct answer, pick a random option
  if (resolvedCorrectIndex < 0 || resolvedCorrectIndex >= cleanOptions.length) {
    resolvedCorrectIndex = Math.floor(Math.random() * cleanOptions.length);
  }

  // 3. Guarantee that the correct answer is present AND randomize its position
  const items = cleanOptions.map((text, idx) => ({
    text,
    isCorrect: idx === resolvedCorrectIndex,
  }));

  // Fisher-Yates shuffle to randomize options
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = items[i];
    items[i] = items[j];
    items[j] = temp;
  }

  const randomizedOptions = items.map((item) => item.text);
  const randomizedCorrectOption = items.findIndex((item) => item.isCorrect);

  return {
    quiz: quizId,
    order,
    prompt: promptText,
    options: randomizedOptions,
    correctOption: randomizedCorrectOption !== -1 ? randomizedCorrectOption : 0,
    points: 1, // 1 mark per question
    negativePoints: 0.25, // -0.25 negative mark
  };
}

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/generate-daily-contest' };
  const startTime = Date.now();
  // Safe execution window to prevent Vercel 504 timeouts (Free plan limit is 60s)
  const MAX_RUN_TIME_MS = 46000;

  try {
    // 1. Verify Vercel Cron Secret (if configured) or Superadmin session
    const authHeader = req.headers.get('authorization');
    const isCronAuthorized = !process.env.CRON_SECRET || authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    let isSuperAdmin = false;
    if (!isCronAuthorized) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === 'superadmin') {
        isSuperAdmin = true;
      }
    }

    if (!isCronAuthorized && !isSuperAdmin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 1b. Verify feature toggle
    const featureCheck = await requireFeature('enableAutoDailyAiContestCreation');
    if (featureCheck) return featureCheck;

    await dbConnect();

    // 2. Database Logic: Find Instructor (superadmin or admin)
    let instructor = await User.findOne({ role: 'superadmin' }).lean();
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' }).lean();
    }
    if (!instructor) {
      return NextResponse.json({ message: 'No superadmin or admin found to own the contest' }, { status: 400 });
    }

    // 4. Implement AI Topic Generation Logic (Focused on India & Competitive Exams)
    const topicPrompt = `Generate a HIGHLY RANDOM, unique, and specific quiz topic relevant to India and Indian competitive exams (e.g. UPSC, SSC, Banking, State PSC, Indian GK).
Topics can cover: Indian History, Indian Geography, Indian Polity & Constitution, Indian Economy, Science & Technology in India, Indian Art & Culture, Famous Personalities of India, Environment & Wildlife of India, or Current Affairs.
Make sure the topic is extremely specific and completely different from typical generic topics. Random seed: ${Math.random().toString(36).substring(2, 10)}

IMPORTANT: The "topic", "metaTitle", and "metaDescription" MUST be written in Hindi language. The "slug" MUST be in English/Latin characters.

Return ONLY a valid JSON object matching exactly this structure, with no markdown, quotes, or extra text:
{
  "topic": "The generated topic name (in Hindi)",
  "slug": "seo-friendly-url-slug-in-english",
  "metaTitle": "SEO meta title (max 60 chars) (in Hindi)",
  "metaDescription": "SEO meta description (max 160 chars) (in Hindi)"
}`;

    let topic = 'General Knowledge of India';
    let slug = 'general-knowledge-of-india';
    let metaTitle = 'General Knowledge of India Quiz Contest | Quiz-Do';
    let metaDescription = 'Participate in the General Knowledge of India quiz contest and test your skills against top competitors.';
    try {
      const topicResult = await fetchOpenRouterChat([
        { role: 'user', content: topicPrompt }
      ], { maxTokens: 300, temperature: 0.8, validateOutput: (text) => text.includes('{'), timeoutMs: 10000 });

      const rawText = topicResult.content;
      let cleaned = rawText
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

      const jsonStart = cleaned.indexOf('{');
      const jsonEnd = cleaned.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleaned);
      if (parsed.topic) topic = parsed.topic;
      if (parsed.slug) slug = parsed.slug;
      if (parsed.metaTitle) metaTitle = parsed.metaTitle;
      if (parsed.metaDescription) metaDescription = parsed.metaDescription;
    } catch (err) {
      logError('Failed to generate topic and SEO, falling back to defaults', logContext, { error: err });
    }

    // 5. Implement AI Question Generation Logic with Time-Bounded Loop
    const targetQuestions = 10;
    const batchSize = 5;
    let parsedQuestions: GeneratedQuestion[] = [];
    const language = 'Hindi';
    
    let batchNumber = 1;
    // We only attempt another batch if we have spent less than 25 seconds so far.
    // This guarantees we have at least ~35 seconds left for the next batch + DB + Notifications.
    while (parsedQuestions.length < targetQuestions && (Date.now() - startTime < 25000)) {
      const remaining = targetQuestions - parsedQuestions.length;
      const toFetch = Math.min(batchSize, remaining);

      const prompt = `You are a master educator and expert in Indian competitive examinations (such as UPSC, SSC, State PSC, and Banking exams).
Generate a high-quality, realistic, medium-difficulty competitive contest multiple-choice quiz with EXACTLY ${toFetch} questions on the topic: "${topic}" focused on India.
${batchNumber > 1 ? 'Make sure these questions are entirely new and distinct from the previous ones.' : ''}

CRITICAL QUALITY & PEDAGOGICAL REQUIREMENTS:
1. INDIAN CONTEXT: All questions and options must be strictly focused on India and relevant to Indian students/aspirants.
2. DIFFICULTY: Medium level — thought-provoking, competitive, and realistic.
3. EXACT QUESTION COUNT: Provide EXACTLY ${toFetch} distinct questions written strictly in ${language}.
4. 4 OPTIONS: Each question MUST have EXACTLY 4 distinct, plausible multiple-choice options, also in ${language}.
5. ACCURATE CORRECT ANSWER: Every question MUST have exactly one indisputably correct, factually accurate answer, and that correct answer MUST be included in the "options" list.
6. RANDOM CORRECT ANSWER: Distribute the "correctAnswer" index (0 for A, 1 for B, 2 for C, 3 for D) randomly across questions so that option A (0) is not always the correct answer.
7. FORMAT: Return ONLY a valid JSON array of question objects matching this exact format without any markdown wrapper:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]`;

      try {
        const qsResult = await fetchOpenRouterChat([
          { role: 'system', content: 'You output strictly valid JSON arrays.' },
          { role: 'user', content: prompt }
        ], {
          maxTokens: 3000,
          timeoutMs: 12000,
          validateOutput: (text) => text.includes('[') && text.includes(']')
        });

        const rawText = qsResult.content;
        let cleaned = rawText
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const jsonStart = cleaned.indexOf('[');
        const jsonEnd = cleaned.lastIndexOf(']');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
        }
        cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

        let batchQuestions: GeneratedQuestion[] = [];
        try {
          batchQuestions = JSON.parse(cleaned);
        } catch {
          const relaxed = cleaned.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
          batchQuestions = JSON.parse(relaxed);
        }

        if (Array.isArray(batchQuestions)) {
          parsedQuestions.push(...batchQuestions);
        }
      } catch (err) {
        logError(`Failed to generate AI questions batch ${batchNumber}`, logContext, { error: err });
        break; // Stop fetching if an error occurs, proceed with what we have
      }
      
      batchNumber++;
    }

    if (parsedQuestions.length === 0) {
      return NextResponse.json({ message: 'AI failed to generate any valid questions' }, { status: 500 });
    }

    // Cap at exactly what we need, in case the AI generated a few extra
    parsedQuestions = parsedQuestions.slice(0, targetQuestions);

    // 6. Database Logic: Create Quiz & QuizQuestions
    // Give time is exactly equal to the question count (1 min per question)
    const timeLimitMinutes = parsedQuestions.length;

    const quizDoc = await Quiz.create({
      title: `Daily Contest: ${topic}`,
      description: `An AI-generated daily contest covering: ${topic}.`,
      course: new mongoose.Types.ObjectId(), // Standalone dummy ObjectId (matches contest pattern)
      instructor: instructor._id,
      questionCount: parsedQuestions.length,
      timeLimit: timeLimitMinutes, // Give time equal to question count
      isPublished: true,
      enableNegativeMarking: true,
      negativeMarks: 0.25,
    });

    const quizId = quizDoc._id;

    const questionDocs = parsedQuestions.map((q, index) => {
      return processAndRandomizeContestQuestion(q, index + 1, quizId);
    });

    await QuizQuestion.insertMany(questionDocs);

    // 7. Database Logic: Create Contest
    const now = new Date();
    const { searchParams } = new URL(req.url);
    const endInMinutesParam = searchParams.get('endInMinutes');
    const endMinutes = endInMinutesParam && !isNaN(Number(endInMinutesParam))
      ? Math.max(1, Number(endInMinutesParam))
      : 24 * 60;

    const contestStartTime = new Date(now);
    const endTime = new Date(now.getTime() + endMinutes * 60 * 1000);
    // Contest duration for a student to attempt is equal to question count
    const duration = timeLimitMinutes;

    const contestDoc = await Contest.create({
      title: `Daily Contest: ${topic}`,
      slug,
      metaTitle,
      metaDescription,
      description: `Participate in today's AI-generated contest on ${topic}. Test your knowledge and climb the leaderboard!`,
      instructor: instructor._id,
      quizzes: [{
        quiz: quizId,
        title: topic,
        order: 1,
        weight: 1
      }],
      scheduleType: 'one_time',
      status: 'published',
      startTime: contestStartTime,
      endTime,
      duration,
      solutionsReleaseAt: endTime,
      maxAttempts: 1,
      visibility: 'public',
      leaderboardVisibility: 'live',
      questionCount: parsedQuestions.length,
      totalPoints: parsedQuestions.length * 1,
      enableNegativeMarking: true,
      negativeMarks: 0.25,
      resultsDeclared: false
    });

    // Invalidate contests cache so the new contest is live immediately
    await invalidatePattern('contests:*');

    // Notify all students to join the daily contest (skip if running out of time or in dev)
    let notificationsSent = 0;
    const shouldSendNotification = process.env.NODE_ENV === 'production';

    if (shouldSendNotification && Date.now() - startTime < MAX_RUN_TIME_MS) {
      try {
        const students = await User.find({ role: 'student' }).select('_id').lean();
        const studentIds = students.map((s) => String(s._id));

        if (studentIds.length > 0) {
          await sendAdminBroadcast(studentIds, {
            title: {
              en: `🏆 Daily Contest: ${topic}`,
              hi: `🏆 दैनिक प्रतियोगिता: ${topic}`,
            },
            body: {
              en: `Compete now in today's contest on ${topic} and climb the leaderboard!`,
              hi: `${topic} पर आज की प्रतियोगिता में भाग लें और लीडरबोर्ड पर आगे बढ़ें!`,
            },
            category: 'quizzes',
            data: {
              url: `quizdo://contest/${contestDoc._id}`,
              contestId: String(contestDoc._id),
            },
          });
          notificationsSent = studentIds.length;
        }
      } catch (notifyErr) {
        logError(
          (notifyErr as Error).message || 'Failed to broadcast daily contest notifications',
          logContext,
          { action: 'sendAdminBroadcast', contestId: contestDoc._id, error: notifyErr }
        );
      }
    } else {
      logInfo('Skipped notifications due to execution time limits, local environment, or manual trigger', logContext);
    }

    return NextResponse.json({
      message: 'Successfully generated daily contest',
      contestId: contestDoc._id,
      topic,
      questionCount: parsedQuestions.length,
      notificationsSent,
    });

  } catch (error) {
    logApiError(error as Error, 'GET', '/api/cron/generate-daily-contest', logContext);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

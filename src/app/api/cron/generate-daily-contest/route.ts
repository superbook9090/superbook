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
import { getFallbackContestData } from '@/lib/ai/fallbackQuestions';
import { parseQuestionsFromAiOutput } from '@/lib/ai/quizPrompt';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time for Vercel

interface GeneratedQuestion {
  question?: string;
  prompt?: string;
  options: string[];
  correctAnswer?: number | string;
  correct_answer?: number | string;
  correctOption?: number | string;
  answer?: number | string;
  correctOptionText?: string;
  correctAnswerText?: string;
  explanation?: string;
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
    cleanOptions.push(`विकल्प ${String.fromCharCode(65 + cleanOptions.length)}`);
  }
  cleanOptions = cleanOptions.slice(0, 4);

  // 2. Identify the correct answer from AI output or text matching
  const rawCorrectText = (q.correctOptionText || q.correctAnswerText || '').trim();

  const rawCorrect =
    q.correctAnswer !== undefined
      ? q.correctAnswer
      : q.correctOption !== undefined
        ? q.correctOption
        : q.correct_answer !== undefined
          ? q.correct_answer
          : q.answer;

  let resolvedCorrectIndex = -1;

  // First priority: if correctOptionText was provided, find matching option!
  if (rawCorrectText) {
    const textIdx = cleanOptions.findIndex(
      (opt) => opt.toLowerCase() === rawCorrectText.toLowerCase()
    );
    if (textIdx !== -1) {
      resolvedCorrectIndex = textIdx;
    } else {
      const partialIdx = cleanOptions.findIndex(
        (opt) =>
          opt.toLowerCase().includes(rawCorrectText.toLowerCase()) ||
          rawCorrectText.toLowerCase().includes(opt.toLowerCase())
      );
      if (partialIdx !== -1) {
        resolvedCorrectIndex = partialIdx;
      }
    }
  }

  // Second priority: numeric index or letter index
  if (resolvedCorrectIndex === -1) {
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
        const letterMatch = trimmed.toUpperCase().match(/\b([A-D])\b/);
        if (letterMatch && letterMatch[1]) {
          resolvedCorrectIndex = letterMatch[1].charCodeAt(0) - 65;
        } else {
          const matchIdx = cleanOptions.findIndex(
            (opt) => opt.toLowerCase() === trimmed.toLowerCase()
          );
          if (matchIdx !== -1) {
            resolvedCorrectIndex = matchIdx;
          }
        }
      }
    }
  }

  // Fallback: default to option 0 if still unresolved
  if (resolvedCorrectIndex < 0 || resolvedCorrectIndex >= cleanOptions.length) {
    resolvedCorrectIndex = 0;
  }

  // 3. Mark correct item before Fisher-Yates shuffle
  const items = cleanOptions.map((text, idx) => ({
    text,
    isCorrect: idx === resolvedCorrectIndex,
  }));

  // Fisher-Yates shuffle to randomize options position fairly
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
    explanation: q.explanation || undefined,
  };
}

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/generate-daily-contest' };

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

    // 3. Configure Mixed GK & GS Contest Metadata
    const targetQuestions = 10;
    const fallbackTheme = getFallbackContestData(targetQuestions);

    const dateStr = new Date().toISOString().slice(0, 10);
    const randomSuffix = Math.random().toString(36).substring(2, 6);

    const topic = 'दैनिक मिश्रित GK & GS महा-प्रतियोगिता (Daily Mixed GK & GS Contest)';
    const contestTitle = 'दैनिक मिश्रित GK & GS महा-प्रतियोगिता';
    const slug = `daily-mixed-gk-gs-contest-${dateStr}-${randomSuffix}`;
    const metaTitle = 'दैनिक मिश्रित GK & GS महा-प्रतियोगिता | Quiz-Do Live Contest';
    const metaDescription = 'UPSC, SSC, Railway, State PSC एवं अन्य प्रतियोगी परीक्षाओं हेतु इतिहास, राजव्यवस्था, भूगोल, अर्थव्यवस्था एवं विज्ञान के 10 मिश्रित प्रश्नों की दैनिक लाइव प्रतियोगिता। भाग लें और लाइव रैंक देखें।';

    // 4. Implement AI Question Generation with Strict Single Call and Fast Timeout
    let parsedQuestions: GeneratedQuestion[] = [];

    const prompt = `You are a master question setter for Indian competitive examinations (UPSC CSE Prelims, SSC CGL/CHSL, State PSCs, RRB NTPC).
Generate a balanced, high-quality MIXED General Knowledge & General Studies (GK & GS / सामान्य ज्ञान एवं सामान्य अध्ययन) contest with EXACTLY ${targetQuestions} questions written in Hindi (Devanagari script).

DIFFICULTY LEVEL: MEDIUM (मध्यम स्तर - thoughtful, conceptual, fact-based questions typical of SSC CGL / UPSC Prelims / State PSCs). Neither kindergarten-level easy nor obscure/confusing.

SYLLABUS DISTRIBUTION (MANDATORY MIX OF TOPICS):
- 2 Questions: भारतीय इतिहास एवं राष्ट्रीय आंदोलन (Indian History & Freedom Struggle)
- 2 Questions: भारतीय राजव्यवस्था एवं संविधान (Indian Polity & Constitution)
- 2 Questions: भारत एवं विश्व का भूगोल (Geography & Environment)
- 1 Question: भारतीय अर्थव्यवस्था (Indian Economy)
- 2 Questions: सामान्य विज्ञान (General Science: Physics, Chemistry, Biology)
- 1 Question: स्टेटिक जीके / संस्थान / समसामयिकी (Static GK / Important Institutions)

CRITICAL FACTUAL ACCURACY & FORMAT REQUIREMENTS:
1. FACTUAL ACCURACY: Every question must have ONE indisputably correct, scientifically/historically verified answer.
2. 4 OPTIONS: Every question must have exactly 4 plausible, distinct options in Hindi.
3. CORRECT ANSWER MATCH: Provide "correctOption" (0 for option 1, 1 for option 2, 2 for option 3, 3 for option 4) AND "correctOptionText" (exact text of the correct option) to guarantee 100% answer accuracy.
4. EXPLANATION: Provide a concise 1-sentence factual explanation in Hindi for why that option is correct.
5. STRICT JSON OUTPUT: Return ONLY a valid JSON array of question objects without markdown wrappers:
[
  {
    "question": "प्रश्न हिंदी में",
    "options": ["विकल्प 1", "विकल्प 2", "विकल्प 3", "विकल्प 4"],
    "correctOption": 0,
    "correctOptionText": "विकल्प 1",
    "explanation": "संक्षिप्त स्पष्टीकरण"
  }
]`;

    try {
      // 14 second timeout on AI to guarantee response well within serverless limits
      const qsResult = await fetchOpenRouterChat(
        [
          { role: 'system', content: 'You are an expert exam question setter. You output strictly valid JSON arrays of questions.' },
          { role: 'user', content: prompt },
        ],
        {
          maxTokens: 2500,
          timeoutMs: 14000,
          autoSwitchOnLimit: false, // Prevent cascading retry delays that cause 504 Gateway Timeouts
          validateOutput: (text) => text.includes('[') && text.includes(']'),
        }
      );

      const parsed = parseQuestionsFromAiOutput(qsResult.content, targetQuestions);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedQuestions = parsed;
      }
    } catch (err) {
      logError('AI question generation call timed out or failed, switching to curated Mixed GK/GS question bank', logContext, { error: err });
    }

    // If AI failed or produced fewer than target questions, supplement from curated Mixed GK & GS bank
    if (parsedQuestions.length < targetQuestions) {
      logInfo(`Supplementing ${targetQuestions - parsedQuestions.length} questions from curated Mixed GK/GS question bank`, logContext);
      const remainingNeeded = targetQuestions - parsedQuestions.length;
      const additionalFallback = fallbackTheme.questions.slice(0, remainingNeeded);
      parsedQuestions.push(...additionalFallback);
    }

    // Guarantee exact target count
    parsedQuestions = parsedQuestions.slice(0, targetQuestions);

    // 5. Database Logic: Create Quiz & QuizQuestions
    const timeLimitMinutes = 10; // 10 minutes for 10 medium difficulty questions

    const quizDoc = await Quiz.create({
      title: contestTitle,
      description: `दैनिक मिश्रित GK & GS क्विज: इतिहास, राजव्यवस्था, भूगोल, अर्थव्यवस्था एवं सामान्य विज्ञान।`,
      course: new mongoose.Types.ObjectId(), // Standalone dummy ObjectId
      instructor: instructor._id,
      questionCount: parsedQuestions.length,
      timeLimit: timeLimitMinutes,
      isPublished: true,
      enableNegativeMarking: true,
      negativeMarks: 0.25,
    });

    const quizId = quizDoc._id;

    const questionDocs = parsedQuestions.map((q, index) => {
      return processAndRandomizeContestQuestion(q, index + 1, quizId);
    });

    await QuizQuestion.insertMany(questionDocs);

    // 6. Database Logic: Create Contest
    const now = new Date();
    const { searchParams } = new URL(req.url);
    const endInMinutesParam = searchParams.get('endInMinutes');
    const endMinutes = endInMinutesParam && !isNaN(Number(endInMinutesParam))
      ? Math.max(1, Number(endInMinutesParam))
      : 24 * 60; // 24 hours live window

    const contestStartTime = new Date(now);
    const endTime = new Date(now.getTime() + endMinutes * 60 * 1000);
    const duration = timeLimitMinutes;

    const contestDoc = await Contest.create({
      title: contestTitle,
      slug,
      metaTitle,
      metaDescription,
      description: `आज की दैनिक मिश्रित GK & GS महा-प्रतियोगिता में भाग लें। इसमें भारतीय इतिहास, राजव्यवस्था, भूगोल, अर्थव्यवस्था, सामान्य विज्ञान और स्टेटिक जीके के 10 महत्वपूर्ण प्रश्न शामिल हैं। अपनी तैयारी परखें और लाइव लीडरबोर्ड पर रैंक हासिल करें!`,
      instructions: `1. कुल 10 बहुविकल्पीय प्रश्न हैं।
2. प्रत्येक सही उत्तर के लिए +1 अंक मिलेगा।
3. प्रत्येक गलत उत्तर के लिए 0.25 अंक का नकारात्मक अंकन (Negative Marking) है।
4. कुल समय सीमा 10 मिनट है।
5. प्रतियोगिता समाप्त होने के पश्चात विस्तृत हल व व्याख्या उपलब्ध होगी।`,
      instructor: instructor._id,
      quizzes: [
        {
          quiz: quizId,
          title: 'मिश्रित GK & GS',
          order: 1,
          weight: 1,
        },
      ],
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
      resultsDeclared: false,
    });

    // Invalidate contests cache so the new contest is live immediately
    await invalidatePattern('contests:*');

    // 7. Non-blocking Background Notification Broadcast
    if (process.env.NODE_ENV === 'production') {
      void (async () => {
        try {
          const students = await User.find({ role: 'student' }).select('_id').lean();
          const studentIds = students.map((s) => String(s._id));

          if (studentIds.length > 0) {
            await sendAdminBroadcast(studentIds, {
              title: {
                en: `🏆 Daily Mixed GK & GS Contest is Live!`,
                hi: `🏆 दैनिक मिश्रित GK & GS महा-प्रतियोगिता लाइव है!`,
              },
              body: {
                en: `Compete now in today's mixed General Studies contest and climb the live leaderboard!`,
                hi: `आज की मिश्रित सामान्य ज्ञान व सामान्य अध्ययन प्रतियोगिता में भाग लें और लाइव रैंक हासिल करें!`,
              },
              category: 'quizzes',
              data: {
                url: `quizdo://contest/${contestDoc._id}`,
                contestId: String(contestDoc._id),
              },
            });
          }
        } catch (notifyErr) {
          logError('Failed to broadcast daily contest notifications in background', logContext, {
            error: notifyErr,
            contestId: contestDoc._id,
          });
        }
      })();
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully generated daily Mixed GK & GS contest',
      contestId: contestDoc._id,
      slug: contestDoc.slug,
      topic,
      questionCount: parsedQuestions.length,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/cron/generate-daily-contest', logContext);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

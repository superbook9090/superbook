import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import Contest from '@/models/Contest';
import { logApiError, logError } from '@/lib/logger';
import { fetchOpenRouterChat } from '@/lib/ai/openrouter';
import { requireFeature } from '@/lib/settingsHelpers';
import { invalidatePattern } from '@/lib/redis';
import { sendAdminBroadcast } from '@/lib/server/services/notifications-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max execution time for Vercel

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/generate-daily-contest' };

  try {
    // 1. Verify Vercel Cron Secret (if configured)
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
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
    const topicPrompt = `Generate a unique, engaging, and specific quiz topic relevant to India and Indian competitive exams (e.g. UPSC, SSC, Banking, State PSC, Indian GK).
Topics can cover: Indian History, Indian Geography, Indian Polity & Constitution, Indian Economy, Science & Technology in India, Indian Art & Culture, Famous Personalities of India, Environment & Wildlife of India, or Current Affairs.
Additionally, generate SEO metadata for a contest page about this topic.
Return ONLY a valid JSON object matching exactly this structure, with no markdown, quotes, or extra text:
{
  "topic": "The generated topic name",
  "slug": "seo-friendly-url-slug",
  "metaTitle": "SEO meta title (max 60 chars)",
  "metaDescription": "SEO meta description (max 160 chars)"
}`;
    
    let topic = 'General Knowledge of India';
    let slug = 'general-knowledge-of-india';
    let metaTitle = 'General Knowledge of India Quiz Contest | Quiz-Do';
    let metaDescription = 'Participate in the General Knowledge of India quiz contest and test your skills against top competitors.';
    try {
      const topicResult = await fetchOpenRouterChat([
        { role: 'user', content: topicPrompt }
      ], { maxTokens: 300, temperature: 0.8, validateOutput: (text) => text.includes('{') });
      
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

    // 5. Implement AI Question Generation Logic (Indian Context, Medium Level)
    const numQuestions = 10;
    const language = 'English';
    const prompt = `You are a master educator and expert in Indian competitive examinations (such as UPSC, SSC, State PSC, and Banking exams).
Generate a high-quality, realistic, medium-difficulty competitive contest multiple-choice quiz with EXACTLY ${numQuestions} questions on the topic: "${topic}" focused on India.

CRITICAL QUALITY & PEDAGOGICAL REQUIREMENTS:
1. INDIAN CONTEXT: All questions and options must be strictly focused on India and relevant to Indian students/aspirants.
2. DIFFICULTY: Medium level — thought-provoking, competitive, and realistic, avoiding overly simple trivia while also avoiding unreasonably obscure details.
3. EXACT QUESTION COUNT: Provide EXACTLY ${numQuestions} distinct questions written in ${language}.
4. 4 OPTIONS: Each question MUST have EXACTLY 4 distinct, plausible multiple-choice options.
5. RANDOM CORRECT ANSWER: Distribute the "correctAnswer" index (0 for A, 1 for B, 2 for C, 3 for D) randomly across questions so option A is not always the correct answer.
6. FORMAT: Return ONLY a valid JSON array of question objects matching this exact format without any markdown wrapper, commentary, or extra text:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]`;

    let parsedQuestions: GeneratedQuestion[] = [];
    try {
      const qsResult = await fetchOpenRouterChat([
         { role: 'system', content: 'You output strictly valid JSON arrays.' },
         { role: 'user', content: prompt }
      ], { 
         maxTokens: 3000, 
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
      
      // Basic fallback to handle unescaped newlines if JSON.parse fails initially
      try {
        parsedQuestions = JSON.parse(cleaned);
      } catch {
        const relaxed = cleaned.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
        parsedQuestions = JSON.parse(relaxed);
      }
    } catch (err) {
       logError('Failed to generate AI questions', logContext, { error: err });
       return NextResponse.json({ message: 'Failed to generate questions' }, { status: 500 });
    }

    if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
       return NextResponse.json({ message: 'AI returned invalid questions array' }, { status: 500 });
    }

    parsedQuestions = parsedQuestions.slice(0, numQuestions);

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
      negativeMarks: 2,
    });
    
    const quizId = quizDoc._id;

    const questionDocs = parsedQuestions.map((q, index) => {
       const opts = Array.isArray(q.options) ? q.options.slice(0, 4) : ['A', 'B', 'C', 'D'];
       while (opts.length < 4) opts.push(`Option ${opts.length + 1}`);
       let correct = q.correctAnswer;
       if (typeof correct !== 'number' || correct < 0 || correct > 3) correct = 0;

       return {
         quiz: quizId,
         order: index + 1,
         prompt: q.question || 'Unknown Question',
         options: opts,
         correctOption: correct,
         points: 10, // 10 points per question
       };
    });

    await QuizQuestion.insertMany(questionDocs);

    // 7. Database Logic: Create Contest
    const now = new Date();
    const { searchParams } = new URL(req.url);
    const endInMinutesParam = searchParams.get('endInMinutes');
    const endMinutes = endInMinutesParam && !isNaN(Number(endInMinutesParam))
      ? Math.max(1, Number(endInMinutesParam))
      : 24 * 60;

    const startTime = new Date(now);
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
      startTime,
      endTime,
      duration,
      solutionsReleaseAt: endTime,
      maxAttempts: 1,
      visibility: 'public',
      leaderboardVisibility: 'live',
      questionCount: parsedQuestions.length,
      totalPoints: parsedQuestions.length * 10,
      enableNegativeMarking: true,
      negativeMarks: 2,
      resultsDeclared: false
    });

    // Invalidate contests cache so the new contest is live immediately
    await invalidatePattern('contests:*');

    // Notify all students to join the daily contest
    let notificationsSent = 0;
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

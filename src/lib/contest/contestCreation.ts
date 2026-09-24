import mongoose from 'mongoose';
import Quiz from '@/models/Quiz';
import User from '@/models/User';
import { setQuizQuestions } from '@/domain/learning/quizContent';
import { sendAdminBroadcast } from '@/lib/server/services/notifications-service';

export interface RawContestQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points?: number;
  negativePoints?: number;
}

export interface RawContestQuizInput {
  quizId?: string;
  title?: string;
  order?: number;
  questions?: RawContestQuestion[];
}

export interface BuildQuizRefsParams {
  title: string;
  description?: string;
  duration: number;
  enableNegativeMarking?: boolean;
  negativeMarks?: number;
  userId: string;
  organizationId?: string | null;
  rawQuestions?: RawContestQuestion[];
  rawQuizzes?: RawContestQuizInput[];
}

export interface ContestQuizRef {
  quiz: mongoose.Types.ObjectId;
  title?: string;
  order: number;
  weight?: number;
}

export async function buildContestQuizRefs(params: BuildQuizRefsParams): Promise<{
  contestQuizRefs: ContestQuizRef[];
  totalQuestions: number;
  totalPoints: number;
}> {
  const {
    title,
    description,
    duration,
    enableNegativeMarking,
    negativeMarks,
    userId,
    organizationId,
    rawQuestions = [],
    rawQuizzes = [],
  } = params;

  const contestQuizRefs: ContestQuizRef[] = [];
  let totalQuestions = 0;
  let totalPoints = 0;

  // 1. Direct Question Set
  if (rawQuestions && rawQuestions.length > 0) {
    const standaloneQuiz = new Quiz({
      title: `${title} - Quiz`,
      description: description || 'Contest Question Set',
      course: new mongoose.Types.ObjectId(),
      instructor: userId,
      organizationId: organizationId || null,
      timeLimit: duration,
      isPublished: true,
      enableNegativeMarking: !!enableNegativeMarking,
      negativeMarks: typeof negativeMarks === 'number' ? negativeMarks : 0,
      questionCount: rawQuestions.length,
      version: 1,
    });
    await standaloneQuiz.save();

    await setQuizQuestions(
      standaloneQuiz._id as mongoose.Types.ObjectId,
      rawQuestions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        negativePoints: q.negativePoints,
      })),
      { bumpVersion: false }
    );

    contestQuizRefs.push({
      quiz: standaloneQuiz._id as mongoose.Types.ObjectId,
      title: title,
      order: 0,
      weight: 1,
    });

    totalQuestions += rawQuestions.length;
    totalPoints += rawQuestions.reduce((acc, q) => acc + (q.points || 1), 0);
  }

  // 2. Multiple Quizzes
  if (rawQuizzes && rawQuizzes.length > 0) {
    for (let i = 0; i < rawQuizzes.length; i++) {
      const item = rawQuizzes[i];
      if (item.quizId) {
        const existingQuiz = await Quiz.findById(item.quizId).lean<{
          _id: mongoose.Types.ObjectId;
          title: string;
          questionCount?: number;
        }>();
        if (existingQuiz) {
          contestQuizRefs.push({
            quiz: existingQuiz._id,
            title: item.title || existingQuiz.title,
            order: item.order ?? contestQuizRefs.length,
            weight: 1,
          });
          totalQuestions += existingQuiz.questionCount || 0;
          totalPoints += existingQuiz.questionCount || 0;
        }
      } else if (item.questions && item.questions.length > 0) {
        const multiQuiz = new Quiz({
          title: item.title || `${title} - Round ${i + 1}`,
          description: `Contest Section ${i + 1}`,
          course: new mongoose.Types.ObjectId(),
          instructor: userId,
          organizationId: organizationId || null,
          timeLimit: duration,
          isPublished: true,
          enableNegativeMarking: !!enableNegativeMarking,
          negativeMarks: typeof negativeMarks === 'number' ? negativeMarks : 0,
          questionCount: item.questions.length,
          version: 1,
        });
        await multiQuiz.save();

        await setQuizQuestions(
          multiQuiz._id as mongoose.Types.ObjectId,
          item.questions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
            negativePoints: q.negativePoints,
          })),
          { bumpVersion: false }
        );

        contestQuizRefs.push({
          quiz: multiQuiz._id as mongoose.Types.ObjectId,
          title: item.title || multiQuiz.title,
          order: item.order ?? contestQuizRefs.length,
          weight: 1,
        });

        totalQuestions += item.questions.length;
        totalPoints += item.questions.reduce((acc, q) => acc + (q.points || 1), 0);
      }
    }
  }

  return { contestQuizRefs, totalQuestions, totalPoints };
}

export async function broadcastNewContest(contestId: string | mongoose.Types.ObjectId, title: string) {
  try {
    const students = await User.find({ role: 'student' }).select('_id').lean();
    const studentIds = students.map((s) => String(s._id));

    if (studentIds.length > 0) {
      await sendAdminBroadcast(studentIds, {
        title: {
          en: `New Contest: ${title}`,
          hi: `नया कॉन्टेस्ट: ${title}`,
        },
        body: {
          en: 'A new contest is available for you to attempt.',
          hi: 'आपके प्रयास के लिए एक नया कॉन्टेस्ट उपलब्ध है।',
        },
        category: 'quizzes',
        data: {
          url: `quizdo://contest/${contestId}`,
          contestId: String(contestId),
        },
      });
    }
  } catch (err) {
    console.error('Failed to broadcast contest notification:', err);
  }
}

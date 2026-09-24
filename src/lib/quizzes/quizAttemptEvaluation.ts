import crypto from 'crypto';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import Enrollment from '@/models/Enrollment';
import Challenge from '@/models/Challenge';
import ChallengeAttempt from '@/models/ChallengeAttempt';
import { checkAndIssueCertificate } from '@/domain/learning/certificateIssuance';
import type { Types } from 'mongoose';

export interface QuestionGradingDoc {
  _id: Types.ObjectId;
  order: number;
  correctOption: number;
  points?: number;
  negativePoints?: number;
}

export interface SubmittedAnswerItem {
  questionId: string;
  selectedOption: number;
}

export interface GradedAnswerResult {
  question: Types.ObjectId;
  order: number;
  selectedOption: number;
  isCorrect: boolean;
}

export function gradeQuizAnswers(
  questionList: QuestionGradingDoc[],
  answers: SubmittedAnswerItem[],
  enableNegativeMarking?: boolean,
  negativeMarks?: number
) {
  const byId = new Map(questionList.map((q) => [q._id.toString(), q]));
  let correctCount = 0;
  let totalPointsAwarded = 0;
  let totalPossiblePoints = 0;

  questionList.forEach((q) => {
    totalPossiblePoints += q.points || 1;
  });

  const gradedAnswers: GradedAnswerResult[] = answers.map((answer) => {
    const q = byId.get(answer.questionId)!;
    const isAttempted = answer.selectedOption !== -1;
    const isCorrect = isAttempted && answer.selectedOption === q.correctOption;

    if (isCorrect) {
      correctCount++;
      totalPointsAwarded += q.points || 1;
    } else if (isAttempted && enableNegativeMarking) {
      const penalty =
        typeof q.negativePoints === 'number' && q.negativePoints > 0
          ? q.negativePoints
          : (negativeMarks || 0);
      totalPointsAwarded -= penalty;
    }

    return {
      question: q._id,
      order: q.order,
      selectedOption: answer.selectedOption,
      isCorrect: Boolean(isCorrect),
    };
  });

  const score =
    totalPossiblePoints > 0
      ? Math.max(0, Math.min(100, Math.round((totalPointsAwarded / totalPossiblePoints) * 100)))
      : 0;

  return { gradedAnswers, correctCount, score };
}

export async function updateCourseEnrollmentProgress(studentId: string, courseId: Types.ObjectId) {
  const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
  if (!enrollment) return;

  const courseQuizzes = await Quiz.countDocuments({ course: courseId, isPublished: true });
  const completedDistinct = await QuizAttempt.distinct('quiz', {
    student: studentId,
    course: courseId,
    status: { $in: ['completed', 'force_submitted'] },
  });
  const completedQuizzes = completedDistinct.length;
  const quizProgress = courseQuizzes > 0 ? (completedQuizzes / courseQuizzes) * 100 : 0;
  enrollment.progress = Math.min(100, Math.round(quizProgress));

  if (enrollment.progress >= 100) {
    enrollment.status = 'completed';
    enrollment.completedAt = new Date();
  }
  await enrollment.save();

  await checkAndIssueCertificate(studentId, String(courseId));
}

export async function recordChallengeAttemptIfLinked(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attempt: any,
  sessionUser: { id: string; name?: string | null },
  score: number,
  correctCount: number,
  totalQuestions: number,
  gradedAnswers: GradedAnswerResult[]
): Promise<string | undefined> {
  if (!attempt.challenge) return undefined;

  try {
    const challenge = await Challenge.findById(attempt.challenge);
    if (!challenge) return undefined;

    let isWon = false;
    if (score > challenge.targetScore) {
      isWon = true;
    } else if (
      score === challenge.targetScore &&
      attempt.timeTaken > 0 &&
      challenge.timeTaken > 0 &&
      attempt.timeTaken < challenge.timeTaken
    ) {
      isWon = true;
    }

    const claimToken = `clm_${crypto.randomBytes(16).toString('hex')}`;
    await ChallengeAttempt.create({
      challenge: challenge._id,
      challenger: challenge.creator,
      opponentUser: sessionUser.id,
      guestSessionId: `usr_${sessionUser.id}`,
      guestName: sessionUser.name || 'Quizdo Scholar',
      score,
      correctCount,
      totalQuestions,
      timeTaken: attempt.timeTaken,
      isWon,
      claimToken,
      converted: true,
      answers: gradedAnswers.map((a) => ({
        questionId: a.question,
        order: a.order,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })),
    });

    await Challenge.updateOne({ _id: challenge._id }, { $inc: { attemptsCount: 1 } });
    return challenge.slug;
  } catch (challErr) {
    console.error('Failed to record challenge attempt:', challErr);
    return undefined;
  }
}

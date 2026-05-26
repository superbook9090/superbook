import type { Types } from 'mongoose';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import { isQuizTimeExpired, computeQuizTimeTakenSeconds } from '@/lib/quiz/attemptTime';
import { listQuestionsForQuiz } from '@/domain/learning/quizContent';

type AttemptDoc = {
  _id: Types.ObjectId;
  status: string;
  startedAt: Date;
  quiz: Types.ObjectId;
  course: Types.ObjectId;
  quizVersion: number;
  totalQuestions: number;
  violationCount?: number;
};

/**
 * If attempt is in progress and past time limit, grade unanswered and mark force_submitted.
 * Returns true when the attempt was finalized.
 */
export async function finalizeExpiredQuizAttemptIfNeeded(
  attempt: AttemptDoc
): Promise<boolean> {
  if (attempt.status !== 'in_progress') {
    return false;
  }

  const quiz = (await Quiz.findById(attempt.quiz).select('timeLimit').lean()) as {
    timeLimit: number;
  } | null;
  if (!quiz) {
    return false;
  }

  if (!isQuizTimeExpired(attempt.startedAt, quiz.timeLimit)) {
    return false;
  }

  const qRows = await listQuestionsForQuiz(attempt.quiz);
  const questionList = qRows as unknown as {
    _id: Types.ObjectId;
    order: number;
    correctOption: number;
  }[];

  const gradedAnswers = questionList.map((q) => ({
    question: q._id,
    order: q.order,
    selectedOption: -1,
    isCorrect: false,
  }));

  const correctCount = 0;
  const totalQuestions = questionList.length;
  const score = 0;

  await QuizAttempt.findByIdAndUpdate(attempt._id, {
    $set: {
      answers: gradedAnswers,
      correctCount,
      score,
      totalQuestions,
      timeTaken: computeQuizTimeTakenSeconds(attempt.startedAt, quiz.timeLimit),
      status: 'force_submitted',
      submittedAt: new Date(),
      violationCount: (attempt.violationCount || 0) + 1,
    },
  });

  return true;
}

import type { Types } from 'mongoose';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';

export type IncomingQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

/** Replace all questions for a quiz. Optionally bump quiz.version (content change). */
export async function setQuizQuestions(
  quizId: Types.ObjectId,
  questions: IncomingQuestion[],
  options: { bumpVersion: boolean }
): Promise<void> {
  await QuizQuestion.deleteMany({ quiz: quizId });
  if (questions.length === 0) {
    await Quiz.updateOne(
      { _id: quizId },
      { $set: { questionCount: 0 }, ...(options.bumpVersion ? { $inc: { version: 1 } } : {}) }
    );
    return;
  }
  const docs = questions.map((q, order) => ({
    quiz: quizId,
    order,
    prompt: q.question,
    options: q.options,
    correctOption: q.correctAnswer,
  }));
  await QuizQuestion.insertMany(docs);
  await Quiz.updateOne(
    { _id: quizId },
    {
      $set: { questionCount: docs.length },
      ...(options.bumpVersion ? { $inc: { version: 1 } } : {}),
    }
  );
}

export async function listQuestionsForQuiz(quizId: Types.ObjectId) {
  return QuizQuestion.find({ quiz: quizId }).sort({ order: 1 }).lean();
}

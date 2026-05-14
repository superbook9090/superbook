import mongoose, { Document, Schema } from 'mongoose';

export interface IGradedAnswer {
  question: mongoose.Types.ObjectId;
  order: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  student: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  quizVersion: number;
  answers: IGradedAnswer[];
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  startedAt: Date;
  submittedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned' | 'force_submitted';
  attemptNumber: number;
  violationCount: number;
}

const gradedAnswerSchema = new Schema<IGradedAnswer>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
    order: { type: Number, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    quizVersion: { type: Number, required: true, default: 1 },
    answers: [gradedAnswerSchema],
    score: { type: Number, default: 0, min: 0, max: 100 },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned', 'force_submitted'],
      default: 'in_progress',
    },
    attemptNumber: { type: Number, default: 1 },
    violationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, course: 1, startedAt: -1 });
quizAttemptSchema.index({ student: 1, startedAt: -1 });
quizAttemptSchema.index({ quiz: 1, status: 1, score: -1 });
quizAttemptSchema.index({ course: 1, status: 1, score: -1 });

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

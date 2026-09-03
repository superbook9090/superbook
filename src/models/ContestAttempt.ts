import mongoose, { Document, Schema } from 'mongoose';

export interface IContestGradedAnswer {
  quizId?: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  order: number;
  selectedOption: number;
  isCorrect: boolean;
  points: number;
}

export interface IContestAttempt extends Document {
  _id: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  contest: mongoose.Types.ObjectId;
  answers: IContestGradedAnswer[];
  score: number;
  percentage: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  startedAt: Date;
  submittedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned' | 'force_submitted' | 'timed_out';
  attemptNumber: number;
  violationCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const contestGradedAnswerSchema = new Schema<IContestGradedAnswer>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    question: { type: Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
    order: { type: Number, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
    points: { type: Number, default: 1 },
  },
  { _id: false }
);

const contestAttemptSchema = new Schema<IContestAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    contest: { type: Schema.Types.ObjectId, ref: 'Contest', required: true },
    answers: [contestGradedAnswerSchema],
    score: { type: Number, default: 0, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned', 'force_submitted', 'timed_out'],
      default: 'in_progress',
    },
    attemptNumber: { type: Number, default: 1 },
    violationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

contestAttemptSchema.index({ contest: 1, student: 1, attemptNumber: 1 });
contestAttemptSchema.index({ contest: 1, status: 1, score: -1, timeTaken: 1, submittedAt: 1 });
contestAttemptSchema.index({ student: 1, contest: 1 });
contestAttemptSchema.index({ student: 1, startedAt: -1 });

export default mongoose.models.ContestAttempt ||
  mongoose.model<IContestAttempt>('ContestAttempt', contestAttemptSchema);

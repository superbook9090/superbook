import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  student: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number; // percentage 0-100
  correctCount: number;
  totalQuestions: number;
  timeTaken: number; // in seconds
  startedAt: Date;
  submittedAt?: Date;
  status: 'in_progress' | 'completed' | 'abandoned' | 'force_submitted';
  attemptNumber: number; // for multiple attempts
  violationCount: number; // number of anti-cheating violations
}

const answerSchema = new Schema<IAnswer>({
  questionIndex: { type: Number, required: true },
  selectedOption: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
});

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    answers: [answerSchema],
    score: { type: Number, default: 0, min: 0, max: 100 },
    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned', 'force_submitted'], default: 'in_progress' },
    attemptNumber: { type: Number, default: 1 },
    violationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, course: 1 });
quizAttemptSchema.index({ student: 1, status: 1 });
quizAttemptSchema.index({ quiz: 1, status: 1 });
quizAttemptSchema.index({ course: 1, status: 1 });
quizAttemptSchema.index({ quiz: 1, score: 1 }); // for analytics
quizAttemptSchema.index({ startedAt: -1 });
quizAttemptSchema.index({ submittedAt: -1 });

// Additional indexes for leaderboard performance
quizAttemptSchema.index({ quiz: 1, status: 1, score: -1 }); // Quiz leaderboard sorting
quizAttemptSchema.index({ course: 1, status: 1, score: -1 }); // Course leaderboard sorting
quizAttemptSchema.index({ status: 1, score: -1 }); // General performance queries

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

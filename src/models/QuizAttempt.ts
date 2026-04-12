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
  status: 'in_progress' | 'completed' | 'abandoned';
  attemptNumber: number; // for multiple attempts
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
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    attemptNumber: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
quizAttemptSchema.index({ student: 1, quiz: 1 });
quizAttemptSchema.index({ student: 1, course: 1 });
quizAttemptSchema.index({ student: 1, status: 1 });
quizAttemptSchema.index({ quiz: 1, score: 1 }); // for analytics

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
  creator: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  quizAttempt: mongoose.Types.ObjectId;
  course?: mongoose.Types.ObjectId | null;
  targetScore: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  selectedQuestions: mongoose.Types.ObjectId[];
  slug: string;
  status: 'active' | 'expired' | 'disabled';
  viewsCount: number;
  attemptsCount: number;
  conversionsCount: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const challengeSchema = new Schema<IChallenge>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    quizAttempt: { type: Schema.Types.ObjectId, ref: 'QuizAttempt', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', default: null },
    targetScore: { type: Number, required: true, min: 0, max: 100 },
    correctCount: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    timeTaken: { type: Number, default: 0 },
    selectedQuestions: [{ type: Schema.Types.ObjectId, ref: 'QuizQuestion' }],
    slug: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'disabled'],
      default: 'active',
      index: true,
    },
    viewsCount: { type: Number, default: 0 },
    attemptsCount: { type: Number, default: 0 },
    conversionsCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

challengeSchema.index({ creator: 1, createdAt: -1 });
challengeSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', challengeSchema);

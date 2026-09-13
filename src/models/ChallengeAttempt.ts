import mongoose, { Document, Schema } from 'mongoose';

export interface IChallengeAnswer {
  questionId: mongoose.Types.ObjectId;
  order: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface IChallengeAttempt extends Document {
  challenge: mongoose.Types.ObjectId;
  challenger: mongoose.Types.ObjectId;
  opponentUser?: mongoose.Types.ObjectId | null;
  guestSessionId: string;
  guestName: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  isWon: boolean;
  claimToken: string;
  converted: boolean;
  answers: IChallengeAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

const challengeAnswerSchema = new Schema<IChallengeAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
    order: { type: Number, required: true },
    selectedOption: { type: Number, required: true },
    isCorrect: { type: Boolean, required: true },
  },
  { _id: false }
);

const challengeAttemptSchema = new Schema<IChallengeAttempt>(
  {
    challenge: { type: Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    challenger: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    opponentUser: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    guestSessionId: { type: String, required: true, index: true },
    guestName: { type: String, required: true, trim: true, maxlength: 60 },
    score: { type: Number, required: true, min: 0, max: 100 },
    correctCount: { type: Number, required: true, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    timeTaken: { type: Number, default: 0 },
    isWon: { type: Boolean, default: false },
    claimToken: { type: String, required: true, unique: true, index: true },
    converted: { type: Boolean, default: false, index: true },
    answers: [challengeAnswerSchema],
  },
  { timestamps: true }
);

challengeAttemptSchema.index({ challenge: 1, createdAt: -1 });
challengeAttemptSchema.index({ challenger: 1, createdAt: -1 });

export default mongoose.models.ChallengeAttempt ||
  mongoose.model<IChallengeAttempt>('ChallengeAttempt', challengeAttemptSchema);

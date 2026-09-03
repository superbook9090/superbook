import mongoose, { Document, Schema } from 'mongoose';

export interface IContestPrize {
  rank: number | string;
  title: string;
  description?: string;
  rewardType?: 'trophy' | 'certificate' | 'cash' | 'points' | 'gift' | 'badge' | 'other';
  value?: string;
}

export interface IContestQuizRef {
  quiz: mongoose.Types.ObjectId;
  title?: string;
  order: number;
  weight?: number;
}

export interface IContest extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  instructions?: string;
  instructor: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  quizzes: IContestQuizRef[];
  scheduleType: 'one_time' | 'daily' | 'weekly';
  prizes: IContestPrize[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  startTime: Date;
  endTime: Date;
  duration: number; // Duration in minutes
  solutionsReleaseAt: Date;
  maxAttempts: number;
  maxParticipants?: number | null;
  visibility: 'public' | 'organization' | 'unlisted';
  leaderboardVisibility: 'live' | 'after_end' | 'hidden';
  questionCount: number;
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const contestPrizeSchema = new Schema<IContestPrize>(
  {
    rank: { type: Schema.Types.Mixed, required: true },
    title: { type: String, required: true },
    description: { type: String },
    rewardType: {
      type: String,
      enum: ['trophy', 'certificate', 'cash', 'points', 'gift', 'badge', 'other'],
      default: 'trophy',
    },
    value: { type: String },
  },
  { _id: false }
);

const contestQuizRefSchema = new Schema<IContestQuizRef>(
  {
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    title: { type: String },
    order: { type: Number, default: 0 },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const contestSchema = new Schema<IContest>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    instructions: { type: String, trim: true, maxlength: 10000 },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    quizzes: [contestQuizRefSchema],
    scheduleType: {
      type: String,
      enum: ['one_time', 'daily', 'weekly'],
      default: 'one_time',
    },
    prizes: [contestPrizeSchema],
    status: {
      type: String,
      enum: ['draft', 'published', 'cancelled', 'completed'],
      default: 'published',
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true, min: 1 },
    solutionsReleaseAt: { type: Date, required: true },
    maxAttempts: { type: Number, default: 1, min: 1 },
    maxParticipants: { type: Number, default: null },
    visibility: {
      type: String,
      enum: ['public', 'organization', 'unlisted'],
      default: 'public',
    },
    leaderboardVisibility: {
      type: String,
      enum: ['live', 'after_end', 'hidden'],
      default: 'live',
    },
    questionCount: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

contestSchema.index({ startTime: 1, endTime: 1, status: 1 });
contestSchema.index({ instructor: 1 });
contestSchema.index({ organizationId: 1, status: 1 });
contestSchema.index({ scheduleType: 1 });
contestSchema.index({ createdAt: -1 });

export default mongoose.models.Contest || mongoose.model<IContest>('Contest', contestSchema);

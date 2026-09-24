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
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
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
  enableNegativeMarking?: boolean;
  negativeMarks?: number;
  resultsDeclared: boolean;
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
    // Omit when unset — do not default to null (breaks unique index on slug).
    slug: { type: String, trim: true, lowercase: true, maxlength: 240, default: undefined },
    metaTitle: { type: String, trim: true, maxlength: 70, default: null },
    metaDescription: { type: String, trim: true, maxlength: 180, default: null },
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
    enableNegativeMarking: { type: Boolean, default: false },
    negativeMarks: { type: Number, default: 0, min: 0 },
    resultsDeclared: { type: Boolean, default: false },
  },
  { timestamps: true }
);

contestSchema.index({ startTime: 1, endTime: 1, status: 1 });
contestSchema.index({ instructor: 1 });
contestSchema.index({ organizationId: 1, status: 1 });
contestSchema.index({ scheduleType: 1 });
contestSchema.index({ createdAt: -1 });
// Only index non-empty slugs so contests without a slug never collide.
contestSchema.index(
  { slug: 1 },
  {
    unique: true,
    name: 'slug_1_unique_nonempty',
    partialFilterExpression: { slug: { $gt: '' } },
  }
);

contestSchema.pre('save', function stripEmptySlug() {
  if (this.slug === null || this.slug === '') {
    this.set('slug', undefined);
  }
});

const Contest = (mongoose.models.Contest as mongoose.Model<IContest>) || mongoose.model<IContest>('Contest', contestSchema);

let indexesEnsured = false;

export async function ensureContestIndexes(): Promise<void> {
  if (indexesEnsured) return;

  const collection = Contest.collection;

  await collection.updateMany(
    { $or: [{ slug: null }, { slug: '' }] },
    { $unset: { slug: '' } }
  );

  const indexes = await collection.indexes();
  for (const idx of indexes) {
    const key = idx.key as Record<string, number> | undefined;
    if (!key || key.slug !== 1 || !idx.unique) continue;

    const hasNonemptyFilter =
      idx.partialFilterExpression &&
      typeof idx.partialFilterExpression === 'object' &&
      'slug' in (idx.partialFilterExpression as Record<string, unknown>) &&
      (idx.partialFilterExpression as { slug?: { $gt?: string } }).slug?.$gt === '';

    if (!hasNonemptyFilter && idx.name) {
      try {
        await collection.dropIndex(idx.name);
      } catch (error) {
        const code = (error as { code?: number }).code;
        if (code !== 27) throw error; // IndexNotFound
      }
    }
  }

  await Contest.syncIndexes();
  indexesEnsured = true;
}

export default Contest;

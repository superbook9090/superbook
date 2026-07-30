import mongoose, { Document, Schema } from 'mongoose';

/** Course aggregate — no embedded lesson ids; use Chapter / Lesson collections + counters. */
export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  price: number;
  thumbnail: string;
  category: string;
  /** UI locale (en/hi). Named `locale` so it never collides with MongoDB text-index `language` override. */
  locale: 'en' | 'hi';
  isPublished: boolean;
  /** Set by the instructor when the course content is finished; unlocks certificate issuance. */
  isCompleted: boolean;
  completedAt?: Date | null;
  /** Denormalized for listing cards and sort. */
  chapterCount: number;
  lessonCount: number;
  enrolledCount: number;
  /** When set, course is private — students need this code to enroll. */
  courseCode?: string | null;
  /** SEO-friendly URL slug for public course pages */
  slug?: string | null;
  /** For continue-learning tiles without loading lessons. */
  lastPublishedLesson?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: String,
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    price: { type: Number, default: 0 },
    thumbnail: String,
    category: String,
    locale: { type: String, enum: ['en', 'hi'], default: 'en' },
    isPublished: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    chapterCount: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    courseCode: { type: String, default: undefined, trim: true, uppercase: true },
    // Omit when unset — do not default to null (breaks unique index on slug).
    slug: { type: String, trim: true, lowercase: true, maxlength: 240, default: undefined },
    lastPublishedLesson: { type: Schema.Types.ObjectId, ref: 'Lesson', default: null },
  },
  { timestamps: true }
);

courseSchema.index({ instructor: 1 });
courseSchema.index({ organizationId: 1, isPublished: 1, lessonCount: -1 });
courseSchema.index({ organizationId: 1, isPublished: 1, createdAt: -1 });
courseSchema.index({ instructor: 1, organizationId: 1 });
courseSchema.index({ isPublished: 1, category: 1 });
// Only index non-empty slugs so courses without a slug never collide.
courseSchema.index(
  { slug: 1 },
  {
    unique: true,
    name: 'slug_1_unique_nonempty',
    partialFilterExpression: { slug: { $gt: '' } },
  }
);
courseSchema.index({ createdAt: -1 });
courseSchema.index({ courseCode: 1 }, { unique: true, sparse: true });

courseSchema.pre('save', function stripEmptySlug() {
  if (this.slug === null || this.slug === '') {
    this.set('slug', undefined);
  }
});

const Course =
  (mongoose.models.Course as mongoose.Model<ICourse>) ||
  mongoose.model<ICourse>('Course', courseSchema);

let indexesEnsured = false;

/**
 * Repair legacy slug index/data: drop old slug_1 unique index, unset null slugs, sync indexes.
 * Safe to call repeatedly; runs once per process.
 */
export async function ensureCourseIndexes(): Promise<void> {
  if (indexesEnsured) return;

  const collection = Course.collection;

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

  await Course.syncIndexes();
  indexesEnsured = true;
}

export default Course;

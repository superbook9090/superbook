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
    chapterCount: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
    enrolledCount: { type: Number, default: 0 },
    courseCode: { type: String, default: undefined, trim: true, uppercase: true },
    slug: { type: String, trim: true, lowercase: true, maxlength: 240, default: null },
    lastPublishedLesson: { type: Schema.Types.ObjectId, ref: 'Lesson', default: null },
  },
  { timestamps: true }
);

courseSchema.index({ instructor: 1 });
courseSchema.index({ organizationId: 1, isPublished: 1, lessonCount: -1 });
courseSchema.index({ organizationId: 1, isPublished: 1, createdAt: -1 });
courseSchema.index({ instructor: 1, organizationId: 1 });
courseSchema.index({ isPublished: 1, category: 1 });
courseSchema.index({ slug: 1 }, { unique: true, sparse: true });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ courseCode: 1 }, { unique: true, sparse: true });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

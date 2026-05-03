import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  price: number;
  thumbnail: string;
  category: string;
  isPublished: boolean;
  lessons: mongoose.Types.ObjectId[];
  enrolledCount?: number;
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
    isPublished: { type: Boolean, default: false },
    enrolledCount: { type: Number, default: 0 },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ category: 1 });

export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);
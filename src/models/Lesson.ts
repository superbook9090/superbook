import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  chapter: mongoose.Types.ObjectId;
  content: string;
  videoUrl?: string;
  order: number;
  duration: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    chapter: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    content: String,
    videoUrl: String,
    order: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

lessonSchema.index({ course: 1, chapter: 1, order: 1 });
lessonSchema.index({ course: 1, isPublished: 1 });
lessonSchema.index({ chapter: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', lessonSchema);

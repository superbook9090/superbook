import mongoose, { Document, Schema } from 'mongoose';

export interface IChapter extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    summary: { type: String, maxlength: 2000 },
    order: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index({ course: 1, order: 1 }, { unique: true });

export default mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', chapterSchema);

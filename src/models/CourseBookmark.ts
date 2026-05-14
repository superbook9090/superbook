import mongoose, { Document, Schema } from 'mongoose';

export interface ICourseBookmark extends Document {
  user: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  createdAt: Date;
}

const courseBookmarkSchema = new Schema<ICourseBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

courseBookmarkSchema.index({ user: 1, course: 1 }, { unique: true });
courseBookmarkSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.CourseBookmark ||
  mongoose.model<ICourseBookmark>('CourseBookmark', courseBookmarkSchema);

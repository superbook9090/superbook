import mongoose, { Document, Schema } from 'mongoose';

/** One row per student–lesson completion (scalable vs unbounded arrays on Enrollment). */
export interface ILessonCompletion extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  completedAt: Date;
}

const lessonCompletionSchema = new Schema<ILessonCompletion>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

lessonCompletionSchema.index({ student: 1, lesson: 1 }, { unique: true });
lessonCompletionSchema.index({ student: 1, course: 1, completedAt: -1 });
lessonCompletionSchema.index({ course: 1, lesson: 1 });

export default mongoose.models.LessonCompletion ||
  mongoose.model<ILessonCompletion>('LessonCompletion', lessonCompletionSchema);

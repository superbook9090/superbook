import mongoose, { Document, Schema } from 'mongoose';

/** Quiz metadata — questions live in `QuizQuestion` collection. */
export interface IQuiz extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  questionCount: number;
  /** Bump when question set is replaced (attempts snapshot this version). */
  version: number;
  timeLimit: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    questionCount: { type: Number, default: 0 },
    version: { type: Number, default: 1 },
    timeLimit: { type: Number, default: 30 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

quizSchema.index({ course: 1, isPublished: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ organizationId: 1, isPublished: 1 });
quizSchema.index({ createdAt: -1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', quizSchema);

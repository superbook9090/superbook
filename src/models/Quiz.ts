import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
}

export interface IQuiz extends Document {
  title: string;
  description: string;
  course: mongoose.Types.ObjectId;
  instructor: mongoose.Types.ObjectId;
  questions: IQuestion[];
  timeLimit: number; // in minutes
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
});

const quizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: String,
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [questionSchema],
    timeLimit: { type: Number, default: 30 },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for frequently queried fields
quizSchema.index({ course: 1 });
quizSchema.index({ instructor: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ createdAt: -1 });

export default mongoose.models.Quiz || mongoose.model<IQuiz>('Quiz', quizSchema);

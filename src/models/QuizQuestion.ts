import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion extends Document {
  _id: mongoose.Types.ObjectId;
  quiz: mongoose.Types.ObjectId;
  order: number;
  prompt: string;
  options: string[];
  correctOption: number;
  points: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    order: { type: Number, required: true },
    prompt: { type: String, required: true, maxlength: 2000 },
    options: [{ type: String, required: true }],
    correctOption: { type: Number, required: true, min: 0 },
    points: { type: Number, default: 1, min: 0 },
  },
  { timestamps: true }
);

quizQuestionSchema.index({ quiz: 1, order: 1 }, { unique: true });

export default mongoose.models.QuizQuestion || mongoose.model<IQuizQuestion>('QuizQuestion', quizQuestionSchema);

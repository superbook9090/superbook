import mongoose, { Document, Schema } from 'mongoose';

export interface IMistakeBookmark extends Document {
  user: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  sourceType: 'contest' | 'quiz';
  sourceId?: mongoose.Types.ObjectId;
  sourceTitle?: string;
  prompt: string;
  options: string[];
  correctOption: number;
  selectedOption: number;
  explanation?: string;
  mastered: boolean;
  reviewedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const mistakeBookmarkSchema = new Schema<IMistakeBookmark>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    question: { type: Schema.Types.ObjectId, ref: 'QuizQuestion', required: true },
    sourceType: { type: String, enum: ['contest', 'quiz'], default: 'contest' },
    sourceId: { type: Schema.Types.ObjectId, default: null },
    sourceTitle: { type: String, default: 'Practice Test' },
    prompt: { type: String, required: true },
    options: [{ type: String }],
    correctOption: { type: Number, required: true },
    selectedOption: { type: Number, default: -1 },
    explanation: { type: String, default: null },
    mastered: { type: Boolean, default: false, index: true },
    reviewedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

mistakeBookmarkSchema.index({ user: 1, question: 1 }, { unique: true });
mistakeBookmarkSchema.index({ user: 1, mastered: 1, createdAt: -1 });

export default mongoose.models.MistakeBookmark ||
  mongoose.model<IMistakeBookmark>('MistakeBookmark', mistakeBookmarkSchema);

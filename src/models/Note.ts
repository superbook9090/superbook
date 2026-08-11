import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  wordCount: number;
  color?: string;
  isPinned?: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    content: {
      type: String,
      required: true,
      default: '',
    },
    wordCount: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      default: 'blue',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user note querying sorted by pinned status and update time
noteSchema.index({ userId: 1, isPinned: -1, updatedAt: -1 });

export default mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

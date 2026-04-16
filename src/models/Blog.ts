import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  topic: string;
  author: mongoose.Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
blogSchema.index({ topic: 1, isPublished: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ createdAt: -1 });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

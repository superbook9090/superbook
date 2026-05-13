import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  topic: string;
  language: string;
  author: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
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
    language: {
      type: String,
      required: true,
      default: 'en',
      enum: ['en', 'hi'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
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
blogSchema.index({ organizationId: 1 });
blogSchema.index({ organizationId: 1, isPublished: 1, createdAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ topic: 1, isPublished: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ language: 1 });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

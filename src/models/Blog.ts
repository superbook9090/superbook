import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  content: string;
  topic: string;
  language: string;
  slug?: string | null;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  visibility: 'public' | 'organization';
  isFeatured: boolean;
  viewCount: number;
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
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 240,
      default: null,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 320,
      default: null,
    },
    metaTitle: {
      type: String,
      trim: true,
      maxlength: 70,
      default: null,
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 180,
      default: null,
    },
    visibility: {
      type: String,
      enum: ['public', 'organization'],
      default: 'organization',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
      index: true,
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
blogSchema.index({ slug: 1 }, { unique: true, sparse: true });
blogSchema.index({ visibility: 1, isPublished: 1, createdAt: -1 });
blogSchema.index({ visibility: 1, isPublished: 1, isFeatured: -1, createdAt: -1 });
blogSchema.index({ visibility: 1, isPublished: 1, viewCount: -1, createdAt: -1 });

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', blogSchema);

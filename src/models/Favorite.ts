import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  blogs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One document per user
    },
    blogs: {
      type: [Schema.Types.ObjectId],
      ref: 'Blog',
      default: [], // Default empty array
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimal performance
favoriteSchema.index({ user: 1 }, { unique: true }); // Fast user lookups
favoriteSchema.index({ blogs: 1 }); // For reverse lookups if needed
favoriteSchema.index({ updatedAt: -1 }); // For recent activity

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', favoriteSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IFavorite extends Document {
  user: mongoose.Types.ObjectId;
  blog: mongoose.Types.ObjectId;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate favorites
favoriteSchema.index({ user: 1, blog: 1 }, { unique: true });
favoriteSchema.index({ user: 1 });
favoriteSchema.index({ createdAt: -1 });

export default mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', favoriteSchema);

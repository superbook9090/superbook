import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  deviceToken: string;
  platform: 'android' | 'ios' | 'web';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationTokenSchema = new Schema<INotificationToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deviceToken: { type: String, required: true, unique: true },
    platform: { type: String, enum: ['android', 'ios', 'web'], required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
notificationTokenSchema.index({ userId: 1 });
notificationTokenSchema.index({ deviceToken: 1 });
notificationTokenSchema.index({ userId: 1, isActive: 1 });

// Auto-delete token after 30 days of inactivity (1 month)
// Since we update the token on app load, active users won't be deleted
notificationTokenSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.models.NotificationToken || 
  mongoose.model<INotificationToken>('NotificationToken', notificationTokenSchema);

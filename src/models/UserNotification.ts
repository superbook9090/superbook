import mongoose, { Document, Schema } from 'mongoose';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';

export interface IUserNotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  category: NotificationCategory;
  data?: Record<string, string>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userNotificationSchema = new Schema<IUserNotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: {
      en: { type: String, required: true },
      hi: { type: String },
    },
    body: {
      en: { type: String, required: true },
      hi: { type: String },
    },
    category: {
      type: String,
      enum: ['lessons', 'quizzes', 'assignments', 'liveClasses', 'announcements', 'system'],
      required: true,
    },
    data: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userNotificationSchema.index({ userId: 1, createdAt: -1 });
userNotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.models.UserNotification ||
  mongoose.model<IUserNotification>('UserNotification', userNotificationSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: mongoose.Types.ObjectId;
  muteAll: boolean;
  disablePush: boolean;
  mutedCourses: mongoose.Types.ObjectId[];
  categories: {
    lessons: boolean;
    quizzes: boolean;
    assignments: boolean;
    liveClasses: boolean;
    announcements: boolean;
    system: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    muteAll: { type: Boolean, default: false },
    disablePush: { type: Boolean, default: false },
    mutedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    categories: {
      lessons: { type: Boolean, default: true },
      quizzes: { type: Boolean, default: true },
      assignments: { type: Boolean, default: true },
      liveClasses: { type: Boolean, default: true },
      announcements: { type: Boolean, default: true },
      system: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Indexes
notificationPreferenceSchema.index({ userId: 1 });

export default mongoose.models.NotificationPreference || 
  mongoose.model<INotificationPreference>('NotificationPreference', notificationPreferenceSchema);

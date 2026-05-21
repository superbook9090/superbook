import mongoose, { Document, Schema } from 'mongoose';

export interface IVideoProgress extends Document {
  student: mongoose.Types.ObjectId;
  lesson: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  watchTime: number;
  duration: number;
  completed: boolean;
  lastWatchedAt: Date;
}

const videoProgressSchema = new Schema<IVideoProgress>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    watchTime: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    lastWatchedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

videoProgressSchema.index({ student: 1, lesson: 1 }, { unique: true });
videoProgressSchema.index({ student: 1, course: 1 });

export default mongoose.models.VideoProgress || mongoose.model<IVideoProgress>('VideoProgress', videoProgressSchema);

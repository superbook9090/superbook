import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  enrolledAt: Date;
  progress: number; // 0-100 percentage
  completedLessons: mongoose.Types.ObjectId[];
  status: 'active' | 'completed' | 'dropped';
  completedAt?: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    status: { type: String, enum: ['active', 'completed', 'dropped'], default: 'active' },
    completedAt: Date,
  },
  { timestamps: true }
);

// Prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Compound index for efficient queries
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);

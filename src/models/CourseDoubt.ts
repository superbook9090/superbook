import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDoubtQuestion {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  question: string;
  teacherId?: Types.ObjectId | null;
  answer?: string | null;
  status: 'pending' | 'answered';
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseDoubt extends Document {
  courseId: Types.ObjectId;
  doubts: IDoubtQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const doubtQuestionSchema = new Schema<IDoubtQuestion>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    answer: { type: String, default: null },
    status: { type: String, enum: ['pending', 'answered'], default: 'pending' },
  },
  { timestamps: true }
);

const courseDoubtSchema = new Schema<ICourseDoubt>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, unique: true },
    doubts: [doubtQuestionSchema],
  },
  { timestamps: true }
);

// Indexes
courseDoubtSchema.index({ courseId: 1 });
courseDoubtSchema.index({ 'doubts.studentId': 1 });
courseDoubtSchema.index({ 'doubts.status': 1 });

const CourseDoubt =
  (mongoose.models.CourseDoubt as mongoose.Model<ICourseDoubt>) ||
  mongoose.model<ICourseDoubt>('CourseDoubt', courseDoubtSchema);

export default CourseDoubt;

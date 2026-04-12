import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: mongoose.Types.ObjectId;
  price: number;
  thumbnail: string;
  category: string;
  isPublished: boolean;
  lessons: mongoose.Types.ObjectId[];
  enrolledStudents: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: String,
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, default: 0 },
    thumbnail: String,
    category: String,
    isPublished: { type: Boolean, default: false },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);
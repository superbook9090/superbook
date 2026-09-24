import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyRunLog {
  date: string;
  lessonsCreated: number;
  status: string;
  error?: string;
  runDurationMs?: number;
  timestamp: Date;
}

export interface ICourseGenerationProgress extends Document {
  course: mongoose.Types.ObjectId;
  examKey: string;
  status: 'pending' | 'in_progress' | 'quota_exhausted' | 'completed' | 'failed';
  currentChapterIndex: number;
  currentLessonIndex: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lastRunAt?: Date;
  lastError?: string | null;
  dailyRunLogs: IDailyRunLog[];
  createdAt: Date;
  updatedAt: Date;
}

const dailyRunLogSchema = new Schema<IDailyRunLog>(
  {
    date: { type: String, required: true },
    lessonsCreated: { type: Number, default: 0 },
    status: { type: String, required: true },
    error: { type: String },
    runDurationMs: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const courseGenerationProgressSchema = new Schema<ICourseGenerationProgress>(
  {
    course: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    examKey: { type: String, required: true, unique: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'quota_exhausted', 'completed', 'failed'],
      default: 'in_progress',
    },
    currentChapterIndex: { type: Number, default: 0, min: 0 },
    currentLessonIndex: { type: Number, default: 0, min: 0 },
    completedLessonsCount: { type: Number, default: 0, min: 0 },
    totalLessonsCount: { type: Number, default: 0, min: 0 },
    lastRunAt: { type: Date },
    lastError: { type: String, default: null },
    dailyRunLogs: [dailyRunLogSchema],
  },
  { timestamps: true }
);

export default (mongoose.models.CourseGenerationProgress as mongoose.Model<ICourseGenerationProgress>) ||
  mongoose.model<ICourseGenerationProgress>('CourseGenerationProgress', courseGenerationProgressSchema);

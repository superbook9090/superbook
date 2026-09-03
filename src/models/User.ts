import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
  avatar?: string;
  isVerified: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  provider?: 'credentials' | 'google' | 'phone';
  organizationId?: mongoose.Types.ObjectId | null;
  limits?: {
    courses: number;
    quizzes: number;
    blogs: number;
    aiQuizGenerations?: number;
  };
  aiQuizGenerationsCount?: number;
  canUploadVideos: boolean;
  canCreatePublicCourses?: boolean;
  lastActiveAt?: Date;
  lastPlatform?: 'android' | 'ios' | 'web';
  lastUserAgent?: string;
  canCreateContests?: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['student', 'teacher', 'admin', 'superadmin'], default: 'student' },
    avatar: String,
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: String,
    provider: { type: String, enum: ['credentials', 'google', 'phone'], default: 'credentials' },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    limits: {
      courses: { type: Number, default: undefined },
      quizzes: { type: Number, default: undefined },
      blogs: { type: Number, default: undefined },
      aiQuizGenerations: { type: Number, default: undefined },
    },
    aiQuizGenerationsCount: { type: Number, default: 0 },
    canUploadVideos: { type: Boolean, default: false },
    canCreatePublicCourses: { type: Boolean, default: false },
<<<<<<< Updated upstream
    lastActiveAt: { type: Date },
    lastPlatform: { type: String, enum: ['android', 'ios', 'web'] },
    lastUserAgent: String,
=======
    canCreateContests: { type: Boolean, default: false },
>>>>>>> Stashed changes
  },
  { timestamps: true }
);

// Hash password before saving (only for credentials users)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Validate: Admin must have organizationId
userSchema.pre('save', function (next) {
  if (this.role === 'admin' && !this.organizationId) {
    next(new Error('Admin must belong to an organization'));
  }
  next();
});

// Compare password method (only for credentials users)
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for frequently queried fields
// Note: email already has unique: true in field definition, no duplicate index needed
userSchema.index({ organizationId: 1 });
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isSuspended: 1 });
userSchema.index({ canUploadVideos: 1 });
userSchema.index({ canCreatePublicCourses: 1 });
<<<<<<< Updated upstream
userSchema.index({ lastActiveAt: -1 });
userSchema.index({ lastPlatform: 1 });
userSchema.index({ organizationId: 1, lastActiveAt: -1 });
=======
userSchema.index({ canCreateContests: 1 });
>>>>>>> Stashed changes

const User: mongoose.Model<IUser> =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>('User', userSchema);

export default User;
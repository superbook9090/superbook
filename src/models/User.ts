import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher' | 'admin';
  avatar?: string;
  isVerified: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  provider?: 'credentials' | 'google';
  limits?: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    avatar: String,
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    suspendedReason: String,
    provider: { type: String, enum: ['credentials', 'google'], default: 'credentials' },
    limits: {
      courses: { type: Number, default: undefined },
      quizzes: { type: Number, default: undefined },
      blogs: { type: Number, default: undefined },
    },
  },
  { timestamps: true }
);

// Hash password before saving (only for credentials users)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method (only for credentials users)
userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add indexes for frequently queried fields
// Note: email already has unique: true in field definition, no duplicate index needed
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isVerified: 1 });
userSchema.index({ isSuspended: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
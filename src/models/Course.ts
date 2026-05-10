import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';

// Course pricing enums
export enum SubscriptionType {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime'
}

// Zod schema for validation
export const CourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  instructor: z.string().min(1, 'Instructor is required'),
  organizationId: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  currency: z.string().default('INR'),
  discountPrice: z.number().min(0).optional(),
  isPaid: z.boolean().default(false),
  paymentEnabled: z.boolean().default(true),
  lifetimeAccess: z.boolean().default(true),
  subscriptionType: z.enum([SubscriptionType.ONE_TIME, SubscriptionType.MONTHLY, SubscriptionType.YEARLY, SubscriptionType.LIFETIME]).default(SubscriptionType.ONE_TIME),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  isPublished: z.boolean().default(false),
  enrolledCount: z.number().default(0),
  lessons: z.array(z.string()).default([])
});

export interface ICourse extends Document {
  title: string;
  description?: string;
  instructor: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  price: number;
  currency: string;
  discountPrice?: number;
  isPaid: boolean;
  paymentEnabled: boolean;
  lifetimeAccess: boolean;
  subscriptionType: SubscriptionType;
  thumbnail?: string;
  category?: string;
  isPublished: boolean;
  enrolledCount: number;
  lessons: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  getDiscountedPrice(): number;
  hasDiscount(): boolean;
  isAccessible(): boolean;
}

const courseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    instructor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', default: null },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'INR', uppercase: true },
    discountPrice: { type: Number, min: 0, validate: {
      validator: function(this: ICourse, value: number) {
        return !value || value <= this.price;
      },
      message: 'Discount price cannot be greater than original price'
    }},
    isPaid: { type: Boolean, default: false },
    paymentEnabled: { type: Boolean, default: true },
    lifetimeAccess: { type: Boolean, default: true },
    subscriptionType: { type: String, enum: Object.values(SubscriptionType), default: SubscriptionType.ONE_TIME },
    thumbnail: { type: String },
    category: { type: String },
    isPublished: { type: Boolean, default: false },
    enrolledCount: { type: Number, default: 0, min: 0 },
    lessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret: any) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Add indexes for frequently queried fields
courseSchema.index({ instructor: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPaid: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ subscriptionType: 1 });

// Compound indexes for payment queries
courseSchema.index({ isPublished: 1, isPaid: 1 });
courseSchema.index({ instructor: 1, isPublished: 1 });

// Instance method to get discounted price
courseSchema.methods.getDiscountedPrice = function(): number {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
};

// Instance method to check if course has discount
courseSchema.methods.hasDiscount = function(): boolean {
  return !!(this.discountPrice && this.discountPrice < this.price);
};

// Instance method to check if course is accessible for purchase
courseSchema.methods.isAccessible = function(): boolean {
  return this.isPublished && this.paymentEnabled;
};

// Static method to find published paid courses
courseSchema.statics.findPublishedPaidCourses = function(filter = {}) {
  return this.find({
    ...filter,
    isPublished: true,
    isPaid: true,
    paymentEnabled: true
  }).populate('instructor', 'name avatar');
};

// Static method to find published free courses
courseSchema.statics.findPublishedFreeCourses = function(filter = {}) {
  return this.find({
    ...filter,
    isPublished: true,
    $or: [
      { isPaid: false },
      { price: 0 },
      { paymentEnabled: false }
    ]
  }).populate('instructor', 'name avatar');
};

// Interface for Course model static methods
export interface ICourseModel extends mongoose.Model<ICourse> {
  findPublishedPaidCourses(filter?: any): Promise<ICourse[]>;
  findPublishedFreeCourses(filter?: any): Promise<ICourse[]>;
}

export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema) as ICourseModel;
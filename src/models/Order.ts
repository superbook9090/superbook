import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Order status enum
export enum OrderStatus {
  CREATED = 'created',
  ATTEMPTED = 'attempted',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

// Zod schema for validation
export const OrderSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  status: z.enum([OrderStatus.CREATED, OrderStatus.ATTEMPTED, OrderStatus.PAID, OrderStatus.FAILED, OrderStatus.CANCELLED, OrderStatus.EXPIRED]).default(OrderStatus.CREATED),
  receipt: z.string().optional(),
  notes: z.optional(z.record(z.string(), z.string())),
  razorpayOrderId: z.string().optional(),
  paymentAttempts: z.number().default(0),
  expiresAt: z.date().optional(),
  metadata: z.optional(z.record(z.string(), z.any()))
});

// TypeScript interface
export interface IOrder extends Document {
  orderId: string;
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  receipt?: string;
  notes?: Record<string, string>;
  razorpayOrderId?: string;
  paymentAttempts: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Order model static methods
export interface IOrderModel extends mongoose.Model<IOrder> {
  generateOrderId(): string;
}

// Mongoose schema
const orderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User',
    index: true
  },
  courseId: {
    type: String,
    required: true,
    ref: 'Course',
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR',
    uppercase: true
  },
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.CREATED,
    index: true
  },
  receipt: {
    type: String,
    sparse: true
  },
  notes: {
    type: Map,
    of: String,
    default: {}
  },
  razorpayOrderId: {
    type: String,
    sparse: true,
    index: true
  },
  paymentAttempts: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Orders expire after 30 minutes
      return new Date(Date.now() + 30 * 60 * 1000);
    }
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret: any) {
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for performance
orderSchema.index({ userId: 1, status: 1 });
orderSchema.index({ courseId: 1, status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ expiresAt: 1 });

// Static method to generate order ID
orderSchema.statics.generateOrderId = function(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp}-${random}`;
};

// Instance method to check if order is expired
orderSchema.methods.isExpired = function(): boolean {
  return this.expiresAt ? new Date() > this.expiresAt : false;
};

// Instance method to check if order can be attempted
orderSchema.methods.canAttemptPayment = function(): boolean {
  return this.status === OrderStatus.CREATED && !this.isExpired();
};

// Instance method to increment payment attempts
orderSchema.methods.incrementPaymentAttempts = function(): void {
  this.paymentAttempts += 1;
  this.status = OrderStatus.ATTEMPTED;
};

export const Order = mongoose.models.Order as IOrderModel || mongoose.model<IOrder>('Order', orderSchema) as IOrderModel;
export default Order;

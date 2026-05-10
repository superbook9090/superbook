import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';
import { PaymentStatus, PaymentMethod } from '@/types/payment';

// Zod schema for validation
export const PaymentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  status: z.enum([PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.REFUNDED, PaymentStatus.CANCELLED]).default(PaymentStatus.PENDING),
  paymentMethod: z.enum([PaymentMethod.UPI, PaymentMethod.UPI_QR, PaymentMethod.CARD, PaymentMethod.WALLET, PaymentMethod.NETBANKING, PaymentMethod.CASH_ON_DELIVERY]),
  razorpayOrderId: z.string().optional(),
  razorpayPaymentId: z.string().optional(),
  razorpaySignature: z.string().optional(),
  invoiceNumber: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  failureReason: z.string().optional(),
  refundId: z.string().optional(),
  refundAmount: z.number().positive().optional(),
  refundReason: z.string().optional(),
  webhookProcessed: z.boolean().default(false),
  enrollmentCreated: z.boolean().default(false)
});

// TypeScript interface
export interface IPayment extends Document {
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  invoiceNumber?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  webhookProcessed: boolean;
  enrollmentCreated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Payment model static methods
export interface IPaymentModel extends mongoose.Model<IPayment> {
  generateInvoiceNumber(): string;
}

// Mongoose schema
const paymentSchema = new Schema<IPayment>({
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
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  razorpayOrderId: {
    type: String,
    sparse: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
    index: true
  },
  razorpaySignature: {
    type: String,
    sparse: true
  },
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  failureReason: {
    type: String
  },
  refundId: {
    type: String,
    sparse: true
  },
  refundAmount: {
    type: Number,
    min: 0
  },
  refundReason: {
    type: String
  },
  webhookProcessed: {
    type: Boolean,
    default: false,
    index: true
  },
  enrollmentCreated: {
    type: Boolean,
    default: false,
    index: true
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
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ courseId: 1, status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1, razorpayPaymentId: 1 });

// Static method to generate invoice number
paymentSchema.statics.generateInvoiceNumber = function(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}${day}-${random}`;
};

// Instance method to check if payment is successful
paymentSchema.methods.isSuccessful = function(): boolean {
  return this.status === PaymentStatus.SUCCESS;
};

// Instance method to check if payment can be refunded
paymentSchema.methods.canBeRefunded = function(): boolean {
  return this.status === PaymentStatus.SUCCESS && !this.refundId;
};

export const Payment = mongoose.models.Payment as IPaymentModel || mongoose.model<IPayment>('Payment', paymentSchema) as IPaymentModel;

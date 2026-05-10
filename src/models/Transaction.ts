import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// Transaction type enum
export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  PARTIAL_REFUND = 'partial_refund',
  CHARGEBACK = 'chargeback',
  ADJUSTMENT = 'adjustment'
}

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Zod schema for validation
export const TransactionSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  courseId: z.string().min(1, 'Course ID is required'),
  type: z.enum([TransactionType.PAYMENT, TransactionType.REFUND, TransactionType.PARTIAL_REFUND, TransactionType.CHARGEBACK, TransactionType.ADJUSTMENT]),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('INR'),
  status: z.enum([TransactionStatus.PENDING, TransactionStatus.PROCESSING, TransactionStatus.COMPLETED, TransactionStatus.FAILED, TransactionStatus.CANCELLED]).default(TransactionStatus.PENDING),
  gatewayTransactionId: z.string().optional(),
  gatewayResponse: z.optional(z.record(z.string(), z.any())),
  processingFee: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  netAmount: z.number().positive('Net amount must be positive'),
  refundReason: z.string().optional(),
  chargebackReason: z.string().optional(),
  metadata: z.optional(z.record(z.string(), z.any())),
  webhookProcessed: z.boolean().default(false),
  processedAt: z.date().optional()
});

// TypeScript interface
export interface ITransaction extends Document {
  transactionId: string;
  paymentId: string;
  orderId: string;
  userId: string;
  courseId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  gatewayTransactionId?: string;
  gatewayResponse?: Record<string, any>;
  processingFee: number;
  taxAmount: number;
  netAmount: number;
  refundReason?: string;
  chargebackReason?: string;
  metadata?: Record<string, any>;
  webhookProcessed: boolean;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Transaction model static methods
export interface ITransactionModel extends mongoose.Model<ITransaction> {
  generateTransactionId(): string;
}

// Mongoose schema
const transactionSchema = new Schema<ITransaction>({
  transactionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paymentId: {
    type: String,
    required: true,
    ref: 'Payment',
    index: true
  },
  orderId: {
    type: String,
    required: true,
    ref: 'Order',
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
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true,
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
    enum: Object.values(TransactionStatus),
    default: TransactionStatus.PENDING,
    index: true
  },
  gatewayTransactionId: {
    type: String,
    sparse: true,
    index: true
  },
  gatewayResponse: {
    type: Schema.Types.Mixed,
    default: {}
  },
  processingFee: {
    type: Number,
    default: 0,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  refundReason: {
    type: String
  },
  chargebackReason: {
    type: String
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  webhookProcessed: {
    type: Boolean,
    default: false,
    index: true
  },
  processedAt: {
    type: Date,
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
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ paymentId: 1, type: 1 });
transactionSchema.index({ courseId: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

// Static method to generate transaction ID
transactionSchema.statics.generateTransactionId = function(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `TXN-${timestamp}-${random}`;
};

// Instance method to check if transaction is completed
transactionSchema.methods.isCompleted = function(): boolean {
  return this.status === TransactionStatus.COMPLETED;
};

// Instance method to check if transaction can be refunded
transactionSchema.methods.canBeRefunded = function(): boolean {
  return this.type === TransactionType.PAYMENT && 
         this.status === TransactionStatus.COMPLETED && 
         !this.refundReason;
};

// Pre-save middleware to calculate net amount
transactionSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('processingFee') || this.isModified('taxAmount')) {
    this.netAmount = this.amount - this.processingFee - this.taxAmount;
  }
  next();
});

export const Transaction = mongoose.models.Transaction as ITransactionModel || mongoose.model<ITransaction>('Transaction', transactionSchema) as ITransactionModel;
export default Transaction;

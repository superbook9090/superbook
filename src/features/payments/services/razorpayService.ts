import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Order, Payment, Transaction } from '@/models';
import { PaymentStatus, PaymentMethod } from '@/types/payment';
import { OrderStatus, TransactionType, TransactionStatus } from '@/models';
import { IPayment } from '@/models/Payment';
import { getCachedData, setCachedData } from '@/lib/redis';

// Razorpay instance with error handling
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1234567890',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
});

export interface CreateOrderRequest {
  userId: string;
  courseId: string;
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  receipt?: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface WebhookEvent {
  event: string;
  payload: any;
}

/**
 * Razorpay Service - Handles all Razorpay integration
 * 
 * Architecture:
 * - Order creation and management
 * - Payment verification
 * - Webhook processing
 * - Security validation
 * - Error handling
 */
class RazorpayService {
  /**
   * Create a Razorpay order
   * 
   * Security considerations:
   * - Amount validation
   * - User authentication (handled by API route)
   * - Duplicate order prevention
   * - Proper receipt generation
   */
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { userId, courseId, amount, currency = 'INR', receipt, notes } = request;

    // Validate amount
    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Check for existing active orders
    const existingOrder = await Order.findOne({
      userId,
      courseId,
      status: { $in: [OrderStatus.CREATED, OrderStatus.ATTEMPTED] },
      expiresAt: { $gt: new Date() }
    });

    if (existingOrder) {
      // Return existing order instead of creating a new one
      return {
        orderId: existingOrder.orderId,
        razorpayOrderId: existingOrder.razorpayOrderId!,
        amount: existingOrder.amount,
        currency: existingOrder.currency,
        receipt: existingOrder.receipt as string | undefined,
      };
    }

    // Generate order ID
    const orderId = Order.generateOrderId();

    // Create Razorpay order
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: receipt || orderId,
        notes: {
          userId,
          courseId,
          ...notes
        },
        payment_capture: true,
      });
    } catch (error) {
      console.error('Razorpay order creation failed:', error);
      throw new Error('Failed to create payment order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    // Save order to database
    const order = new Order({
      orderId,
      userId,
      courseId,
      amount,
      currency,
      status: OrderStatus.CREATED,
      receipt: razorpayOrder.receipt,
      notes: razorpayOrder.notes,
      razorpayOrderId: razorpayOrder.id,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    await order.save();

    // Cache order for quick lookup
    const cacheKey = `order:${razorpayOrder.id}`;
    await setCachedData(cacheKey, order, 1800); // 30 minutes

    return {
      orderId: order.orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
    };
  }

  /**
   * Verify Razorpay payment signature
   * 
   * Security considerations:
   * - Signature validation using webhook secret
   * - Order existence verification
   * - Amount matching
   * - Duplicate payment prevention
   */
  async verifyPayment(request: VerifyPaymentRequest): Promise<IPayment> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = request;

    // Get order from cache or database
    const cacheKey = `order:${razorpayOrderId}`;
    let order: any = await getCachedData(cacheKey);
    
    if (!order) {
      order = await Order.findOne({ razorpayOrderId }).lean();
      if (!order) {
        throw new Error('Order not found');
      }
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      throw new Error('Invalid payment signature');
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ razorpayPaymentId });
    if (existingPayment) {
      throw new Error('Payment already processed');
    }

    // Fetch payment details from Razorpay
    try {
      const razorpayPayment: any = await razorpay.payments.fetch(razorpayPaymentId);
      
      if (razorpayPayment.order_id !== razorpayOrderId) {
        throw new Error('Payment order mismatch');
      }

      if (razorpayPayment.amount !== order.amount * 100) {
        throw new Error('Payment amount mismatch');
      }

      // Create payment record
      const payment = new Payment({
        userId: order.userId,
        courseId: order.courseId,
        amount: order.amount,
        currency: order.currency,
        status: razorpayPayment.status === 'captured' ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
        paymentMethod: this.mapRazorpayMethod(razorpayPayment.method),
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: razorpayPaymentId,
        razorpaySignature,
        invoiceNumber: Payment.generateInvoiceNumber(),
        metadata: {
          razorpayPaymentId: razorpayPayment.id,
          razorpayOrderId: razorpayPayment.order_id,
          method: razorpayPayment.method,
          email: razorpayPayment.email,
          contact: razorpayPayment.contact,
          created_at: razorpayPayment.created_at,
        }
      });

      await payment.save();

      // Update order status
      order.status = razorpayPayment.status === 'captured' ? OrderStatus.PAID : OrderStatus.FAILED;
      await order.save();

      // Create transaction record
      const transaction = new Transaction({
        transactionId: Transaction.generateTransactionId(),
        paymentId: (payment as any)._id?.toString() || '',
        orderId: order._id.toString(),
        userId: order.userId,
        courseId: order.courseId,
        type: TransactionType.PAYMENT,
        amount: payment.amount,
        currency: payment.currency,
        status: razorpayPayment.status === 'captured' ? TransactionStatus.COMPLETED : TransactionStatus.FAILED,
        gatewayTransactionId: razorpayPaymentId,
        gatewayResponse: razorpayPayment,
        netAmount: payment.amount,
        processedAt: new Date(),
      });

      await transaction.save();

      // Invalidate cache
      await setCachedData(cacheKey, null, 0);

      return payment;
    } catch (error) {
      // Update payment status to failed
      const payment = new Payment({
        userId: order.userId,
        courseId: order.courseId,
        amount: order.amount,
        currency: order.currency,
        status: PaymentStatus.FAILED,
        paymentMethod: PaymentMethod.CARD, // Default method
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        failureReason: error instanceof Error ? error.message : 'Payment verification failed',
      });

      await payment.save();
      throw error;
    }
  }

  /**
   * Process Razorpay webhook
   * 
   * Security considerations:
   * - Webhook signature verification
   * - Idempotency handling
   * - Retry-safe processing
   */
  async processWebhook(event: WebhookEvent): Promise<void> {
    const { event: eventType, payload } = event;

    switch (eventType) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      case 'order.paid':
        await this.handleOrderPaid(payload);
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  /**
   * Get payment history for a user
   */
  async getPaymentHistory(userId: string, page = 1, limit = 10): Promise<{
    payments: IPayment[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      Payment.find({ userId })
        .populate('courseId', 'title thumbnail')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments({ userId })
    ]);

    return {
      payments: payments as unknown as IPayment[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(paymentId: string): Promise<IPayment | null> {
    return Payment.findById(paymentId)
      .populate('courseId', 'title thumbnail description')
      .populate('userId', 'name email')
      .lean() as unknown as IPayment | null;
  }

  /**
   * Get order details by razorpay order ID
   */
  async getOrderDetails(razorpayOrderId: string): Promise<any> {
    const order = await Order.findOne({ razorpayOrderId }).lean();
    if (!order) {
      throw new Error('Order not found');
    }
    return order;
  }

  /**
   * Map Razorpay payment method to our enum
   */
  private mapRazorpayMethod(method: string): PaymentMethod {
    switch (method) {
      case 'upi':
        return PaymentMethod.UPI;
      case 'upi_qr':
        return PaymentMethod.UPI_QR;
      case 'card':
        return PaymentMethod.CARD;
      case 'wallet':
        return PaymentMethod.WALLET;
      case 'netbanking':
        return PaymentMethod.NETBANKING;
      default:
        return PaymentMethod.CARD;
    }
  }

  /**
   * Handle payment captured webhook
   */
  private async handlePaymentCaptured(payload: any): Promise<void> {
    const { payment } = payload;

    // Find payment record
    const paymentRecord = await Payment.findOne({ razorpayPaymentId: payment.id });
    if (!paymentRecord) {
      console.log('Payment record not found for webhook:', payment.id);
      return;
    }

    // Avoid duplicate processing
    if ((paymentRecord as any).webhookProcessed) {
      console.log('Webhook already processed for payment:', payment.id);
      return;
    }

    // Update payment status
    (paymentRecord as any).status = PaymentStatus.SUCCESS;
    (paymentRecord as any).webhookProcessed = true;
    await paymentRecord.save();

    // Create enrollment will be handled by separate service
    console.log('Payment captured webhook processed:', payment.id);
  }

  /**
   * Handle payment failed webhook
   */
  private async handlePaymentFailed(payload: any): Promise<void> {
    const { payment } = payload;

    const paymentRecord = await Payment.findOne({ razorpayPaymentId: payment.id });
    if (!paymentRecord) {
      console.log('Payment record not found for webhook:', payment.id);
      return;
    }

    if ((paymentRecord as any).webhookProcessed) {
      console.log('Webhook already processed for payment:', payment.id);
      return;
    }

    (paymentRecord as any).status = PaymentStatus.FAILED;
    (paymentRecord as any).webhookProcessed = true;
    (paymentRecord as any).failureReason = 'Payment failed via webhook';
    await paymentRecord.save();

    console.log('Payment failed webhook processed:', payment.id);
  }

  /**
   * Handle order paid webhook
   */
  private async handleOrderPaid(payload: any): Promise<void> {
    const { order } = payload;

    const orderRecord = await Order.findOne({ razorpayOrderId: order.id });
    if (!orderRecord) {
      console.log('Order record not found for webhook:', order.id);
      return;
    }

    (orderRecord as any).status = OrderStatus.PAID;
    await orderRecord.save();

    console.log('Order paid webhook processed:', order.id);
  }
}

export const razorpayService = new RazorpayService();

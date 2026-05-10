import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { razorpayService } from '@/features/payments/services/razorpayService';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const maxDuration = 30; // 30 seconds max duration for webhook processing

// Webhook event types that we handle
const SUPPORTED_EVENTS = [
  'payment.captured',
  'payment.failed',
  'order.paid',
  'payment.authorized',
  'payment.disputed',
] as const;

export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/payments/webhook' };

  try {
    // Get the raw body for signature verification
    const body = await request.text();
    
    // Get the Razorpay signature from headers
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      console.error('Webhook signature missing');
      return NextResponse.json(
        { error: 'Webhook signature missing' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValidSignature = razorpayService.verifyWebhookSignature(body, signature);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    // Parse the webhook payload
    let webhookData;
    try {
      webhookData = JSON.parse(body);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    // Validate webhook structure
    if (!webhookData.event || !webhookData.payload) {
      console.error('Invalid webhook structure');
      return NextResponse.json(
        { error: 'Invalid webhook structure' },
        { status: 400 }
      );
    }

    const eventType = webhookData.event;
    const payload = webhookData.payload;

    // Check if we support this event type
    if (!SUPPORTED_EVENTS.includes(eventType as any)) {
      console.log(`Unsupported webhook event: ${eventType}`);
      return NextResponse.json(
        { message: 'Event not supported' },
        { status: 200 }
      );
    }

    // Process the webhook event
    await razorpayService.processWebhook({
      event: eventType,
      payload
    });

    // Return success response
    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );

  } catch (error) {
    logApiError(error instanceof Error ? error : new Error(String(error)), logContext.method || '', logContext.path || '', { ...logContext });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      );
    }

    console.error('Webhook processing error:', error);
    
    // Always return 200 to prevent webhook retries for failed processing
    // Razorpay will retry on 5xx errors
    return NextResponse.json(
      { message: 'Webhook processed with errors' },
      { status: 200 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

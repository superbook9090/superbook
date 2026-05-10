# Razorpay Payment Gateway Setup Guide

This guide will help you set up Razorpay payment integration in your LMS platform.

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install razorpay
# or
yarn add razorpay
```

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Public key for frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

### 3. Razorpay Account Setup

1. **Create Razorpay Account**
   - Visit [Razorpay Dashboard](https://dashboard.razorpay.com/)
   - Sign up for a business account
   - Complete KYC verification

2. **Get API Keys**
   - Go to Settings → API Keys
   - Generate Test Keys (for development)
   - Generate Live Keys (for production)
   - Copy Key ID and Key Secret

3. **Configure Webhooks**
   - Go to Settings → Webhooks
   - Add webhook URL: `https://yourdomain.com/api/payments/webhook`
   - Select events:
     - `payment.captured`
     - `payment.failed`
     - `order.paid`
   - Copy webhook secret

## 🔧 Configuration Details

### API Keys
- **Key ID**: Public identifier used in frontend
- **Key Secret**: Private key for server-side operations
- **Webhook Secret**: Secret for webhook signature verification

### Environment Variables Explained

| Variable | Purpose | Required |
|----------|---------|----------|
| `RAZORPAY_KEY_ID` | Server-side API access | ✅ |
| `RAZORPAY_KEY_SECRET` | Server-side signature verification | ✅ |
| `RAZORPAY_WEBHOOK_SECRET` | Webhook security | ✅ |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Frontend checkout | ✅ |

## 🌐 Webhook Setup

### 1. Configure Webhook URL
```
https://yourdomain.com/api/payments/webhook
```

### 2. Required Events
- `payment.captured` - Payment successful
- `payment.failed` - Payment failed
- `order.paid` - Order completed

### 3. Webhook Security
- Webhook signature verification implemented
- Idempotency handling for retry safety
- Proper error handling and logging

## 💳 Payment Methods Supported

### ✅ Available Methods
- **UPI**: Direct UPI payments
- **UPI QR**: Scan and pay QR codes
- **Cards**: Credit/Debit cards
- **Wallets**: PayTM, PhonePe, Amazon Pay, etc.
- **Net Banking**: All major banks

### 🎯 Method Configuration
```typescript
// Payment methods are configured in PaymentModal.tsx
const paymentMethods = [
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'upi', name: 'UPI' },
  { id: 'upi_qr', name: 'UPI QR Code' },
  { id: 'wallet', name: 'Mobile Wallet' },
  { id: 'netbanking', name: 'Net Banking' },
];
```

## 🔒 Security Features

### ✅ Implemented Security
- **Signature Verification**: HMAC SHA256 validation
- **Idempotency**: Prevent duplicate payments
- **Server-side Verification**: Never trust frontend success
- **Webhook Security**: Signature-based authentication
- **Amount Validation**: Server-side amount verification
- **Order Expiration**: 30-minute order validity

### 🛡️ Security Best Practices
1. Never expose secret keys in frontend
2. Always verify payments server-side
3. Use HTTPS for all endpoints
4. Implement proper error handling
5. Log all payment transactions

## 📊 Database Schema

### Payment Model
```typescript
interface Payment {
  userId: string;
  courseId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  invoiceNumber: string;
  // ... other fields
}
```

### Order Model
```typescript
interface Order {
  orderId: string;
  userId: string;
  courseId: string;
  amount: number;
  status: OrderStatus;
  razorpayOrderId: string;
  expiresAt: Date;
  // ... other fields
}
```

## 🔄 Payment Flow

### 1. Order Creation
```
Client → API → Razorpay → Database
```

### 2. Payment Processing
```
Client → Razorpay → Webhook → API → Database
```

### 3. Verification
```
Client → API → Database → Enrollment
```

## 🧪 Testing

### Test Mode
1. Use test keys for development
2. Test card: `4111 1111 1111 1111`
3. Test UPI: Use test UPI apps
4. Test failures: Use invalid details

### Test Cards
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- **International**: `4000 0000 0000 0052`

## 🚀 Deployment

### Production Checklist
- [ ] Switch to live API keys
- [ ] Update webhook URL to production domain
- [ ] Test live payment flow
- [ ] Monitor webhook delivery
- [ ] Set up payment monitoring
- [ ] Configure error alerts

### Environment Setup
```bash
# Production
RAZORPAY_KEY_ID=rzp_live_*
RAZORPAY_KEY_SECRET=*
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_*

# Development
RAZORPAY_KEY_ID=rzp_test_*
RAZORPAY_KEY_SECRET=*
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_*
```

## 📱 Mobile Responsiveness

### Responsive Features
- **Mobile Modal**: Optimized for small screens
- **Touch Targets**: Minimum 44px touch areas
- **QR Codes**: Responsive sizing
- **Payment Methods**: Mobile-friendly layout

### Mobile Testing
- Test on Android devices
- Test on iOS devices
- Test on tablets
- Test on different screen sizes

## 🌍 Multi-language Support

### Translation Keys
```typescript
// Payment translations
t('payments.checkout.title')
t('payments.methods.card')
t('payments.methods.upi')
t('payments.securePayment')
t('payments.payNow')
```

### Supported Languages
- English (en)
- Hindi (hi)

## 🔍 Monitoring & Analytics

### Key Metrics
- Payment success rate
- Payment method distribution
- Average transaction value
- Payment failure reasons
- Webhook delivery rate

### Monitoring Setup
```typescript
// Payment logging
console.log('Payment initiated:', { orderId, amount, method });
console.log('Payment completed:', { paymentId, status });
console.log('Payment failed:', { orderId, error });
```

## 🆘 Troubleshooting

### Common Issues
1. **SDK Loading Failed**: Check network connectivity
2. **Invalid Signature**: Verify webhook secret
3. **Payment Failed**: Check card details
4. **Webhook Not Received**: Check webhook URL

### Debug Mode
```typescript
// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) {
  console.log('Payment debug:', paymentData);
}
```

## 📞 Support

### Razorpay Support
- [Documentation](https://razorpay.com/docs/)
- [Support Portal](https://razorpay.com/support/)
- [API Reference](https://razorpay.com/docs/api/)

### Common Issues FAQ
- **Q: Payment not reflecting?**
  A: Check webhook processing logs
  
- **Q: Test payments not working?**
  A: Verify test API keys
  
- **Q: Webhook not receiving events?**
  A: Check webhook URL and secret

## 🔄 Updates & Maintenance

### Regular Tasks
- Monitor API key rotation
- Update webhook endpoints
- Review payment analytics
- Update payment methods
- Test new Razorpay features

### Version Updates
```bash
# Check for updates
npm outdated razorpay

# Update to latest
npm update razorpay
```

---

## 🎉 Ready to Go!

Once you've completed these steps, your Razorpay integration will be ready for production use. The system includes:

- ✅ Secure payment processing
- ✅ Multiple payment methods
- ✅ Mobile-responsive UI
- ✅ Webhook handling
- ✅ Error handling
- ✅ Payment verification
- ✅ Transaction logging
- ✅ Multi-language support

For any issues, refer to the troubleshooting section or contact support.

// Payment status enum
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

// Payment method enum
export enum PaymentMethod {
  UPI = 'upi',
  UPI_QR = 'upi_qr',
  CARD = 'card',
  WALLET = 'wallet',
  NETBANKING = 'netbanking',
  CASH_ON_DELIVERY = 'cod'
}

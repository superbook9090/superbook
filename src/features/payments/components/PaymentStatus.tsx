'use client';

import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { PaymentStatus } from '@/models';

interface PaymentStatusDisplayProps {
  status: PaymentStatus;
  amount: number;
  currency: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  className?: string;
}

const statusConfig = {
  [PaymentStatus.SUCCESS]: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    title: 'paymentStatus.success',
    description: 'paymentStatus.successDesc',
  },
  [PaymentStatus.FAILED]: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    title: 'paymentStatus.failed',
    description: 'paymentStatus.failedDesc',
  },
  [PaymentStatus.PENDING]: {
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    title: 'paymentStatus.pending',
    description: 'paymentStatus.pendingDesc',
  },
  [PaymentStatus.PROCESSING]: {
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    title: 'paymentStatus.processing',
    description: 'paymentStatus.processingDesc',
  },
  [PaymentStatus.REFUNDED]: {
    icon: AlertCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    title: 'paymentStatus.refunded',
    description: 'paymentStatus.refundedDesc',
  },
  [PaymentStatus.CANCELLED]: {
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    title: 'paymentStatus.cancelled',
    description: 'paymentStatus.cancelledDesc',
  },
};

export default function PaymentStatusDisplay({
  status,
  amount,
  currency,
  invoiceNumber,
  paymentMethod,
  className = ''
}: PaymentStatusDisplayProps) {
  const config = statusConfig[status as keyof typeof statusConfig];
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.color} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`font-medium ${config.color}`}>
              {/* Translation would be handled by useTranslation hook */}
              {config.title.replace('paymentStatus.', 'Payment ')}
            </h4>
            <div className="text-right">
              <div className="font-semibold text-gray-900">
                {currency === 'INR' ? '₹' : currency}{amount.toLocaleString()}
              </div>
              {invoiceNumber && (
                <div className="text-xs text-gray-500">
                  {invoiceNumber}
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {config.description.replace('paymentStatus.', '')}
          </p>
          {paymentMethod && (
            <div className="text-xs text-gray-500 mt-2">
              Method: {paymentMethod}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

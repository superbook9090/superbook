'use client';

import { useState } from 'react';
import { ShoppingCart, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import Button from '@/components/ui/Button';
import PaymentModal from './PaymentModal';

interface CheckoutButtonProps {
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string;
  };
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export default function CheckoutButton({ 
  course, 
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = false
}: CheckoutButtonProps) {
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentStatus('success');
    setPaymentStatus('idle');
    // You could trigger a page refresh or navigation here
    window.location.reload();
  };

  const handlePaymentError = (error: string) => {
    setPaymentStatus('error');
    setErrorMessage(error);
    setTimeout(() => {
      setPaymentStatus('idle');
      setErrorMessage('');
    }, 5000);
  };

  const openPaymentModal = () => {
    setIsModalOpen(true);
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  const closePaymentModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={openPaymentModal}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        className={className}
        disabled={paymentStatus === 'processing'}
      >
        <span className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          {paymentStatus === 'processing' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('payments.processing')}
            </>
          ) : (
            <>
              {t('payments.buyNow')} ₹{course.price.toLocaleString('en-IN')}
            </>
          )}
        </span>
      </Button>

      {/* Error Display */}
      {paymentStatus === 'error' && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isModalOpen}
        onClose={closePaymentModal}
        course={course}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </>
  );
}

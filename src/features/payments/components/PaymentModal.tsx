'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, QrCode, Wallet, Building2, Shield, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import Button from '@/components/ui/Button';
import { PaymentMethod } from '@/types/payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    description: string;
    price: number;
    thumbnail?: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  popular?: boolean;
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  course, 
  onPaymentSuccess, 
  onPaymentError 
}: PaymentModalProps) {
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const razorpayRef = useRef<any>(null);

  // Payment methods available
  const paymentMethods: PaymentMethodOption[] = [
    {
      id: PaymentMethod.CARD,
      name: t('payments.methods.card'),
      icon: <CreditCard className="w-5 h-5" />,
      description: t('payments.methods.cardDesc'),
    },
    {
      id: PaymentMethod.UPI,
      name: t('payments.methods.upi'),
      icon: <Smartphone className="w-5 h-5" />,
      description: t('payments.methods.upiDesc'),
      popular: true,
    },
    {
      id: PaymentMethod.UPI_QR,
      name: t('payments.methods.upiQr'),
      icon: <QrCode className="w-5 h-5" />,
      description: t('payments.methods.upiQrDesc'),
    },
    {
      id: PaymentMethod.WALLET,
      name: t('payments.methods.wallet'),
      icon: <Wallet className="w-5 h-5" />,
      description: t('payments.methods.walletDesc'),
    },
    {
      id: PaymentMethod.NETBANKING,
      name: t('payments.methods.netbanking'),
      icon: <Building2 className="w-5 h-5" />,
      description: t('payments.methods.netbankingDesc'),
    },
  ];

  // Load Razorpay SDK dynamically
  useEffect(() => {
    if (!isOpen || razorpayLoaded) return;

    const loadRazorpay = () => {
      // Check if script already exists
      if (document.querySelector('script[src*="razorpay"]')) {
        setRazorpayLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        onPaymentError(t('payments.errors.sdkLoadFailed'));
      };
      document.head.appendChild(script);
    };

    loadRazorpay();

    return () => {
      // Cleanup script if modal closes before loading completes
      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript && !razorpayLoaded) {
        existingScript.remove();
      }
    };
  }, [isOpen, razorpayLoaded, onPaymentError, t]);

  // Initialize payment
  const initializePayment = useCallback(async () => {
    if (!razorpayLoaded) {
      onPaymentError(t('payments.errors.sdkNotLoaded'));
      return;
    }

    setIsProcessing(true);

    try {
      // Create order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: course.id,
          amount: course.price,
          currency: 'INR',
          notes: {
            courseTitle: course.title,
            paymentMethod: selectedMethod,
          }
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }

      const order = data.order;

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount * 100, // Convert to paise
        currency: order.currency,
        name: 'quiz-do',
        description: course.title,
        order_id: order.razorpayOrderId,
        prefill: {
          email: '', // Will be filled from session if available
          contact: '', // Will be filled from session if available
        },
        notes: {
          courseId: course.id,
          paymentMethod: selectedMethod,
        },
        theme: {
          color: theme.primary.replace('#', ''),
        },
        modal: {
          backdropclose: false,
          escape: false,
          handleback: false,
          confirm_close: true,
          persist: true,
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              onPaymentSuccess(verifyData.payment);
              onClose();
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            onPaymentError(t('payments.errors.verificationFailed'));
          } finally {
            setIsProcessing(false);
          }
        },
      };

      // Special handling for UPI QR
      if (selectedMethod === PaymentMethod.UPI_QR) {
        setShowQR(true);
        // In a real implementation, you would generate and display QR code
        // For now, we'll proceed with normal checkout
      }

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpayRef.current = razorpay;
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization error:', error);
      onPaymentError(error instanceof Error ? error.message : t('payments.errors.initFailed'));
    } finally {
      setIsProcessing(false);
    }
  }, [razorpayLoaded, course, selectedMethod, theme, onPaymentSuccess, onPaymentError, onClose, t]);

  // Handle modal close
  const handleClose = useCallback(() => {
    if (razorpayRef.current) {
      razorpayRef.current.close();
    }
    onClose();
  }, [onClose]);

  // Handle method selection
  const handleMethodSelect = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    setShowQR(false);
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('payments.checkout.title')}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {t('payments.checkout.subtitle')}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessing}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Course Info */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start gap-4">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {course.description}
                </p>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ₹{course.price.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {t('payments.selectMethod')}
            </h3>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === method.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        selectedMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {method.icon}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {method.name}
                          </span>
                          {method.popular && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {t('payments.popular')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedMethod === method.id ? 'border-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedMethod === method.id && (
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* QR Code Display (for UPI QR) */}
          <AnimatePresence>
            {showQR && selectedMethod === PaymentMethod.UPI_QR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-6 pb-6"
              >
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-sm text-gray-600 mb-4">
                    {t('payments.qr.scanInstructions')}
                  </p>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    {/* QR code would be generated here */}
                    <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Security Badge */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>{t('payments.securePayment')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-t border-gray-200">
            <Button
              onClick={initializePayment}
              disabled={!razorpayLoaded || isProcessing}
              fullWidth
              size="lg"
              className="text-base"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('payments.processing')}
                </span>
              ) : (
                <>
                  {t('payments.payNow')} ₹{course.price.toLocaleString('en-IN')}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

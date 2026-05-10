'use client';

import { Check, X, Percent, Clock, Shield } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { type Course } from '@/lib/react-query/hooks';

interface PaymentSummaryProps {
  course: Course;
  className?: string;
}

export function PaymentSummary({ course, className = '' }: PaymentSummaryProps) {
  const { t } = useLanguage();

  const savings = course.hasDiscount ? course.price - course.finalPrice : 0;
  const savingsPercentage = course.hasDiscount 
    ? Math.round((savings / course.price) * 100) 
    : 0;

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('payments.orderSummary')}
        </h3>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Shield className="w-4 h-4" />
          <span>{t('payments.secureCheckout')}</span>
        </div>
      </div>

      {/* Course Info */}
      <div className="flex items-start gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {course.thumbnail && (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 line-clamp-2">
            {course.title}
          </h4>
          {course.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {course.description}
            </p>
          )}
        </div>
      </div>

      {/* Pricing Details */}
      <div className="space-y-3 mb-6">
        {/* Original Price */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{t('payments.originalPrice')}</span>
          <div className="text-right">
            <span className={`text-lg ${course.hasDiscount ? 'text-gray-400 line-through' : 'text-gray-900 font-semibold'}`}>
              {course.currency} {course.price.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Discount */}
        {course.hasDiscount && (
          <div className="flex items-center justify-between">
            <span className="text-green-600 flex items-center gap-1">
              <Percent className="w-4 h-4" />
              {t('payments.discount')} ({savingsPercentage}%)
            </span>
            <span className="text-green-600 font-semibold">
              -{course.currency} {savings.toLocaleString()}
            </span>
          </div>
        )}

        {/* Final Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-lg font-semibold text-gray-900">
            {t('payments.total')}
          </span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">
              {course.currency} {course.finalPrice.toLocaleString()}
            </span>
            <div className="text-sm text-gray-500">
              {t('payments.inclusiveAllTaxes')}
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">
            {course.lifetimeAccess ? t('payments.lifetimeAccess') : t('payments.accessPeriod')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">
            {t('payments.certificateOnCompletion')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">
            {t('payments.mobileAccess')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
            <Clock className="w-3 h-3 text-green-600" />
          </div>
          <span className="text-sm text-gray-700">
            {t('payments.instantAccess')}
          </span>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="border-t border-gray-200 pt-4">
        <div className="text-sm text-gray-600 mb-3">
          {t('payments.acceptedMethods')}
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { name: 'UPI', icon: '📱' },
            { name: 'Cards', icon: '💳' },
            { name: 'Wallets', icon: '👛' },
            { name: 'Net Banking', icon: '🏦' }
          ].map((method, index) => (
            <div
              key={index}
              className="px-3 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 flex items-center gap-1"
            >
              <span>{method.icon}</span>
              {method.name}
            </div>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center gap-1">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-600">{t('payments.securePayment')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-xs text-gray-600">{t('payments.moneyBackGuarantee')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentSummary;

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { motion } from 'framer-motion';
import PaymentSummary from '@/features/payments/components/PaymentSummary';
import PaymentModal from '@/features/payments/components/PaymentModal';
import { useTranslation } from '@/hooks/useTranslation';
import { type Course } from '@/lib/react-query/hooks';
import Loader from '@/components/ui/Loader';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { session, status } = useSessionStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const courseId = searchParams.get('courseId');
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';

  useEffect(() => {
    const fetchCourse = async () => {
      if (status === 'loading' || !courseId) {
        setIsLoading(false);
        return;
      }

      if (!session) {
        router.push('/auth/signin');
        return;
      }

      try {
        // Fetch specific course by ID
        const res = await fetch(`/api/courses/${courseId}?orgId=${orgId}`, {
          cache: 'no-store',
        });
        
        if (!res.ok) {
          setError('Course not found');
          setIsLoading(false);
          return;
        }
        
        const foundCourse = await res.json();
        
        if (!foundCourse) {
          setError('Course not found');
          setIsLoading(false);
          return;
        }

    // Transform course data to match PaymentSummary expectations
        const selectedCourse: Course = {
          ...foundCourse,
          id: foundCourse._id, // Map _id to id
          currency: foundCourse.currency || 'INR', // Provide default value
          finalPrice: foundCourse.discountPrice && foundCourse.discountPrice < foundCourse.price 
            ? foundCourse.discountPrice 
            : foundCourse.price,
          hasDiscount: !!(foundCourse.discountPrice && foundCourse.discountPrice < foundCourse.price),
          subscriptionType: foundCourse.subscriptionType || 'one_time',
          lifetimeAccess: foundCourse.lifetimeAccess !== undefined ? foundCourse.lifetimeAccess : true,
        };

        setCourse(selectedCourse);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load course');
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, session, status, orgId, router]);

  const handlePaymentSuccess = (paymentData: any) => {
    // Redirect to course learning page after successful payment
    router.push(`/dashboard/student/courses/${courseId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Redirect back to course page if payment is cancelled
    if (course) {
      router.push(`/dashboard/student/browse`);
    }
  };

  
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">
            {t('common.error')}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard/student/browse')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            {t('course.notFound')}
          </h2>
          <button
            onClick={() => router.push('/dashboard/student/browse')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard/student/browse')}
            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-2"
          >
            ← {t('common.back')}
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <PaymentSummary course={course} />
          </div>

          {/* Course Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t('payments.checkout.title')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('payments.checkout.subtitle')}
              </p>

              {/* Course Details */}
              <div className="flex items-start gap-4 mb-6">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h2>
                  <p className="text-gray-600 line-clamp-3">
                    {course.description}
                  </p>
                </div>
              </div>

              {/* Price Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{t('payments.originalPrice')}</span>
                  <span className="text-lg font-semibold">
                    {course.currency || 'INR'} {course.price}
                  </span>
                </div>
                {course.discountPrice && course.discountPrice < course.price && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-600">{t('payments.discount')}</span>
                    <span className="text-green-600 font-semibold">
                      -{course.currency || 'INR'} {course.price - (course.discountPrice || 0)}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      {t('payments.total')}
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {course.currency || 'INR'} {course.discountPrice && course.discountPrice < course.price ? (course.discountPrice || 0) : course.price}
                    </span>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l8-8a1 1 0 011.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{t('payments.lifetimeAccess')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l8-8a1 1 0 011.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{t('payments.certificateOnCompletion')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l8-8a1 1 0 011.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700">{t('payments.mobileAccess')}</span>
                </div>
              </div>

              {/* Start Payment Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                {t('payments.payNow')} {course.currency || 'INR'} {course.discountPrice && course.discountPrice < course.price ? course.discountPrice : course.price}
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {course && (
        <PaymentModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          course={course}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      )}
    </div>
  );
}

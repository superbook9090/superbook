'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, ShoppingCart, Lock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';

interface Course {
  id: string;
  title: string;
  thumbnail?: string;
  price: number;
  discountPrice?: number;
  finalPrice: number;
  hasDiscount: boolean;
  currency: string;
  isAccessible: boolean;
  isFree: boolean;
  subscriptionType: string;
  lifetimeAccess: boolean;
}

interface UserStatus {
  isEnrolled: boolean;
  enrollment?: {
    id: string;
    status: string;
    progress: number;
  };
}

interface PurchaseCourseButtonProps {
  course: Course;
  userStatus: UserStatus;
  className?: string;
  variant?: 'primary' | 'outline' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function PurchaseCourseButton({
  course,
  userStatus,
  className = '',
  variant = 'primary',
  size = 'md'
}: PurchaseCourseButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Simple toast implementation
  const toast = ({ title, description, variant = 'default' }: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    // For now, use alert - replace with proper toast later
    if (variant === 'destructive') {
      console.error(`${title}: ${description}`);
    } else {
      console.log(`${title}: ${description}`);
    }
  };

  const handlePurchase = async () => {
    if (!session?.user) {
      toast({
        title: t('auth.signInRequired'),
        description: t('auth.signInToPurchase'),
        variant: 'destructive'
      });
      router.push('/auth/signin');
      return;
    }

    if (userStatus.isEnrolled) {
      router.push(`/courses/${course.id}/learn`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/courses/${course.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency: course.currency
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process purchase');
      }

      if (data.isFree) {
        // Free course - enrollment created
        toast({
          title: t('payments.enrollmentSuccess'),
          description: t('payments.enrolledSuccessfully'),
        });
        router.push(`/courses/${course.id}/learn`);
      } else {
        // Paid course - open payment modal
        router.push(`/checkout?courseId=${course.id}`);
      }

    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: t('payments.purchaseFailed'),
        description: error instanceof Error ? error.message : t('payments.tryAgain'),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If user is already enrolled, show "Continue Learning" button
  if (userStatus.isEnrolled) {
    return (
      <Button
        onClick={() => router.push(`/courses/${course.id}/learn`)}
        className={className}
        variant={variant}
        size={size}
      >
        {t('course.continueLearning')}
      </Button>
    );
  }

  // If course is not accessible
  if (!course.isAccessible) {
    return (
      <Button
        disabled
        className={className}
        variant="outline"
        size={size}
      >
        <Lock className="w-4 h-4 mr-2" />
        {t('course.notAvailable')}
      </Button>
    );
  }

  // If course is free
  if (course.isFree) {
    return (
      <Button
        onClick={handlePurchase}
        disabled={isLoading}
        className={className}
        variant={variant}
        size={size}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('common.enrolling')}
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            {t('course.enrollFree')}
          </>
        )}
      </Button>
    );
  }

  // Paid course
  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading}
      className={className}
      variant={variant}
      size={size}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t('payments.processing')}
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4 mr-2" />
          {t('payments.buyNow')} - {course.currency} {course.finalPrice}
        </>
      )}
    </Button>
  );
}

export default PurchaseCourseButton;

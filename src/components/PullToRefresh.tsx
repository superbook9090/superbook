"use client";

import React, { useEffect, useState, useRef } from "react";
import { Loader2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useTranslation } from "@/hooks/useTranslation";
import { usePathname } from "next/navigation";

interface PullToRefreshProps {
  children: React.ReactNode;
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const { t } = useTranslation();
  const pathname = usePathname();

  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const isRefreshDisabled = pathname ? ['/create', '/edit', '/take'].some(route => pathname.includes(route)) : false;
    
    if (isRefreshDisabled) {
      if (isPulling) setIsPulling(false);
      if (isRefreshing) setIsRefreshing(false);
      if (showConfirm) setShowConfirm(false);
      return;
    }

    if (showConfirm) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if we are exactly at the top of the page
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      } else {
        startY.current = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY.current === 0) return; // Not at top when touch started

      currentY.current = e.touches[0].clientY;
      const pullDistance = currentY.current - startY.current;

      // Only pull down
      if (pullDistance > 0 && window.scrollY <= 0) {
        setIsPulling(true);
        // We could theoretically do preventDefault() here but it interferes with normal scrolling
        // on some browsers. For a simple implementation, just showing the indicator is enough.
      }
    };

    const handleTouchEnd = () => {
      if (!isPulling) return;

      const pullDistance = currentY.current - startY.current;

      if (pullDistance > PULL_THRESHOLD) {
        setShowConfirm(true);
      }

      setIsPulling(false);
      startY.current = 0;
      currentY.current = 0;
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isPulling, showConfirm, pathname, isRefreshing]);

  const handleConfirm = () => {
    setShowConfirm(false);
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        message="Are you sure you want to refresh the page?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmText="Refresh"
        cancelText={t('common.cancel')}
        type="warning"
      />
      {(isPulling || isRefreshing) && (
        <div className="fixed top-0 left-0 w-full flex justify-center py-4 z-50 transition-all duration-300 pointer-events-none">
          <div className="bg-white rounded-full shadow-md p-2 flex items-center justify-center text-teal-600">
            {isRefreshing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Loader2 className="w-6 h-6 animate-spin" />
            )}
          </div>
        </div>
      )}
      {children}
    </>
  );
}

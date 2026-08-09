// src/components/ui/ConfirmModal.tsx
// Reusable confirmation modal component to replace browser alert/confirm dialogs

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  isLoading?: boolean;
}

const iconMap = {
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const defaultTitles = {
  warning: 'common.confirmAction',
  danger: 'common.confirmDeletion',
  info: 'common.confirmAction',
  success: 'common.confirmAction',
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  type = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[type];
  const modalTitle = title || t(defaultTitles[type]);
  const defaultConfirmText = confirmText || t('common.confirm');
  const defaultCancelText = cancelText || t('common.cancel');

  // Disable background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel, isLoading]);

  // Focus trap inside modal
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      firstElement?.focus();

      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      };

      const currentModal = modalRef.current;
      currentModal?.addEventListener('keydown', handleTab);
      return () => {
        currentModal?.removeEventListener('keydown', handleTab);
      };
    }
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel?.();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-[var(--color-foreground)]/30 backdrop-blur-sm"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div className="w-full max-w-[340px] sm:max-w-md relative overflow-hidden bg-[var(--color-card)] rounded-2xl border border-[var(--color-border)] shadow-2xl p-6 sm:p-8">
              {/* Type indicator top bar */}
              <div className={cn(
                "absolute top-0 left-0 right-0 h-1.5",
                type === 'danger' && 'bg-[var(--color-error)]',
                type === 'warning' && 'bg-[var(--color-warning)]',
                type === 'success' && 'bg-[var(--color-success)]',
                type === 'info' && 'bg-[var(--color-info)]'
              )} />

              {/* Icon in squircle theme-colored container */}
              <div className={cn(
                "flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-4 rounded-xl",
                type === 'danger' && 'bg-[var(--color-error-light)] text-[var(--color-error)]',
                type === 'warning' && 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
                type === 'success' && 'bg-[var(--color-success-light)] text-[var(--color-success)]',
                type === 'info' && 'bg-[var(--color-info-light)] text-[var(--color-info)]',
              )}>
                <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              {/* Title using heading scale */}
              <h2
                id="modal-title"
                className="heading-md sm:heading-lg text-[var(--color-foreground)] text-center mb-2"
              >
                {modalTitle}
              </h2>

              {/* Message text description */}
              <p
                id="modal-description"
                className="text-body text-[var(--color-muted-foreground)] text-center mb-8 leading-relaxed"
              >
                {message}
              </p>

              {/* Action Buttons utilizing custom Button elements */}
              <div className="flex flex-col sm:flex-row gap-3">
                {onCancel && cancelText !== '' && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isLoading}
                    fullWidth
                  >
                    {defaultCancelText}
                  </Button>
                )}
                <Button
                  type="button"
                  variant={type === 'danger' ? 'danger' : 'primary'}
                  onClick={handleConfirm}
                  isLoading={isLoading}
                  fullWidth
                  className={cn(
                    type === 'warning' && 'bg-none bg-[var(--color-warning)] hover:bg-[var(--color-warning)]/90 focus-visible:ring-[var(--color-warning)]',
                    type === 'success' && 'bg-none bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 focus-visible:ring-[var(--color-success)]',
                    type === 'info' && 'bg-none bg-[var(--color-info)] hover:bg-[var(--color-info)]/90 focus-visible:ring-[var(--color-info)]',
                  )}
                >
                  {defaultConfirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

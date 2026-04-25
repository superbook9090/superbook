// src/components/ui/ConfirmModal.tsx
// Reusable confirmation modal component to replace browser alert/confirm dialogs

'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';

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

const colorMap = {
  warning: {
    bg: 'bg-[var(--warning-light)]',
    border: 'border-[var(--warning)]/20',
    icon: 'text-[var(--warning)]',
    button: 'bg-[var(--warning)] hover:opacity-90',
    buttonText: 'text-[var(--warning)]',
  },
  danger: {
    bg: 'bg-[var(--error-light)]',
    border: 'border-[var(--error)]/20',
    icon: 'text-[var(--error)]',
    button: 'bg-[var(--error)] hover:opacity-90',
    buttonText: 'text-[var(--error)]',
  },
  info: {
    bg: 'bg-[var(--info-light)]',
    border: 'border-[var(--info)]/20',
    icon: 'text-[var(--info)]',
    button: 'bg-[var(--info)] hover:opacity-90',
    buttonText: 'text-[var(--info)]',
  },
  success: {
    bg: 'bg-[var(--success-light)]',
    border: 'border-[var(--success)]/20',
    icon: 'text-[var(--success)]',
    button: 'bg-[var(--success)] hover:opacity-90',
    buttonText: 'text-[var(--success)]',
  },
};

const defaultTitles = {
  warning: 'Confirm Action',
  danger: 'Confirm Deletion',
  info: 'Confirm Action',
  success: 'Confirm Action',
};

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel=()=>{},
  confirmText,
  cancelText = '',
  type = 'warning',
  isLoading = false,
}: ConfirmModalProps) {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const Icon = iconMap[type];
  const colors = colorMap[type];
  const modalTitle = title || defaultTitles[type];
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
        onCancel();
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
      onCancel();
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-foreground)]/60 p-4"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div className="w-full max-w-md">
              <div className={`bg-[var(--card-solid)] rounded-3xl shadow-2xl p-6 md:p-8 border ${colors.border}`}>
                {/* Icon */}
                <div className={`flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full ${colors.bg}`}>
                  <Icon className={`w-8 h-8 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h2
                  id="modal-title"
                  className="text-2xl font-bold text-[var(--color-card-foreground)] text-center mb-2"
                >
                  {modalTitle}
                </h2>

                {/* Message */}
                <p
                  id="modal-description"
                  className="text-[var(--color-muted)] text-center mb-8 leading-relaxed"
                >
                  {message}
                </p>

                {/* Buttons */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                  {cancelText && <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 text-[var(--foreground)] bg-[var(--muted-light)] hover:opacity-80 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--border)] focus:ring-offset-2"
                  >
                    {defaultCancelText}
                  </button>}
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`flex-1 px-6 py-3 text-white ${colors.button} rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2`}
                  >
                    {isLoading ? (
                      <>
                        <Loader size="sm" />
                        {t('common.loading')}
                      </>
                    ) : (
                      defaultConfirmText
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

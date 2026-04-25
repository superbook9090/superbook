'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger',
}: ConfirmDialogProps) {
  const styles = {
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-[var(--error-light)]',
      iconColor: 'text-[var(--error)]',
      confirmBg: 'bg-[var(--error)] hover:bg-[var(--error)]/90',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-[var(--warning-light)]',
      iconColor: 'text-[var(--warning)]',
      confirmBg: 'bg-[var(--warning)] hover:bg-[var(--warning)]/90',
    },
    info: {
      icon: AlertTriangle,
      iconBg: 'bg-[var(--info-light)]',
      iconColor: 'text-[var(--info)]',
      confirmBg: 'bg-[var(--info)] hover:bg-[var(--info)]/90',
    },
  };

  const currentStyle = styles[type];
  const Icon = currentStyle.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onCancel}
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[var(--card-solid)] rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${currentStyle.iconBg}`}>
                  <Icon className={`w-6 h-6 ${currentStyle.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] mt-2">{message}</p>
                </div>
                <button
                  onClick={onCancel}
                  className="p-1 hover:bg-[var(--color-foreground)]/5 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--color-foreground)] font-medium hover:bg-[var(--color-foreground)]/5 transition-colors min-h-[44px]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-medium transition-colors min-h-[44px] ${currentStyle.confirmBg}`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

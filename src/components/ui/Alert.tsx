'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type = 'info', message, onClose }: AlertProps) {
  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  };

  const colors = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    error: 'text-red-600',
    success: 'text-green-600',
    info: 'text-blue-600',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />
        <p className="flex-1 text-sm font-medium">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

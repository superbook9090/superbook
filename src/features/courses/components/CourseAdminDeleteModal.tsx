'use client';

import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CourseAdminDeleteModalProps {
  isOpen: boolean;
  courseTitle: string;
  deleteReason: string;
  onChangeReason: (reason: string) => void;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CourseAdminDeleteModal({
  isOpen,
  courseTitle,
  deleteReason,
  onChangeReason,
  isDeleting,
  onClose,
  onConfirm,
}: CourseAdminDeleteModalProps) {
  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9990] flex items-center justify-center p-4">
      <div className="teacher-panel p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)]">Delete Course</h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
              Deleting course: <strong className="text-[var(--color-foreground)]">{courseTitle}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[var(--error-light)] border border-[var(--error)]/25 p-3.5 rounded-xl">
          <p className="text-xs text-[var(--error)] leading-relaxed font-medium">
            Warning: This action will permanently remove the course and its contents. An email notification will be sent to the instructor with your reason for deletion.
          </p>
        </div>

        <div>
          <label
            htmlFor="deleteReason"
            className="block text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1.5"
          >
            Reason for Deletion <span className="text-[var(--error)]">*</span>
          </label>
          <textarea
            id="deleteReason"
            rows={4}
            required
            value={deleteReason}
            onChange={(e) => onChangeReason(e.target.value)}
            placeholder="Please state why this course is being deleted. This reason will be emailed directly to the instructor..."
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:ring-2 focus:ring-[var(--error)]/25 focus:border-[var(--error)] focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-[42px] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            disabled={isDeleting || !deleteReason.trim()}
            className="min-h-[42px] rounded-xl"
          >
            {isDeleting ? 'Deleting...' : 'Confirm & Delete'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

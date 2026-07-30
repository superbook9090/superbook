'use client';

import type React from 'react';
import { GripVertical, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

/** Wraps children in a Tooltip only when a label is provided. */
function MaybeTooltip({ label, children }: { label?: string; children: React.ReactElement }) {
  if (!label) return children;
  return <Tooltip label={label}>{children}</Tooltip>;
}

export const TOUCH_TARGET_CLASS =
  'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors';

export function DragHandleButton({
  attributes,
  listeners,
  label,
}: {
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  label: string;
}) {
  return (
    <MaybeTooltip label={label}>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={cn(
          TOUCH_TARGET_CLASS,
          'text-[var(--color-muted)] cursor-grab active:cursor-grabbing touch-none hover:bg-[var(--color-surface-muted)]'
        )}
        aria-label={label}
      >
        <GripVertical className="w-5 h-5" />
      </button>
    </MaybeTooltip>
  );
}

export function RowIconButton({
  onClick,
  label,
  variant = 'default',
  children,
}: {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  variant?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <MaybeTooltip label={label}>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={cn(
          TOUCH_TARGET_CLASS,
          variant === 'danger'
            ? 'text-[var(--color-muted)] hover:text-[var(--color-error)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'
        )}
      >
        {children}
      </button>
    </MaybeTooltip>
  );
}

export function ExpandToggleButton({
  expanded,
  onClick,
  label,
}: {
  expanded: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <MaybeTooltip label={label}>
      <button type="button" onClick={onClick} aria-label={label} className={cn(TOUCH_TARGET_CLASS, 'text-[var(--color-muted)]')}>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
    </MaybeTooltip>
  );
}

export function RowEditDeleteActions({
  onEdit,
  onDelete,
  editLabel,
  deleteLabel,
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
}) {
  return (
    <>
      <RowIconButton onClick={onEdit} label={editLabel}>
        <Pencil className="w-4 h-4" />
      </RowIconButton>
      <RowIconButton onClick={onDelete} label={deleteLabel} variant="danger">
        <Trash2 className="w-4 h-4" />
      </RowIconButton>
    </>
  );
}

export function toggleExpanded(setter: React.Dispatch<React.SetStateAction<Record<string, boolean>>>, id: string) {
  setter((prev) => ({ ...prev, [id]: !prev[id] }));
}

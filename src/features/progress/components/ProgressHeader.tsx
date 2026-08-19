'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { RotateCw, TrendingUp } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface ProgressHeaderProps {
  title: string;
  description: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  actions?: React.ReactNode;
}

export function ProgressHeader({
  title,
  description,
  onRefresh,
  isRefreshing = false,
  actions,
}: ProgressHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)]">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span>{title}</span>
        </div>
      }
      description={description}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {onRefresh && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="touch-target"
            >
              <RotateCw className={`w-4 h-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('progress.refresh')}</span>
            </Button>
          )}
          {actions}
        </div>
      }
    />
  );
}

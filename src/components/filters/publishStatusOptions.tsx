import { SlidersHorizontal, Eye, EyeOff } from 'lucide-react';
import type { SegmentedFilterOption } from './DashboardListFilters';

export type PublishStatusFilter = 'all' | 'published' | 'draft';

export function buildPublishStatusOptions(labels: {
  all: string;
  published: string;
  draft: string;
}): SegmentedFilterOption[] {
  return [
    { id: 'all', label: labels.all, icon: <SlidersHorizontal className="w-4 h-4 shrink-0" aria-hidden /> },
    { id: 'published', label: labels.published, icon: <Eye className="w-4 h-4 shrink-0" aria-hidden /> },
    { id: 'draft', label: labels.draft, icon: <EyeOff className="w-4 h-4 shrink-0" aria-hidden /> },
  ];
}

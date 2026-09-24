export type AccentTone = 'brand' | 'negative';
export type Variant = 'not-found' | 'gone' | 'error';

export interface ErrorScreenProps {
  retry?: () => void;
  variant?: Variant;
  embedded?: boolean;
  inline?: boolean;
  error?: (Error & { digest?: string }) | null;
}

export const COPY: Record<
  Variant,
  { code: string; titleKey: string; bodyKey: string; statusKey: string }
> = {
  'not-found': {
    code: '404',
    titleKey: 'pageNotFound',
    bodyKey: 'pageNotFoundBody',
    statusKey: 'slotStatusNotFound',
  },
  gone: {
    code: '410',
    titleKey: 'pageGone',
    bodyKey: 'pageGoneBody',
    statusKey: 'slotStatusGone',
  },
  error: {
    code: '500',
    titleKey: 'pageError',
    bodyKey: 'pageErrorBody',
    statusKey: 'slotStatusError',
  },
};

export const REDIRECT_SECONDS = 8;

'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Copy, Check, Share2 } from 'lucide-react';

type Props = {
  title: string;
  url: string;
};

export default function PublicBlogShareButtons({ title, url }: Props) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  async function handleNativeShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
      return;
    }

    handleCopyLink();
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={handleNativeShare}
        className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white flex items-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all"
      >
        <Share2 className="w-4 h-4" />
        {t('blog.shareLabel') || 'Share'}
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className="rounded-lg border border-[var(--border)] bg-[var(--card-solid)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] flex items-center gap-1.5 hover:bg-[var(--color-surface-muted)] active:scale-[0.98] transition-all"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-500 animate-in fade-in zoom-in-50 duration-200" />
            <span className="animate-in fade-in duration-200">{t('blog.linkCopiedLabel') || 'Link Copied!'}</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 text-[var(--color-muted-foreground)]" />
            <span>{t('blog.copyLinkLabel') || 'Copy Link'}</span>
          </>
        )}
      </button>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg border border-[var(--border)] bg-[var(--card-solid)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] flex items-center hover:bg-[var(--color-surface-muted)] active:scale-[0.98] transition-all"
      >
        LinkedIn
      </a>
    </div>
  );
}

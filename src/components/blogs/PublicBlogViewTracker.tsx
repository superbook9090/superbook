'use client';

import { useEffect } from 'react';

type Props = {
  slug: string;
};

export default function PublicBlogViewTracker({ slug }: Props) {
  useEffect(() => {
    void fetch(`/api/blogs/public/${encodeURIComponent(slug)}/view`, {
      method: 'POST',
    }).catch(() => undefined);
  }, [slug]);

  return null;
}

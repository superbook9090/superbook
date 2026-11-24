function sanitizeFilename(name?: string): string {
  const cleaned = (name || 'course-image')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'course-image';
}

function extensionFromMime(mimeType: string): string | null {
  const normalized = mimeType.split(';')[0].trim().toLowerCase();
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return map[normalized] || null;
}

function extensionFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url, window.location.origin).pathname;
    const match = /\.(jpe?g|png|webp|gif|svg|avif)$/i.exec(pathname);
    return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : null;
  } catch {
    return null;
  }
}

function triggerAnchorDownload(href: string, filename: string): void {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Downloads a course or uploaded image directly to the user's device.
 * Handles data URLs, CORS-enabled hosts (e.g. Cloudinary), and an optional
 * authenticated server fallback endpoint for third-party non-CORS image URLs.
 */
export async function downloadImage(
  imageUrl: string,
  filenameBase?: string,
  fallbackApiUrl?: string
): Promise<void> {
  if (!imageUrl || typeof window === 'undefined') return;

  const base = sanitizeFilename(filenameBase);

  // 1. Inline data URLs
  if (imageUrl.startsWith('data:image/')) {
    const mimeMatch = /^data:(image\/[^;]+);/i.exec(imageUrl);
    const ext = (mimeMatch && extensionFromMime(mimeMatch[1])) || 'png';
    triggerAnchorDownload(imageUrl, `${base}.${ext}`);
    return;
  }

  // 2. Direct client fetch -> Blob -> Object URL download (works on Cloudinary & same-origin)
  try {
    const response = await fetch(imageUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const ext = extensionFromMime(blob.type) || extensionFromUrl(imageUrl) || 'jpg';
      const objectUrl = URL.createObjectURL(blob);
      try {
        triggerAnchorDownload(objectUrl, `${base}.${ext}`);
      } finally {
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      }
      return;
    }
  } catch {
    // Fall through to server fallback or new tab
  }

  // 3. Authenticated server-side proxy fallback (avoids CORS issues on external URLs)
  if (fallbackApiUrl) {
    try {
      const response = await fetch(fallbackApiUrl, { credentials: 'include' });
      if (response.ok) {
        const blob = await response.blob();
        const ext = extensionFromMime(blob.type) || extensionFromUrl(imageUrl) || 'jpg';
        const objectUrl = URL.createObjectURL(blob);
        try {
          triggerAnchorDownload(objectUrl, `${base}.${ext}`);
        } finally {
          window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        }
        return;
      }
    } catch {
      // Fall through to direct open
    }
  }

  // 4. Last resort: open image in new tab so user can save manually
  window.open(imageUrl, '_blank', 'noopener,noreferrer');
}

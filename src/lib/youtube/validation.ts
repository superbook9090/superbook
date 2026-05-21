export const MAX_VIDEO_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB limit

export function validateVideoContentType(contentType: string | null): string {
  if (!contentType || !contentType.startsWith('video/')) {
    throw new Error('Only video files are allowed');
  }

  let ext = '.mp4';
  if (contentType === 'video/webm') ext = '.webm';
  if (contentType === 'video/quicktime') ext = '.mov';

  return ext;
}

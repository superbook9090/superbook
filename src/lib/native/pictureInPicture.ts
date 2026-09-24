/**
 * Native Picture-in-Picture (PiP) API helper.
 * Allows students to dock lesson videos while taking notes or reviewing materials.
 */

export function isPipSupported(): boolean {
  return typeof document !== 'undefined' && Boolean(document.pictureInPictureEnabled);
}

export function isElementInPip(video: HTMLVideoElement | null): boolean {
  if (!video || typeof document === 'undefined') return false;
  return document.pictureInPictureElement === video;
}

export async function togglePictureInPicture(video: HTMLVideoElement | null): Promise<boolean> {
  if (!video || !isPipSupported()) return false;

  try {
    if (document.pictureInPictureElement === video) {
      await document.exitPictureInPicture();
      return false;
    } else {
      await video.requestPictureInPicture();
      return true;
    }
  } catch (err) {
    console.debug('[PiP] Picture-in-picture error:', err);
    return false;
  }
}

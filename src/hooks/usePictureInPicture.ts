'use client';

import { useState, useEffect, useCallback, RefObject } from 'react';
import { isPipSupported, togglePictureInPicture, isElementInPip } from '@/lib/native/pictureInPicture';

export function usePictureInPicture(videoRef: RefObject<HTMLVideoElement | null>) {
  const [isInPip, setIsInPip] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isPipSupported());
    const video = videoRef.current;
    if (!video) return;

    const onEnterPip = () => setIsInPip(true);
    const onLeavePip = () => setIsInPip(false);

    video.addEventListener('enterpictureinpicture', onEnterPip);
    video.addEventListener('leavepictureinpicture', onLeavePip);

    return () => {
      video.removeEventListener('enterpictureinpicture', onEnterPip);
      video.removeEventListener('leavepictureinpicture', onLeavePip);
    };
  }, [videoRef]);

  const toggle = useCallback(async () => {
    const active = await togglePictureInPicture(videoRef.current);
    setIsInPip(active);
  }, [videoRef]);

  return {
    isSupported,
    isInPip: isInPip || isElementInPip(videoRef.current),
    togglePip: toggle,
  };
}

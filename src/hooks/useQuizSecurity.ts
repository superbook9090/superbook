import { useEffect, useRef, useCallback, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface FullscreenElement extends HTMLElement {
  webkitRequestFullscreen?: () => Promise<void>;
  mozRequestFullScreen?: () => Promise<void>;
  msRequestFullscreen?: () => Promise<void>;
  webkitExitFullscreen?: () => Promise<void>;
  mozCancelFullScreen?: () => Promise<void>;
  msExitFullscreen?: () => Promise<void>;
}

interface QuizSecurityOptions {
  onViolation: (reason: string) => void;
  enabled?: boolean;
}

interface QuizSecurityState {
  isFullscreen: boolean;
  violationCount: number;
  attemptNumber: number;
  isActive: boolean;
}

export function useQuizSecurity({
  onViolation,
  enabled = true,
}: QuizSecurityOptions) {
  const [state, setState] = useState<QuizSecurityState>({
    isFullscreen: false,
    violationCount: 0,
    attemptNumber: 1,
    isActive: false,
  });

  const isSubmittingRef = useRef(false);
  const sessionIdRef = useRef<string>(generateSessionId());
  
  // Use localStorage for active quiz session
  const { storedValue: activeSession, setValue: setActiveSession } = useLocalStorage<string | null>('activeQuizSession', null);

  // Generate unique session ID for tab detection
  function generateSessionId(): string {
    return `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store session ID in localStorage for multi-tab detection
  const setSessionStorage = useCallback(() => {
    // Clear any existing session first to avoid false positives from stale data
    setActiveSession(sessionIdRef.current);
  }, [setActiveSession]);

  const clearSessionStorage = useCallback(() => {
    setActiveSession(null);
  }, [setActiveSession]);

  // Check for duplicate tabs
  const checkDuplicateTab = useCallback(() => {
    if (activeSession && activeSession !== sessionIdRef.current) {
      return true;
    }
    return false;
  }, [activeSession]);

  // Request fullscreen
  const requestFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return false;

    try {
      const element = document.documentElement as FullscreenElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      }
      return true;
    } catch {
      // Silently handle fullscreen errors - they're not critical for quiz functionality
      return false;
    }
  }, []);

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return;

    // Check if fullscreen is actually active before attempting to exit
    const isFullscreenActive = !!(
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
    );

    if (!isFullscreenActive) return;

    try {
      const element = document.documentElement as FullscreenElement;
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (element.webkitExitFullscreen) {
        await element.webkitExitFullscreen();
      } else if (element.mozCancelFullScreen) {
        await element.mozCancelFullScreen();
      } else if (element.msExitFullscreen) {
        await element.msExitFullscreen();
      }
    } catch {
      // Silently handle fullscreen exit errors - they're not critical for quiz functionality
    }
  }, []);

  // Handle violation
  const handleViolation = useCallback(
    (reason: string) => {
      if (isSubmittingRef.current) return;

      setState((prev) => {
        const newViolationCount = prev.violationCount + 1;
        const newAttemptNumber = prev.attemptNumber + 1;

        // Trigger violation callback (no max attempts limit)
        onViolation(reason);

        return {
          ...prev,
          violationCount: newViolationCount,
          attemptNumber: newAttemptNumber,
        };
      });

      // Exit fullscreen on violation
      exitFullscreen();
    },
    [onViolation, exitFullscreen]
  );

  // Handle fullscreen change
  const handleFullscreenChange = useCallback(() => {
    if (typeof document === 'undefined') return;

    const isFullscreenActive = !!(
      document.fullscreenElement ||
      (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as Document & { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as Document & { msFullscreenElement?: Element }).msFullscreenElement
    );

    setState((prev) => ({ ...prev, isFullscreen: isFullscreenActive }));

    // Add/remove class to body to hide sidebar in fullscreen
    if (isFullscreenActive) {
      document.body.classList.add('quiz-fullscreen');
    } else {
      document.body.classList.remove('quiz-fullscreen');
    }

    // If fullscreen was exited while quiz is active, it's a violation
    if (!isFullscreenActive && state.isActive && !isSubmittingRef.current) {
      handleViolation('fullscreen_exit');
    }
  }, [state.isActive, handleViolation]);

  // Handle visibility change (tab switch)
  const handleVisibilityChange = useCallback(() => {
    if (typeof document === 'undefined') return;

    if (document.hidden && state.isActive && !isSubmittingRef.current) {
      handleViolation('tab_switch');
    }
  }, [state.isActive, handleViolation]);

  // Handle window blur (alt-tab, minimize)
  const handleWindowBlur = useCallback(() => {
    if (state.isActive && !isSubmittingRef.current) {
      handleViolation('window_blur');
    }
  }, [state.isActive, handleViolation]);

  // Handle beforeunload (page refresh/close)
  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (state.isActive && !isSubmittingRef.current) {
        e.preventDefault();
        e.returnValue = '';
        // Handle as violation
        handleViolation('page_exit');
      }
    },
    [state.isActive, handleViolation]
  );

  // Handle keyboard shortcuts for dev tools
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!state.isActive || isSubmittingRef.current) return;

      const key = e.key.toUpperCase();
      // Detect common dev tools shortcuts (F12, Ctrl/Cmd + Shift + I/J/C/K, Ctrl/Cmd + U, Cmd + Option + I/J/C)
      const isDevToolsShortcut =
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'I' || key === 'J' || key === 'C' || key === 'K')) ||
        ((e.ctrlKey || e.metaKey) && key === 'U') ||
        (e.metaKey && e.altKey && (key === 'I' || key === 'J' || key === 'C'));

      if (isDevToolsShortcut) {
        e.preventDefault();
        e.stopPropagation();
        handleViolation('dev_tools');
      }
    },
    [state.isActive, handleViolation]
  );

  // Disable context menu (right click inspect element) during active quiz
  const handleContextMenu = useCallback(
    (e: MouseEvent) => {
      if (!state.isActive || isSubmittingRef.current) return;
      e.preventDefault();
    },
    [state.isActive]
  );

  // Detect dev tools via window resize (dev tools changes window size)
  const devToolsThresholdRef = useRef(window.outerWidth - window.innerWidth > 160 || window.outerHeight - window.innerHeight > 160);

  const handleResize = useCallback(() => {
    if (!state.isActive || isSubmittingRef.current) return;

    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;

    // If the difference is significant, dev tools might be open
    if ((widthDiff > 160 || heightDiff > 160) && !devToolsThresholdRef.current) {
      devToolsThresholdRef.current = true;
      handleViolation('dev_tools');
    } else if (widthDiff <= 160 && heightDiff <= 160) {
      devToolsThresholdRef.current = false;
    }
  }, [state.isActive, handleViolation]);

  // Reset dev tools detection (called when user continues after violation)
  const resetDevToolsDetection = useCallback(() => {
    devToolsThresholdRef.current = false;
  }, []);

  // Start quiz security
  const startQuiz = useCallback(async () => {
    if (!enabled) return false;

    // Clear any existing session and regenerate session ID for each new quiz attempt
    setActiveSession(null);
    sessionIdRef.current = generateSessionId();

    // Set session in localStorage
    setSessionStorage();

    // Request fullscreen
    const fullscreenSuccess = await requestFullscreen();

    // Reset violation count for fresh attempt
    setState((prev) => ({
      ...prev,
      isFullscreen: fullscreenSuccess,
      isActive: true,
      violationCount: 0, // Reset violations for fresh session
    }));

    return fullscreenSuccess;
  }, [enabled, setSessionStorage, requestFullscreen, setActiveSession]);

  // Stop quiz security
  const stopQuiz = useCallback(() => {
    isSubmittingRef.current = true;
    setState((prev) => ({ ...prev, isActive: false, isFullscreen: false }));
    clearSessionStorage();
    exitFullscreen();
  }, [clearSessionStorage, exitFullscreen]);

  // Update attempt number (called from backend response)
  const updateAttemptNumber = useCallback((attemptNumber: number) => {
    setState((prev) => ({ ...prev, attemptNumber }));
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    // Fullscreen change
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Window blur
    window.addEventListener('blur', handleWindowBlur);

    // Before unload
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Keyboard shortcuts (dev tools detection)
    window.addEventListener('keydown', handleKeyDown);

    // Disable right click during quiz
    window.addEventListener('contextmenu', handleContextMenu);

    // Window resize (dev tools detection)
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, handleFullscreenChange, handleVisibilityChange, handleWindowBlur, handleBeforeUnload, handleKeyDown, handleContextMenu, handleResize, checkDuplicateTab, handleViolation, setActiveSession]);

  // Reset submitting flag when not active
  useEffect(() => {
    if (!state.isActive) {
      isSubmittingRef.current = false;
    }
  }, [state.isActive]);

  return {
    state,
    startQuiz,
    stopQuiz,
    updateAttemptNumber,
    requestFullscreen,
    exitFullscreen,
    resetDevToolsDetection,
  };
}

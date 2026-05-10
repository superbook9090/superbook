// Razorpay SDK loading utility with caching and error handling

let razorpayPromise: Promise<void> | null = null;

export async function loadRazorpay(): Promise<void> {
  // Return existing promise if already loading
  if (razorpayPromise) {
    return razorpayPromise;
  }

  // Check if Razorpay is already loaded
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return Promise.resolve();
  }

  // Create and cache the loading promise
  razorpayPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    if (typeof document !== 'undefined') {
      const existingScript = document.querySelector('script[src*="razorpay"]');
      if (existingScript) {
        resolve();
        return;
      }
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve();
    };

    script.onerror = (error) => {
      console.error('Failed to load Razorpay SDK:', error);
      razorpayPromise = null; // Reset promise to allow retry
      reject(new Error('Failed to load Razorpay SDK'));
    };

    // Add script to document
    if (typeof document !== 'undefined') {
      document.head.appendChild(script);
    } else {
      reject(new Error('Document not available'));
    }
  });

  return razorpayPromise;
}

// Check if Razorpay is available
export function isRazorpayAvailable(): boolean {
  return typeof window !== 'undefined' && !!(window as any).Razorpay;
}

// Get Razorpay instance with error handling
export function getRazorpayInstance() {
  if (!isRazorpayAvailable()) {
    throw new Error('Razorpay SDK not loaded');
  }
  return (window as any).Razorpay;
}

// Preload Razorpay SDK for better performance
export function preloadRazorpay(): void {
  // Start loading in background without blocking
  loadRazorpay().catch(error => {
    console.warn('Razorpay preload failed:', error);
  });
}

// Cleanup function to remove script if needed
export function cleanupRazorpay(): void {
  if (typeof document !== 'undefined') {
    const script = document.querySelector('script[src*="razorpay"]');
    if (script) {
      script.remove();
    }
  }
  razorpayPromise = null;
}

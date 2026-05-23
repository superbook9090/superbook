import { useRouter } from 'next/navigation';

export const handleDeepLink = (url: string, router: ReturnType<typeof useRouter>) => {
  try {
    // Handle standard quizdo:// deep links
    if (url.startsWith('quizdo://')) {
      const path = url.replace('quizdo://', '/dashboard/student/');
      router.push(path);
      return true;
    }
    
    // Fallback for relative paths
    if (url.startsWith('/')) {
      router.push(url);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to handle deep link:', error);
    return false;
  }
};

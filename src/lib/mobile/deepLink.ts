import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/**
 * Map a quizdo:// deep link to its web dashboard route. The deep link paths
 * use singular segments (course/quiz/certificate) while web routes are plural,
 * so each shape is mapped explicitly.
 */
function resolveDeepLinkPath(url: string): string | null {
  const path = url.replace('quizdo://', '');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return ROUTES.student.root;

  const [head, id, sub, subId] = segments;

  switch (head) {
    case 'course':
      if (!id) return ROUTES.student.courses;
      if (sub === 'lesson' && subId) return ROUTES.student.lesson(id, subId);
      return ROUTES.student.course(id);
    case 'quiz':
      return id ? ROUTES.student.quiz(id) : ROUTES.student.quizzes;
    case 'certificate':
      return id ? ROUTES.student.certificate(id) : ROUTES.student.certificates;
    default:
      // Unknown link shape: land on the student dashboard instead of a 404.
      return ROUTES.student.root;
  }
}

export const handleDeepLink = (url: string, router: ReturnType<typeof useRouter>) => {
  try {
    // Handle standard quizdo:// deep links
    if (url.startsWith('quizdo://')) {
      const path = resolveDeepLinkPath(url);
      if (path) router.push(path);
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

import { Metadata } from 'next';
import PrivacyPageClient from '@/features/privacy/components/PrivacyPageClient';

export const metadata: Metadata = {
  title: 'Privacy Policy | quiz-do',
  description: 'Your privacy is important to us. Read the privacy policy of quiz-do and learn how we protect your data.',
  keywords: ['privacy', 'policy', 'data protection', 'quiz-do', 'security'],
};

export default function PrivacyPage() {
  return <PrivacyPageClient />;
}

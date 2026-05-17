import { Metadata } from 'next';
import ContactPageClient from '@/features/contact/components/ContactPageClient';

export const metadata: Metadata = {
  title: 'Contact Us | quiz-do',
  description: 'Get in touch with the quiz-do team. We are here to support your learning, answer your questions, and hear your feedback.',
  keywords: ['contact', 'support', 'quiz-do', 'LMS', 'help', 'learning platform'],
};

export default function ContactPage() {
  return <ContactPageClient />;
}

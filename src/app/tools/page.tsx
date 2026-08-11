import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import ToolsIndexClient from './ToolsIndexClient';

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
  title: 'Free Education Tools — Quiz Maker, Course Builder & More',
  description:
    "Explore Quiz Do's free education tools: quiz maker, MCQ generator, AI quiz generator, course maker, test series builder, and LMS platform.",
  path: '/tools',
  keywords: ['quiz maker', 'course maker', 'test series', 'MCQ generator', 'LMS tools'],
});

export default function ToolsIndexPage() {
  return <ToolsIndexClient />;
}

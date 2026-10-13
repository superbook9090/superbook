import type { Metadata } from 'next';
import MarketingHeader from '@/components/home/MarketingHeader';
import { LazyHomeFooter } from '@/lib/lazy/home';
import { QueryProvider } from '@/lib/react-query/QueryProvider';
import { createPageMetadata } from '@/lib/seo/metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Live Quiz Contests & Competitions | Daily Mixed GK & GS Arena',
  description:
    'Join scheduled live quiz contests, compete against peers, climb the leaderboards, and test your knowledge in Mixed GK & GS on Quiz-Do. Timed arena for UPSC, SSC, Railways & State PSCs.',
  path: '/contests',
  keywords: [
    'live quiz contests',
    'daily mixed gk gs contest',
    'online competition quiz',
    'upsc ssc mock test contest',
    'speed test quiz competition',
    'quiz do contest arena',
    'दैनिक सामान्य ज्ञान प्रतियोगिता',
  ],
});

export default function ContestsLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen flex flex-col bg-[var(--background)]">
        <MarketingHeader forceScrolled={true} />
        <div className="flex-1 mt-20 sm:mt-24">
          {children}
        </div>
        <LazyHomeFooter />
      </div>
    </QueryProvider>
  );
}

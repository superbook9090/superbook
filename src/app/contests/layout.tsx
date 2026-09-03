import type { Metadata } from 'next';
import MarketingHeader from '@/components/home/MarketingHeader';
import { LazyHomeFooter } from '@/lib/lazy/home';
import { QueryProvider } from '@/lib/react-query/QueryProvider';

export const metadata: Metadata = {
  title: 'Contests & Competitions | Quiz-Do',
  description:
    'Join scheduled live quiz contests, compete against peers, climb the leaderboards, and win prizes on Quiz-Do.',
};

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

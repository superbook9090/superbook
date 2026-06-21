import MarketingHeader from '@/components/home/MarketingHeader';
import { LazyHomeFooter } from '@/lib/lazy/home';

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MarketingHeader forceScrolled={true} />
      <div className="flex-1 mt-20 sm:mt-24">
        {children}
      </div>
      <LazyHomeFooter />
    </div>
  );
}

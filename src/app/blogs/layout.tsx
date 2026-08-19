import MarketingHeader from '@/components/home/MarketingHeader';
import { LazyHomeFooter } from '@/lib/lazy/home';
import { QueryProvider } from '@/lib/react-query/QueryProvider';

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <div className="min-h-screen flex flex-col">
        <MarketingHeader forceScrolled={true} />
        <div className="flex-1 mt-20 sm:mt-24">
          {children}
        </div>
        <LazyHomeFooter />
      </div>
    </QueryProvider>
  );
}

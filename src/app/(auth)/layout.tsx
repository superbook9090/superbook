import AuthProviders from '@/components/providers/AuthProviders';
import MarketingHeader from '@/components/home/MarketingHeader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviders>
      <MarketingHeader forceScrolled />
      <div className="pt-16 sm:pt-20">
        {children}
      </div>
    </AuthProviders>
  );
}

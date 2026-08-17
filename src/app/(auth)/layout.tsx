import AuthProviders from '@/components/providers/AuthProviders';
import MarketingHeader from '@/components/home/MarketingHeader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviders>
      <div className="relative min-h-[100dvh] flex flex-col overflow-x-hidden">
        <div className="aurora-bg" aria-hidden>
          <div className="grid-lines absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" />
          <div className="aurora-blob -top-40 -left-40 size-[38rem] bg-[var(--primary)] opacity-[0.16]" />
          <div className="aurora-blob -top-20 -right-40 size-[34rem] bg-[var(--primary-accent)] opacity-[0.13] [animation-delay:-5s]" />
        </div>
        <MarketingHeader forceScrolled />
        <div className="relative pt-16 sm:pt-20 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </AuthProviders>
  );
}

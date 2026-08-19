import AuthProviders from '@/components/providers/AuthProviders';
import AuthHeader from '@/features/auth/components/AuthHeader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProviders>
      <div className="relative h-dvh max-h-dvh flex flex-col bg-[var(--color-background)] selection:bg-[var(--primary)] selection:text-white overflow-hidden">
        {/* Ambient Aurora Background */}
        <div className="aurora-bg fixed inset-0 pointer-events-none" aria-hidden>
          <div className="grid-lines absolute inset-0 opacity-[0.25] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_10%,#000,transparent)]" />
          <div className="aurora-blob -top-40 -left-40 size-[42rem] bg-[var(--primary)] opacity-[0.12] blur-3xl" />
          <div className="aurora-blob -top-20 -right-40 size-[38rem] bg-[var(--primary-accent)] opacity-[0.10] [animation-delay:-5s] blur-3xl" />
          <div className="aurora-blob bottom-10 left-1/3 size-[30rem] bg-indigo-500 opacity-[0.08] [animation-delay:-8s] blur-3xl" />
        </div>

        {/* Dedicated Auth Header */}
        <AuthHeader />

        {/* Main Content Area */}
        <main className="relative flex-1 flex flex-col h-full overflow-hidden justify-center">
          {children}
        </main>
      </div>
    </AuthProviders>
  );
}


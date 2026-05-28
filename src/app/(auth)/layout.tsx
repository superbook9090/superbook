import AuthProviders from '@/components/providers/AuthProviders';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <AuthProviders>{children}</AuthProviders>;
}

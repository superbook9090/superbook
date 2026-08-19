import type { Session } from '@/types';
import type { AccountInfo } from '@/lib/api/auth';

export type ProfileTabKey = 'account' | 'security';

export interface ProfileHookState {
  session: Session | null;
  accountInfo: AccountInfo | null;
  isLoadingAccount: boolean;
  activeTab: ProfileTabKey;
  setActiveTab: (tab: ProfileTabKey) => void;
  refreshAccountInfo: () => Promise<void>;
}

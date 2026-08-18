import type { Session } from '@/types';
import type { AccountInfo } from '@/lib/api/auth';

export type ProfileTabKey = 'account' | 'security' | 'capabilities' | 'shortcuts';

export interface ProfileHookState {
  session: Session | null;
  accountInfo: AccountInfo | null;
  isLoadingAccount: boolean;
  activeTab: ProfileTabKey;
  setActiveTab: (tab: ProfileTabKey) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  copiedId: boolean;
  handleCopyId: () => void;
  refreshAccountInfo: () => Promise<void>;
}

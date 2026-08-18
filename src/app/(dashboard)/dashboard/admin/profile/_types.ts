import type { Session } from '@/types';
import type { AccountInfo } from '@/lib/api/auth';

export type AdminProfileTabKey = 'account' | 'security' | 'permissions' | 'shortcuts';

export interface AdminProfileHookState {
  session: Session | null;
  accountInfo: AccountInfo | null;
  isLoadingAccount: boolean;
  activeTab: AdminProfileTabKey;
  setActiveTab: (tab: AdminProfileTabKey) => void;
  showPasswordModal: boolean;
  setShowPasswordModal: (show: boolean) => void;
  copiedId: boolean;
  handleCopyId: () => void;
  refreshAccountInfo: () => Promise<void>;
}

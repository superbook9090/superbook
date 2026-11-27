// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Users, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { isSuperAdmin } from '@/lib/roles';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { UsersStats } from './_components/UsersStats';
import { UsersTable } from './_components/UsersTable';
import { UsersMobileList } from './_components/UsersMobileList';
import { UsersPaginationBar } from './_components/UsersPaginationBar';
import { UserDetailModal } from './_components/UserDetailModal';
import { useAdminUsers } from './_hooks/useAdminUsers';
import { useUsersFilterChips } from './_hooks/useUsersFilterChips';
import { PageWrapper, EmptyState } from '@/components/layout';
import { OrganizationInviteShareModal } from '@/components/organization/OrganizationInviteShareModal';

export default function AdminUsersPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const u = useAdminUsers();
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (u.status === 'loading') return;
    if (!u.session) {
      router.push(ROUTES.login);
      return;
    }
    if (!isSuperAdmin(u.session.user?.role) && u.session.user?.role !== 'admin') {
      router.push(ROUTES.dashboard);
    }
  }, [u.session, u.status, router]);

  const isSuper = isSuperAdmin(u.session?.user?.role);
  const filterChips = useUsersFilterChips({
    roleFilter: u.roleFilter,
    setRoleFilter: u.setRoleFilter,
    platformFilter: u.platformFilter,
    setPlatformFilter: u.setPlatformFilter,
    activityFilter: u.activityFilter,
    setActivityFilter: u.setActivityFilter,
    statusFilter: u.statusFilter,
    setStatusFilter: u.setStatusFilter,
    orgFilter: u.orgFilter,
    setOrgFilter: u.setOrgFilter,
    setPage: u.setPage,
    isSuper,
    organizations: u.organizations,
  });

  if (u.status === 'loading' || u.isLoading) {
    return <PageSkeleton />;
  }

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={Users}
        eyebrow={t('admin.userManagement')}
        title={t('admin.userManagement')}
        description={t('admin.userDesc')}
        tier={isSuper ? 'superadmin' : 'admin'}
        actions={
          <>
            {u.adminOrg && (
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{t('organizations.inviteMembers')}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => u.fetchUsers()}
              className="teacher-pill-btn min-h-[44px] px-4 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${u.isFetching ? 'animate-spin' : ''}`} />
              <span>{t('analytics.refresh')}</span>
            </button>
          </>
        }
      />

      <UsersStats stats={u.stats} isLoading={u.isLoading} />

      <FilterPanel>
        <DashboardListFilters
          searchQuery={u.searchQuery}
          onSearchChange={(val) => u.setSearchQuery(val)}
          onClear={u.resetFilters}
          searchPlaceholder={t('admin.searchUsers')}
          chipGroups={filterChips}
          headerAside={
            u.isFetching ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--teacher-primary)] shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.loading')}</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--color-muted-foreground)] shrink-0 tabular-nums">
                {u.pagination.total.toLocaleString()} {t('adminUsers.totalUsers').toLowerCase()}
              </span>
            )
          }
        />
      </FilterPanel>

      {u.users.length === 0 && !u.isFetching ? (
        <EmptyState
          title={t('adminUsers.noUsersFound')}
          description={t('adminUsers.noUsersFoundDesc')}
          action={
            <Button onClick={u.resetFilters} variant="secondary">
              {t('common.reset')}
            </Button>
          }
        />
      ) : (
        <div
          className={`transition-opacity duration-150 ${
            u.isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'
          }`}
        >
          <UsersTable
            users={u.users}
            organizations={u.organizations}
            handleOpenUserDetail={(usr) => {
              u.setSelectedUser(usr);
              u.setShowUserDetail(true);
            }}
            handleDeleteClick={(id) => {
              u.setDeleteId(id);
              u.setShowDeleteDialog(true);
            }}
          />

          <UsersMobileList
            users={u.users}
            organizations={u.organizations}
            handleOpenUserDetail={(usr) => {
              u.setSelectedUser(usr);
              u.setShowUserDetail(true);
            }}
          />
        </div>
      )}

      <UsersPaginationBar
        page={u.page}
        pageSize={u.pageSize}
        total={u.pagination.total}
        totalPages={u.pagination.totalPages}
        isFetching={u.isFetching}
        onPageChange={u.setPage}
        onPageSizeChange={(size) => {
          u.setPageSize(size);
          u.setPage(1);
        }}
      />

      {u.showUserDetail && u.selectedUser && (
        <UserDetailModal
          selectedUser={u.selectedUser}
          session={u.session}
          organizations={u.organizations}
          organizationPolicy={u.organizationPolicy}
          handleCloseUserDetail={() => {
            u.setSelectedUser(null);
            u.setShowUserDetail(false);
          }}
          handleRoleChange={u.handleRoleChange}
          handleSaveOrgAssign={u.handleSaveOrgAssign}
          handleToggleVideoUpload={u.handleToggleVideoUpload}
          handleTogglePublicCoursePermission={u.handleTogglePublicCoursePermission}
          handleToggleContestPermission={u.handleToggleContestPermission}
          handleToggleAiQuizGenPermission={u.handleToggleAiQuizGenPermission}
          handleSaveLimits={u.handleSaveLimits}
          handleToggleSuspend={u.handleToggleSuspend}
          handleDeleteClick={(id) => {
            u.setDeleteId(id);
            u.setShowDeleteDialog(true);
          }}
        />
      )}

      <ConfirmModal
        isOpen={u.showDeleteDialog}
        title={t('adminUsers.deleteUser')}
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText={t('admin.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => u.deleteId && u.handleDelete(u.deleteId)}
        onCancel={() => {
          u.setDeleteId(null);
          u.setShowDeleteDialog(false);
        }}
        type="danger"
      />

      {u.adminOrg && (
        <OrganizationInviteShareModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationName={u.adminOrg.name}
          inviteCode={u.adminOrg.inviteCode}
          logo={u.adminOrg.logo}
        />
      )}
    </PageWrapper>
  );
}

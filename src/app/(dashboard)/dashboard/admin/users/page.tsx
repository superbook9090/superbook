// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { isSuperAdmin } from '@/lib/roles';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { UsersStats } from './_components/UsersStats';
import { UsersTable } from './_components/UsersTable';
import { UsersMobileList } from './_components/UsersMobileList';
import { UserDetailModal } from './_components/UserDetailModal';
import { useAdminUsers } from './_hooks/useAdminUsers';
import { useUsersFilterChips } from './_hooks/useUsersFilterChips';
import { PageWrapper, EmptyState } from '@/components/layout';
import { OrganizationInviteShareModal } from '@/components/organization/OrganizationInviteShareModal';

export default function AdminUsersPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    session,
    status,
    users,
    stats,
    isLoading,
    isFetching,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    platformFilter,
    setPlatformFilter,
    activityFilter,
    setActivityFilter,
    statusFilter,
    setStatusFilter,
    orgFilter,
    setOrgFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
    deleteId,
    setDeleteId,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedUser,
    setSelectedUser,
    showUserDetail,
    setShowUserDetail,
    organizations,
    adminOrg,
    pagination,
    fetchUsers,
    handleRoleChange,
    handleToggleVideoUpload,
    handleTogglePublicCoursePermission,
    handleToggleContestPermission,
    handleToggleAiQuizGenPermission,
    handleSaveLimits,
    handleSaveOrgAssign,
    handleToggleSuspend,
    handleDelete,
  } = useAdminUsers();

  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (!isSuperAdmin(session.user?.role) && session.user?.role !== 'admin') {
      router.push(ROUTES.dashboard);
    }
  }, [session, status, router]);

  const isSuper = isSuperAdmin(session?.user?.role);
  const filterChips = useUsersFilterChips({
    roleFilter,
    setRoleFilter,
    platformFilter,
    setPlatformFilter,
    activityFilter,
    setActivityFilter,
    statusFilter,
    setStatusFilter,
    orgFilter,
    setOrgFilter,
    setPage,
    isSuper,
    organizations,
  });

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  const rangeStart = pagination.total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, pagination.total);

  return (
    <PageWrapper>
      {/* Hero Banner Header */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-3xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20 shadow-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{t('admin.userManagement')}</span>
          </div>
          <h1 className="heading-xl">{t('admin.userManagement')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('admin.userDesc')}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {adminOrg && (
            <Button
              onClick={() => setShowInviteModal(true)}
              variant="primary"
              size="sm"
              className="flex items-center gap-2 min-h-[44px] px-4 shadow-sm"
            >
              <Share2 className="w-4 h-4" />
              <span>{t('organizations.inviteMembers')}</span>
            </Button>
          )}

          <Button
            onClick={() => fetchUsers()}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2 min-h-[44px] px-4 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('analytics.refresh')}</span>
          </Button>
        </div>
      </div>

      <UsersStats stats={stats} isLoading={isLoading} />

      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => setSearchQuery(val)}
          onClear={resetFilters}
          searchPlaceholder={t('admin.searchUsers')}
          chipGroups={filterChips}
          headerAside={
            isFetching ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] shrink-0">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t('common.loading')}</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-[var(--color-muted-foreground)] shrink-0 tabular-nums">
                {pagination.total.toLocaleString()} {t('adminUsers.totalUsers').toLowerCase()}
              </span>
            )
          }
        />
      </FilterPanel>

      {users.length === 0 && !isFetching ? (
        <EmptyState
          title={t('adminUsers.noUsersFound')}
          description={t('adminUsers.noUsersFoundDesc')}
          action={
            <Button onClick={resetFilters} variant="secondary">
              {t('common.reset')}
            </Button>
          }
        />
      ) : (
        <div className={`transition-opacity duration-150 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
          <UsersTable
            users={users}
            organizations={organizations}
            handleOpenUserDetail={(u) => { setSelectedUser(u); setShowUserDetail(true); }}
            handleDeleteClick={(id) => { setDeleteId(id); setShowDeleteDialog(true); }}
          />

          <UsersMobileList
            users={users}
            organizations={organizations}
            handleOpenUserDetail={(u) => { setSelectedUser(u); setShowUserDetail(true); }}
          />
        </div>
      )}

      {pagination.total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-2 antigravity-glass border border-[var(--border)] rounded-2xl px-5 py-3 shadow-md"
        >
          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
            <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)] tabular-nums">
              {t('admin.showing')
                .replace('{current}', `${rangeStart}–${rangeEnd}`)
                .replace('{total}', pagination.total.toLocaleString())}
            </p>
            <div className="flex items-center gap-1 text-xs">
              {[20, 50, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => { setPageSize(size); setPage(1); }}
                  className={`px-2 py-1 rounded-lg font-bold border transition-colors cursor-pointer ${
                    pageSize === size
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] border-[var(--border)] hover:text-[var(--color-foreground)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <Button
                onClick={() => setPage(1)}
                disabled={page === 1 || isFetching}
                aria-label="First page"
                variant="secondary"
                size="sm"
                className="p-2 rounded-xl"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Tooltip label={t('common.previous')}>
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  aria-label={t('common.previous')}
                  variant="secondary"
                  size="sm"
                  className="p-2 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Tooltip>
              <span className="px-3 text-xs sm:text-sm font-bold text-[var(--color-foreground)] tabular-nums">
                {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
              </span>
              <Tooltip label={t('common.next')}>
                <Button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages || isFetching}
                  aria-label={t('common.next')}
                  variant="secondary"
                  size="sm"
                  className="p-2 rounded-xl"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Tooltip>
              <Button
                onClick={() => setPage(pagination.totalPages)}
                disabled={page === pagination.totalPages || isFetching}
                aria-label="Last page"
                variant="secondary"
                size="sm"
                className="p-2 rounded-xl"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </motion.div>
      )}

      {showUserDetail && selectedUser && (
        <UserDetailModal
          selectedUser={selectedUser}
          session={session}
          organizations={organizations}
          handleCloseUserDetail={() => { setSelectedUser(null); setShowUserDetail(false); }}
          handleRoleChange={handleRoleChange}
          handleSaveOrgAssign={handleSaveOrgAssign}
          handleToggleVideoUpload={handleToggleVideoUpload}
          handleTogglePublicCoursePermission={handleTogglePublicCoursePermission}
          handleToggleContestPermission={handleToggleContestPermission}
          handleToggleAiQuizGenPermission={handleToggleAiQuizGenPermission}
          handleSaveLimits={handleSaveLimits}
          handleToggleSuspend={handleToggleSuspend}
          handleDeleteClick={(id) => { setDeleteId(id); setShowDeleteDialog(true); }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteDialog}
        title={t('adminUsers.deleteUser')}
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText={t('admin.delete')}
        cancelText={t('common.cancel')}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => { setDeleteId(null); setShowDeleteDialog(false); }}
        type="danger"
      />

      {adminOrg && (
        <OrganizationInviteShareModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationName={adminOrg.name}
          inviteCode={adminOrg.inviteCode}
          logo={adminOrg.logo}
        />
      )}
    </PageWrapper>
  );
}

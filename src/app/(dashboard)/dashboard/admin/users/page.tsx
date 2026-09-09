// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Users, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
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

export default function AdminUsersPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const {
    session,
    status,
    users,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    platformFilter,
    setPlatformFilter,
    activityFilter,
    setActivityFilter,
    orgFilter,
    setOrgFilter,
    page,
    setPage,
    deleteId,
    setDeleteId,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedUser,
    setSelectedUser,
    showUserDetail,
    setShowUserDetail,
    organizations,
    pagination,
    fetchUsers,
    handleRoleChange,
    handleToggleVideoUpload,
    handleTogglePublicCoursePermission,
    handleToggleContestPermission,
    handleSaveLimits,
    handleSaveOrgAssign,
    handleToggleSuspend,
    handleDelete,
  } = useAdminUsers();

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
    orgFilter,
    setOrgFilter,
    setPage,
    isSuper,
    organizations,
  });

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setPlatformFilter('all');
    setActivityFilter('all');
    setOrgFilter('all');
    setPage(1);
  };

  return (
    <PageWrapper className="space-y-6">
      {/* Hero Banner Header */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20 shadow-xs">
            <Users className="w-3.5 h-3.5" />
            <span>{t('admin.userManagement')}</span>
          </div>
          <h1 className="heading-xl">{t('admin.userManagement')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">{t('admin.userDesc')}</p>
        </div>

        <Button
          onClick={() => fetchUsers()}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2 self-start sm:self-auto min-h-[44px] px-4 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t('analytics.refresh') || 'Refresh'}</span>
        </Button>
      </div>

      <UsersStats stats={stats} isLoading={isLoading} />

      <FilterPanel>
        <DashboardListFilters
          searchQuery={searchQuery}
          onSearchChange={(val) => { setSearchQuery(val); setPage(1); }}
          onClear={handleResetFilters}
          searchPlaceholder={t('admin.searchUsers')}
          chipGroups={filterChips}
        />
      </FilterPanel>

      {users.length === 0 ? (
        <EmptyState
          title={t('adminUsers.noUsersFound') || 'No users found'}
          description={t('adminUsers.noUsersFoundDesc') || 'Try adjusting your search criteria or role filters.'}
          action={
            <Button onClick={handleResetFilters} variant="secondary">
              {t('common.reset') || 'Reset Filters'}
            </Button>
          }
        />
      ) : (
        <>
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
        </>
      )}

      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center antigravity-glass border border-[var(--border)] rounded-2xl px-5 py-3 shadow-md"
        >
          <p className="text-xs sm:text-sm font-medium text-[var(--color-muted-foreground)]">
            {t('admin.showing').replace('{current}', String(users.length)).replace('{total}', String(pagination.total))}
          </p>
          <div className="flex items-center gap-2">
            <Tooltip label={t('common.previous')}>
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label={t('common.previous')}
                variant="secondary"
                size="sm"
                className="p-2 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Tooltip>
            <span className="px-3 text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
              {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <Tooltip label={t('common.next')}>
              <Button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                aria-label={t('common.next')}
                variant="secondary"
                size="sm"
                className="p-2 rounded-xl"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
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
          handleSaveLimits={handleSaveLimits}
          handleToggleSuspend={handleToggleSuspend}
          handleDeleteClick={(id) => { setDeleteId(id); setShowDeleteDialog(true); }}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteDialog}
        title={t('adminUsers.deleteUser') || 'Delete User'}
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText={t('admin.delete') || 'Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        onCancel={() => { setDeleteId(null); setShowDeleteDialog(false); }}
        type="danger"
      />
    </PageWrapper>
  );
}

// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import { Users, Shield, ChevronLeft, ChevronRight, RefreshCw, Building2, Smartphone, Activity } from 'lucide-react';
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
import { PageWrapper, PageHeader, EmptyState } from '@/components/layout';

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

  // Role guard
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

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  const isSuper = isSuperAdmin(session?.user?.role);
  const filterChips = [
    {
      label: t('admin.role'),
      icon: <Shield className="w-3.5 h-3.5" aria-hidden />,
      value: roleFilter,
      onChange: (val: string) => { setRoleFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('admin.allRoles') || 'All Roles' },
        { id: 'student', label: t('roles.student') || 'Students' },
        { id: 'teacher', label: t('roles.teacher') || 'Teachers' },
        { id: 'admin', label: t('roles.admin') || 'Admins' },
      ],
    },
    {
      label: t('adminAnalytics.platform') || 'Platform',
      icon: <Smartphone className="w-3.5 h-3.5" aria-hidden />,
      value: platformFilter,
      onChange: (val: string) => { setPlatformFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('adminAnalytics.allPlatforms') || 'All Platforms' },
        { id: 'app', label: t('adminAnalytics.platformApp') || 'Mobile App' },
        { id: 'web', label: t('adminAnalytics.platformWeb') || 'Website' },
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' },
      ],
    },
    {
      label: t('adminAnalytics.activity') || 'Activity',
      icon: <Activity className="w-3.5 h-3.5" aria-hidden />,
      value: activityFilter,
      onChange: (val: string) => { setActivityFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('adminAnalytics.allActivity') || 'All Activity' },
        { id: 'today', label: t('adminAnalytics.activeToday') || 'Active Today' },
        { id: 'week', label: t('adminAnalytics.activeThisWeek') || 'Active 7 Days' },
        { id: 'month', label: t('adminAnalytics.activeThisMonth') || 'Active 30 Days' },
        { id: 'inactive', label: t('adminAnalytics.inactiveUsers') || 'Inactive (>30d)' },
      ],
    },
    ...(isSuper && organizations.length > 0
      ? [{
          label: t('adminUsers.organization') || 'Organization',
          icon: <Building2 className="w-3.5 h-3.5" aria-hidden />,
          value: orgFilter,
          onChange: (val: string) => { setOrgFilter(val); setPage(1); },
          neutralValue: 'all',
          options: [
            { id: 'all', label: t('adminUsers.allOrganizations') || 'All Organizations' },
            { id: 'none', label: t('adminUsers.noOrganization') || 'Public (No Org)' },
            ...organizations.map((org) => ({ id: org._id, label: org.name })),
          ],
        }]
      : []),
  ];

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setPlatformFilter('all');
    setActivityFilter('all');
    setOrgFilter('all');
    setPage(1);
  };

  return (
    <PageWrapper>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--info-light)] rounded-xl text-[var(--info)] shrink-0 inline-flex shadow-xs">
              <Users className="w-6 h-6" />
            </span>
            <span>{t('admin.userManagement')}</span>
          </span>
        }
        description={t('admin.userDesc')}
        actions={
          <Button
            onClick={() => fetchUsers()}
            variant="secondary"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t('analytics.refresh') || 'Refresh'}</span>
          </Button>
        }
      />

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
          className="flex justify-between items-center bg-[var(--card-solid)] border border-[var(--border)] rounded-xl px-4 py-2.5 shadow-xs"
        >
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
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
                className="p-2 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Tooltip>
            <span className="px-2 text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">
              {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <Tooltip label={t('common.next')}>
              <Button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                aria-label={t('common.next')}
                variant="secondary"
                size="sm"
                className="p-2 rounded-lg"
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

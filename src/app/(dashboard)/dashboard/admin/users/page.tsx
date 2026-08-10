// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { motion } from 'framer-motion';
import {
  Users,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Tooltip from '@/components/ui/Tooltip';
import { useAlert } from '@/components/ui/AlertContainer';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import {
  listAdminUsers,
  patchAdminUser,
  deleteAdminUser,
  patchAdminUserOrganization,
} from '@/lib/api/adminUsers';
import { listOrganizations } from '@/lib/api/organizations';
import { ApiClientError } from '@/lib/api/http';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { UsersTable } from './_components/UsersTable';
import { UsersMobileList } from './_components/UsersMobileList';
import { UserDetailModal } from './_components/UserDetailModal';
import { LimitsModal } from './_components/LimitsModal';
import { OrganizationAssignModal } from './_components/OrganizationAssignModal';
import type { User } from './_components/types';

export default function AdminUsersPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);

  // Frontend role guard (secondary security layer)
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    if (!isSuperAdmin(session.user?.role) && session.user?.role !== 'admin') {
      router.push(ROUTES.dashboard);
      return;
    }
  }, [session, status, router]);
  const [isLoading, setIsLoading] = useState(true);
  const { addAlert } = useAlert();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [roleFilter, setRoleFilter] = useState('all');

  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [limitsUserId, setLimitsUserId] = useState<string | null>(null);
  const [limitsForm, setLimitsForm] = useState({ courses: '', quizzes: '', blogs: '' });
  const [organizations, setOrganizations] = useState<Array<{ _id: string; name: string }>>([]);
  const [orgAssignUserId, setOrgAssignUserId] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  const clearFilters = () => {
    setSearchQuery('');
    setRoleFilter('all');
    setPage(1);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const data = await listAdminUsers({
        search: debouncedSearch || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        page,
      });
      setUsers((data.users || []) as User[]);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.errorLoadingUsers'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter, page, t, addAlert]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const data = await listOrganizations();
      setOrganizations((data.organizations || []) as Array<{ _id: string; name: string }>);
    } catch {
      // Organizations fetch failed, handled silently
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    // Auth and role-based redirects handled by middleware and /dashboard/page.tsx

    fetchUsers();
    fetchOrganizations();
  }, [session, status, fetchUsers, fetchOrganizations, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await patchAdminUser({ userId, updates: { role: newRole } });
      setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      addAlert({ type: 'success', message: t('adminUsers.userRoleUpdatedSuccess') });
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleToggleVideoUpload = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { canUploadVideos: newVal } });
      setUsers(users.map((u) => (u._id === userId ? { ...u, canUploadVideos: newVal } : u)));
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, canUploadVideos: newVal });
      }
      addAlert({ type: 'success', message: t('adminUsers.videoPermissionUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminUsers.errorUpdatingVideoPermission'),
      });
    }
  };

  const handleTogglePublicCoursePermission = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { canCreatePublicCourses: newVal } });
      setUsers(users.map((u) => (u._id === userId ? { ...u, canCreatePublicCourses: newVal } : u)));
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser({ ...selectedUser, canCreatePublicCourses: newVal });
      }
      addAlert({ type: 'success', message: t('adminUsers.publicCoursePermissionUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await deleteAdminUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
      addAlert({ type: 'success', message: t('adminUsers.userDeletedSuccess') });
      setDeleteId(null);
      setShowDeleteDialog(false);
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.errorDeletingUser'),
      });
    }
  };

  const handleDeleteClick = (userId: string) => {
    setDeleteId(userId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      handleDelete(deleteId);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteId(null);
    setShowDeleteDialog(false);
  };

  const handleOpenUserDetail = (user: User) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleCloseUserDetail = () => {
    setSelectedUser(null);
    setShowUserDetail(false);
  };


  const handleCloseLimits = () => {
    setLimitsUserId(null);
    setLimitsForm({ courses: '', quizzes: '', blogs: '' });
  };

  const handleSaveLimits = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: any = {};
      if (limitsForm.courses) updates.limits = { ...updates.limits, courses: parseInt(limitsForm.courses) };
      if (limitsForm.quizzes) updates.limits = { ...updates.limits, quizzes: parseInt(limitsForm.quizzes) };
      if (limitsForm.blogs) updates.limits = { ...updates.limits, blogs: parseInt(limitsForm.blogs) };

      await patchAdminUser({ userId: limitsUserId, updates });

      setUsers(
        users.map((u) => (u._id === limitsUserId ? { ...u, limits: updates.limits } : u))
      );
      addAlert({ type: 'success', message: t('adminUsers.userLimitsUpdated') });
      handleCloseLimits();
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminUsers.failedUpdateLimits'),
      });
    }
  };


  const handleCloseOrgAssign = () => {
    setOrgAssignUserId(null);
    setSelectedOrganizationId(null);
  };

  const handleSaveOrgAssign = async () => {
    if (!orgAssignUserId) return;
    try {
      const data = (await patchAdminUserOrganization(orgAssignUserId, {
        organizationId: selectedOrganizationId,
      })) as Partial<User>;

      setUsers(users.map((u) => (u._id === orgAssignUserId ? { ...u, ...data } : u)));
      addAlert({ type: 'success', message: t('adminUsers.userOrganizationUpdated') });
      handleCloseOrgAssign();
    } catch (err) {
      addAlert({
        type: 'error',
        message:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.errorUpdatingOrganization'),
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="stack-page overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-[var(--info-light)] rounded-xl">
          <Users className="w-6 h-6 text-[var(--info)]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('admin.userManagement')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.userDesc')}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterPanel>
          <DashboardListFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearFilters}
            searchPlaceholder={t('admin.searchUsers')}
            chipGroups={[
              {
                label: t('admin.role'),
                icon: <Shield className="w-3.5 h-3.5" aria-hidden />,
                value: roleFilter,
                onChange: setRoleFilter,
                neutralValue: 'all',
                options: [
                  { id: 'all', label: t('admin.allRoles') },
                  { id: 'student', label: t('roles.student') },
                  { id: 'teacher', label: t('roles.teacher') },
                  { id: 'admin', label: t('roles.admin') },
                ],
              },
            ]}
          />
        </FilterPanel>
      </motion.div>

      {/* Users Table - Desktop */}
      <UsersTable
        users={users}
        organizations={organizations}
        handleOpenUserDetail={handleOpenUserDetail}
      />

      {/* Users Cards - Mobile */}
      <UsersMobileList
        users={users}
        organizations={organizations}
        handleOpenUserDetail={handleOpenUserDetail}
      />

      {/* Limits Modal */}
      {limitsUserId && (
        <LimitsModal
          limitsForm={limitsForm}
          setLimitsForm={setLimitsForm}
          handleSaveLimits={handleSaveLimits}
          handleCloseLimits={handleCloseLimits}
        />
      )}

      {/* Organization Assignment Modal */}
      {orgAssignUserId && (
        <OrganizationAssignModal
          selectedOrganizationId={selectedOrganizationId}
          setSelectedOrganizationId={setSelectedOrganizationId}
          organizations={organizations}
          handleSaveOrgAssign={handleSaveOrgAssign}
          handleCloseOrgAssign={handleCloseOrgAssign}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center"
        >
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {t('admin.showing').replace('{current}', String(users.length)).replace('{total}', String(pagination.total))}
          </p>
          <div className="flex items-center gap-2">
            <Tooltip label={t('common.previous')}>
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                aria-label={t('common.previous')}
                variant="secondary"
                className="p-2 rounded-lg animate-none"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Tooltip>
            <span className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
              {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <Tooltip label={t('common.next')}>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page === pagination.totalPages}
                aria-label={t('common.next')}
                variant="secondary"
                className="p-2 rounded-lg animate-none"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Tooltip>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteDialog}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        type="danger"
      />

      {/* User Detail Modal */}
      {showUserDetail && selectedUser && (
        <UserDetailModal
          selectedUser={selectedUser}
          session={session}
          organizations={organizations}
          handleCloseUserDetail={handleCloseUserDetail}
          handleRoleChange={handleRoleChange}
          setOrgAssignUserId={setOrgAssignUserId}
          setSelectedOrganizationId={setSelectedOrganizationId}
          handleSaveOrgAssign={handleSaveOrgAssign}
          handleToggleVideoUpload={handleToggleVideoUpload}
          handleTogglePublicCoursePermission={handleTogglePublicCoursePermission}
          limitsUserId={limitsUserId}
          setLimitsUserId={setLimitsUserId}
          limitsForm={limitsForm}
          setLimitsForm={setLimitsForm}
          handleSaveLimits={handleSaveLimits}
          handleDeleteClick={handleDeleteClick}
        />
      )}
    </div>
  );
}

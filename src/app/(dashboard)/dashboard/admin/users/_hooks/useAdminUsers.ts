// src/app/(dashboard)/dashboard/admin/users/_hooks/useAdminUsers.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import {
  listAdminUsers,
  patchAdminUser,
  deleteAdminUser,
  patchAdminUserOrganization,
} from '@/lib/api/adminUsers';
import { listOrganizations } from '@/lib/api/organizations';
import { ApiClientError } from '@/lib/api/http';
import type { User, UserStats } from '../_components/types';

export function useAdminUsers() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [roleFilter, setRoleFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{ _id: string; name: string }>>([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchUsers = useCallback(async () => {
    try {
      const data = await listAdminUsers({
        search: debouncedSearch || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter,
        platform: platformFilter === 'all' ? undefined : platformFilter,
        activity: activityFilter === 'all' ? undefined : activityFilter,
        organizationId: orgFilter === 'all' ? undefined : orgFilter,
        page,
      });
      setUsers((data.users || []) as User[]);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
      if (data.stats) setStats(data.stats);
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorLoadingUsers'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter, platformFilter, activityFilter, orgFilter, page, t, addAlert]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const data = await listOrganizations();
      setOrganizations((data.organizations || []) as Array<{ _id: string; name: string }>);
    } catch {
      // Handled silently
    }
  }, []);

  useEffect(() => {
    if (status === 'loading' || !session) return;
    fetchUsers();
    fetchOrganizations();
  }, [session, status, fetchUsers, fetchOrganizations]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await patchAdminUser({ userId, updates: { role: newRole } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      addAlert({ type: 'success', message: t('adminUsers.userRoleUpdatedSuccess') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleToggleVideoUpload = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { canUploadVideos: newVal } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, canUploadVideos: newVal } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, canUploadVideos: newVal } : null));
      addAlert({ type: 'success', message: t('adminUsers.videoPermissionUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminUsers.errorUpdatingVideoPermission'),
      });
    }
  };

  const handleTogglePublicCoursePermission = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { canCreatePublicCourses: newVal } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, canCreatePublicCourses: newVal } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, canCreatePublicCourses: newVal } : null));
      addAlert({ type: 'success', message: t('adminUsers.publicCoursePermissionUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleToggleContestPermission = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { canCreateContests: newVal } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, canCreateContests: newVal } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, canCreateContests: newVal } : null));
      addAlert({ type: 'success', message: t('adminUsers.contestPermissionUpdated') || 'Contest permission updated' });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleSaveLimits = async (
    userId: string,
    limits: { courses?: number; quizzes?: number; blogs?: number; aiQuizGenerations?: number }
  ) => {
    try {
      await patchAdminUser({ userId, updates: { limits } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, limits } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, limits } : null));
      addAlert({ type: 'success', message: t('adminUsers.userLimitsUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminUsers.failedUpdateLimits'),
      });
    }
  };

  const handleSaveOrgAssign = async (userId: string, orgId: string | null) => {
    try {
      const data = (await patchAdminUserOrganization(userId, { organizationId: orgId })) as Partial<User>;
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, ...data } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, ...data } : null));
      addAlert({ type: 'success', message: t('adminUsers.orgAssignedSuccess') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminUsers.failedAssignOrg'),
      });
    }
  };

  const handleToggleSuspend = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { isSuspended: newVal } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isSuspended: newVal } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, isSuspended: newVal } : null));
      addAlert({
        type: 'success',
        message: newVal ? t('adminUsers.userSuspended') : t('adminUsers.userUnsuspended'),
      });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleDelete = async (overrideId?: string) => {
    const targetId = overrideId || deleteId;
    if (!targetId) return;
    try {
      await deleteAdminUser(targetId);
      setUsers((prev) => prev.filter((u) => u._id !== targetId));
      setShowDeleteDialog(false);
      setDeleteId(null);
      addAlert({ type: 'success', message: t('adminUsers.userDeletedSuccess') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorDeletingUser'),
      });
    }
  };

  return {
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
  };
}

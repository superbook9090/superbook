// src/app/(dashboard)/dashboard/admin/users/_hooks/useAdminUsers.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import {
  listAdminUsers,
  patchAdminUser,
  deleteAdminUser,
  patchAdminUserOrganization,
} from '@/lib/api/adminUsers';
import { listOrganizations } from '@/lib/api/organizations';
import { fetchAccountInfo } from '@/lib/api/auth';
import { ApiClientError } from '@/lib/api/http';
import type { User, UserStats } from '../_components/types';

export function useAdminUsers() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [activityFilter, setActivityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [organizations, setOrganizations] = useState<Array<{ _id: string; name: string }>>([]);
  const [adminOrg, setAdminOrg] = useState<{
    name: string;
    inviteCode: string;
    logo?: string | null;
  } | null>(null);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const isFirstSearchMountRef = useRef(true);
  const errorMessageRef = useRef(t('adminSettings.errorLoadingUsers'));
  errorMessageRef.current = t('adminSettings.errorLoadingUsers');

  // Batch debounced search + page reset in a single tick to prevent double fetches when searching from page > 1
  useEffect(() => {
    if (isFirstSearchMountRef.current) {
      isFirstSearchMountRef.current = false;
      return;
    }
    const trimmed = searchQuery.trim();
    const timer = setTimeout(() => {
      setDebouncedSearch(trimmed);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    if (session?.user?.organizationId) {
      fetchAccountInfo()
        .then((info) => {
          if (!cancelled && info.organization) {
            setAdminOrg({
              name: info.organization.name,
              inviteCode: info.organization.inviteCode,
              logo: info.organization.logo,
            });
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [session?.user?.organizationId]);

  const fetchUsers = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsFetching(true);
    try {
      const data = await listAdminUsers(
        {
          search: debouncedSearch || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
          platform: platformFilter === 'all' ? undefined : platformFilter,
          activity: activityFilter === 'all' ? undefined : activityFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          organizationId: orgFilter === 'all' ? undefined : orgFilter,
          page,
          limit: pageSize,
        },
        { signal: controller.signal }
      );
      if (currentRequestId !== requestIdRef.current) return;
      setUsers((data.users || []) as User[]);
      setPagination(data.pagination || { total: 0, totalPages: 1 });
      if (data.stats) setStats(data.stats);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      if (currentRequestId !== requestIdRef.current) return;
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : errorMessageRef.current,
      });
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [debouncedSearch, roleFilter, platformFilter, activityFilter, statusFilter, orgFilter, page, pageSize, addAlert]);

  const sessionUserId = session?.user?.id;

  // Fetch organizations only once per authenticated session
  useEffect(() => {
    if (status === 'loading' || !sessionUserId) return;
    let cancelled = false;
    listOrganizations()
      .then((data) => {
        if (!cancelled) {
          setOrganizations((data.organizations || []) as Array<{ _id: string; name: string }>);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [sessionUserId, status]);

  // Fetch users whenever query/filter/pagination changes, aborting stale requests
  useEffect(() => {
    if (status === 'loading' || !sessionUserId) return;
    void fetchUsers();
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [sessionUserId, status, fetchUsers]);

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
      addAlert({ type: 'success', message: t('adminUsers.contestPermissionUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleToggleAiQuizGenPermission = async (userId: string, currentVal: boolean) => {
    try {
      const newVal = !currentVal;
      await patchAdminUser({ userId, updates: { canGenerateAiQuizzes: newVal } });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, canGenerateAiQuizzes: newVal } : u)));
      if (selectedUser?._id === userId) setSelectedUser((prev) => (prev ? { ...prev, canGenerateAiQuizzes: newVal } : null));
      addAlert({ type: 'success', message: t('adminUsers.aiQuizPermissionUpdated') });
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorUpdatingUser'),
      });
    }
  };

  const handleSaveLimits = async (
    userId: string,
    limits: { courses?: number; quizzes?: number; blogs?: number; aiQuizGenerations?: number; aiQuizMaxQuestions?: number }
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
      setShowDeleteDialog(false);
      setDeleteId(null);
      addAlert({ type: 'success', message: t('adminUsers.userDeletedSuccess') });
      void fetchUsers();
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.errorDeletingUser'),
      });
    }
  };

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedSearch('');
    setRoleFilter('all');
    setPlatformFilter('all');
    setActivityFilter('all');
    setStatusFilter('all');
    setOrgFilter('all');
    setPage(1);
  }, []);

  return {
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
  };
}

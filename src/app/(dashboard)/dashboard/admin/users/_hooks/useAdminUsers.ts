// src/app/(dashboard)/dashboard/admin/users/_hooks/useAdminUsers.ts
'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { isSuperAdmin } from '@/lib/roles';
import { queryKeys } from '@/lib/react-query/query-keys';
import type { OrganizationPolicy } from '@/lib/admin/orgPolicy';
import type { User, UserStats } from '../_components/types';

interface AdminUsersQueryData {
  users: User[];
  pagination: { total: number; totalPages: number };
  stats: UserStats | null;
  organizationPolicy: OrganizationPolicy | null;
}

export function useAdminUsers() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const queryClient = useQueryClient();

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

  const sessionUserId = session?.user?.id;
  const callerIsSuperAdmin = isSuperAdmin(session?.user?.role);
  const orgScope = `${session?.user?.role || 'guest'}:${session?.user?.organizationId || 'global'}`;

  // Cached account info (shared across admin users & profile views)
  const accountQuery = useQuery({
    queryKey: queryKeys.account.info(sessionUserId),
    queryFn: () => fetchAccountInfo(),
    enabled: status === 'authenticated' && Boolean(session?.user?.organizationId),
    staleTime: 5 * 60 * 1000,
  });

  const adminOrg = useMemo(() => {
    const org = accountQuery.data?.organization;
    if (!org) return null;
    const orgWithTeacherCode = org as typeof org & { teacherInviteCode?: string };
    return {
      name: org.name,
      inviteCode: org.inviteCode,
      teacherInviteCode: orgWithTeacherCode.teacherInviteCode,
      logo: org.logo,
    };
  }, [accountQuery.data]);

  // Cached organizations list (shared with /dashboard/admin/organizations)
  const orgsQuery = useQuery({
    queryKey: queryKeys.organizations.list(true),
    queryFn: async () => {
      const data = await listOrganizations({ includeInactive: true });
      return data.organizations || [];
    },
    enabled: status === 'authenticated' && Boolean(sessionUserId) && callerIsSuperAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const organizations = useMemo(
    () => (orgsQuery.data || []) as Array<{ _id: string; name: string }>,
    [orgsQuery.data]
  );

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      role: roleFilter === 'all' ? undefined : roleFilter,
      platform: platformFilter === 'all' ? undefined : platformFilter,
      activity: activityFilter === 'all' ? undefined : activityFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      organizationId: orgFilter === 'all' ? undefined : orgFilter,
      page,
      limit: pageSize,
    }),
    [debouncedSearch, roleFilter, platformFilter, activityFilter, statusFilter, orgFilter, page, pageSize]
  );

  const currentUsersQueryKey = useMemo(
    () => queryKeys.adminUsers.list(orgScope, queryParams),
    [orgScope, queryParams]
  );

  const usersQuery = useQuery<AdminUsersQueryData>({
    queryKey: currentUsersQueryKey,
    queryFn: async ({ signal }) => {
      const data = await listAdminUsers(queryParams, { signal });
      return {
        users: (data.users || []) as User[],
        pagination: data.pagination || { total: 0, totalPages: 1 },
        stats: data.stats ?? null,
        organizationPolicy: data.organizationPolicy ?? null,
      };
    },
    enabled: status === 'authenticated' && Boolean(sessionUserId),
    staleTime: 60 * 1000, // 1 minute cache per filter/page combo
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (usersQuery.error) {
      const err = usersQuery.error;
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : errorMessageRef.current,
      });
    }
  }, [usersQuery.error, addAlert]);

  const users = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data]);
  const pagination = usersQuery.data?.pagination ?? { total: 0, totalPages: 1 };
  const stats = usersQuery.data?.stats ?? null;
  const organizationPolicy = usersQuery.data?.organizationPolicy ?? null;
  const isLoading = usersQuery.isPending;
  const isFetching = usersQuery.isFetching;

  const fetchUsers = useCallback(async () => {
    await usersQuery.refetch();
  }, [usersQuery]);

  const patchCachedUser = useCallback(
    (userId: string, patch: Partial<User>) => {
      queryClient.setQueryData<AdminUsersQueryData>(currentUsersQueryKey, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          users: prev.users.map((u) => (u._id === userId ? { ...u, ...patch } : u)),
        };
      });
      setSelectedUser((prev) => (prev && prev._id === userId ? { ...prev, ...patch } : prev));
    },
    [queryClient, currentUsersQueryKey]
  );

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await patchAdminUser({ userId, updates: { role: newRole } });
      patchCachedUser(userId, { role: newRole });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
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
      patchCachedUser(userId, { canUploadVideos: newVal });
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
      patchCachedUser(userId, { canCreatePublicCourses: newVal });
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
      patchCachedUser(userId, { canCreateContests: newVal });
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
      patchCachedUser(userId, { canGenerateAiQuizzes: newVal });
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
      patchCachedUser(userId, { limits });
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
      patchCachedUser(userId, data);
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
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
      patchCachedUser(userId, { isSuspended: newVal });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
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
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
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
    organizationPolicy,
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

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { ApiClientError } from '@/lib/api/http';
import { queryKeys } from '@/lib/react-query/query-keys';
import {
  listOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  type OrganizationItem,
} from '@/lib/api/organizations';
import type {
  OrganizationsStatsData,
  OrgStatusFilter,
  OrgSortOption,
  ViewMode,
  OrganizationFormData,
} from '../_components/types';
import { buildOrganizationShareText } from '../_utils/formatOrgShareInfo';

const DEFAULT_FORM_DATA: OrganizationFormData = {
  name: '',
  description: '',
  logo: '',
  primaryColor: '',
  website: '',
  tagline: '',
  isActive: true,
  permissions: {
    canUploadVideos: false,
    canCreatePublicCourses: false,
    canCreateContests: false,
    canGenerateAiQuizzes: false,
  },
  teacherLimits: {
    courses: '',
    quizzes: '',
    blogs: '',
    aiQuizGenerations: '',
    aiQuizMaxQuestions: '',
  },
};

function toPolicyPayload(formData: OrganizationFormData) {
  const parseLimit = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return undefined;
    const parsed = parseInt(trimmed, 10);
    return Number.isFinite(parsed) && parsed >= 1 ? parsed : undefined;
  };
  return {
    name: formData.name,
    description: formData.description,
    logo: formData.logo,
    primaryColor: formData.primaryColor,
    website: formData.website,
    tagline: formData.tagline,
    isActive: formData.isActive,
    permissions: formData.permissions,
    teacherLimits: {
      courses: parseLimit(formData.teacherLimits.courses),
      quizzes: parseLimit(formData.teacherLimits.quizzes),
      blogs: parseLimit(formData.teacherLimits.blogs),
      aiQuizGenerations: parseLimit(formData.teacherLimits.aiQuizGenerations),
      aiQuizMaxQuestions: parseLimit(formData.teacherLimits.aiQuizMaxQuestions),
    },
  };
}

export function useAdminOrganizations() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { session, status } = useSessionStore();
  const { addAlert } = useAlert();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrgStatusFilter>('all');
  const [sortOption, setSortOption] = useState<OrgSortOption>('newest');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modals & Active Org
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<OrganizationItem | null>(null);
  const [deleteTargetOrg, setDeleteTargetOrg] = useState<OrganizationItem | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState<OrganizationFormData>(DEFAULT_FORM_DATA);

  // Role Guard
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }
    if (!isSuperAdmin(session.user?.role)) {
      router.push(ROUTES.dashboard);
    }
  }, [session, status, router]);

  const isSuper = isSuperAdmin(session?.user?.role);

  // Cached Organizations Query (shared with Admin Users superadmin filter)
  const orgsQuery = useQuery({
    queryKey: queryKeys.organizations.list(true),
    queryFn: async () => {
      const data = await listOrganizations({ includeInactive: true });
      return data.organizations || [];
    },
    enabled: status === 'authenticated' && isSuper,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (orgsQuery.error) {
      const err = orgsQuery.error;
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedFetchOrganizations');
      addAlert({ type: 'error', message });
    }
  }, [orgsQuery.error, addAlert, t]);

  const organizations = useMemo(() => orgsQuery.data ?? [], [orgsQuery.data]);
  const isLoading = orgsQuery.isPending || orgsQuery.isFetching;

  const fetchOrganizations = useCallback(async () => {
    await orgsQuery.refetch();
  }, [orgsQuery]);

  // Compute Stats
  const stats: OrganizationsStatsData = useMemo(() => {
    let totalUsers = 0;
    let totalContent = 0;
    let active = 0;

    for (const org of organizations) {
      if (org.isActive) active++;
      totalUsers += org.userCount || 0;
      totalContent += (org.courseCount || 0) + (org.quizCount || 0) + (org.blogCount || 0);
    }

    return {
      total: organizations.length,
      active,
      inactive: organizations.length - active,
      totalUsers,
      totalContent,
    };
  }, [organizations]);

  // Filter and Sort Organizations
  const filteredOrganizations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return organizations
      .filter((org) => {
        // Status filter
        if (statusFilter === 'active' && !org.isActive) return false;
        if (statusFilter === 'inactive' && org.isActive) return false;

        // Search query
        if (q) {
          const matchName = org.name.toLowerCase().includes(q);
          const matchCode = org.code.toLowerCase().includes(q);
          const matchInvite = org.inviteCode.toLowerCase().includes(q);
          const matchDesc = org.description?.toLowerCase().includes(q) ?? false;
          if (!matchName && !matchCode && !matchInvite && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'name') return a.name.localeCompare(b.name);
        if (sortOption === 'users') return (b.userCount || 0) - (a.userCount || 0);
        if (sortOption === 'courses') {
          const contentA = (a.courseCount || 0) + (a.quizCount || 0) + (a.blogCount || 0);
          const contentB = (b.courseCount || 0) + (b.quizCount || 0) + (b.blogCount || 0);
          return contentB - contentA;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [organizations, searchQuery, statusFilter, sortOption]);

  // Clipboard Helpers
  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(`${type}-${text}`);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  const copyOrgShareInfo = useCallback(
    async (org: OrganizationItem) => {
      try {
        const text = buildOrganizationShareText(org);
        await navigator.clipboard.writeText(text);
        setCopiedCode(`shareInfo-${org._id}`);
        addAlert({ type: 'success', message: t('organizations.shareInfoCopied') });
        setTimeout(() => setCopiedCode(null), 2000);
      } catch {
        addAlert({ type: 'error', message: t('organizations.copyShareInfoFailed') });
      }
    },
    [addAlert, t]
  );

  // Modal Openers
  const openCreateModal = () => {
    setFormData(DEFAULT_FORM_DATA);
    setShowCreateModal(true);
  };

  const openEditModal = (org: OrganizationItem) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
      logo: org.logo || '',
      primaryColor: org.primaryColor || '',
      website: org.website || '',
      tagline: org.tagline || '',
      isActive: org.isActive,
      permissions: {
        canUploadVideos: Boolean(org.permissions?.canUploadVideos),
        canCreatePublicCourses: Boolean(org.permissions?.canCreatePublicCourses),
        canCreateContests: Boolean(org.permissions?.canCreateContests),
        canGenerateAiQuizzes: Boolean(org.permissions?.canGenerateAiQuizzes),
      },
      teacherLimits: {
        courses: org.teacherLimits?.courses ? String(org.teacherLimits.courses) : '',
        quizzes: org.teacherLimits?.quizzes ? String(org.teacherLimits.quizzes) : '',
        blogs: org.teacherLimits?.blogs ? String(org.teacherLimits.blogs) : '',
        aiQuizGenerations: org.teacherLimits?.aiQuizGenerations
          ? String(org.teacherLimits.aiQuizGenerations)
          : '',
        aiQuizMaxQuestions: org.teacherLimits?.aiQuizMaxQuestions
          ? String(org.teacherLimits.aiQuizMaxQuestions)
          : '',
      },
    });
    setShowEditModal(true);
  };

  const openDetailModal = (org: OrganizationItem) => {
    setSelectedOrg(org);
    setShowDetailModal(true);
  };

  const confirmDelete = (org: OrganizationItem) => {
    setDeleteTargetOrg(org);
    setShowDeleteDialog(true);
  };

  // Create Organization Handler
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      await createOrganization(toPolicyPayload(formData));
      addAlert({ type: 'success', message: t('organizations.create') + ' ' + t('common.success') });
      setShowCreateModal(false);
      setFormData(DEFAULT_FORM_DATA);
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedCreateOrganization');
      addAlert({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Organization Handler
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg || !formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = toPolicyPayload(formData);
      await updateOrganization(selectedOrg._id, payload);
      addAlert({ type: 'success', message: t('organizations.statusUpdated') });
      setShowEditModal(false);
      if (showDetailModal) {
        setSelectedOrg((prev) => (prev ? { ...prev, ...payload } : null));
      } else {
        setSelectedOrg(null);
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedUpdateOrganization');
      addAlert({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fast Toggle Active Status
  const handleToggleActive = async (org: OrganizationItem) => {
    try {
      const newStatus = !org.isActive;
      await updateOrganization(org._id, { isActive: newStatus });
      addAlert({ type: 'success', message: t('organizations.statusUpdated') });
      queryClient.setQueryData<OrganizationItem[]>(
        queryKeys.organizations.list(true),
        (prev) => prev?.map((o) => (o._id === org._id ? { ...o, isActive: newStatus } : o))
      );
      if (selectedOrg?._id === org._id) {
        setSelectedOrg((prev) => (prev ? { ...prev, isActive: newStatus } : null));
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(org._id) });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedUpdateOrganization');
      addAlert({ type: 'error', message });
    }
  };

  // Delete Organization Handler
  const handleDelete = async () => {
    if (!deleteTargetOrg) return;

    // Frontend safety check
    if (
      deleteTargetOrg.userCount > 0 ||
      deleteTargetOrg.courseCount > 0 ||
      deleteTargetOrg.blogCount > 0 ||
      deleteTargetOrg.quizCount > 0
    ) {
      addAlert({ type: 'error', message: t('organizations.cannotDeleteWithUsers') });
      setShowDeleteDialog(false);
      setDeleteTargetOrg(null);
      return;
    }

    try {
      setIsSubmitting(true);
      await deleteOrganization(deleteTargetOrg._id);
      addAlert({ type: 'success', message: t('common.deletedSuccessfully') });
      setShowDeleteDialog(false);
      setShowDetailModal(false);
      setDeleteTargetOrg(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedDeleteOrganization');
      addAlert({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    session,
    status,
    organizations,
    filteredOrganizations,
    stats,
    isLoading,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    showDetailModal,
    setShowDetailModal,
    showDeleteDialog,
    setShowDeleteDialog,
    selectedOrg,
    deleteTargetOrg,
    copiedCode,
    formData,
    setFormData,
    fetchOrganizations,
    copyToClipboard,
    copyOrgShareInfo,
    openCreateModal,
    openEditModal,
    openDetailModal,
    confirmDelete,
    handleCreate,
    handleUpdate,
    handleToggleActive,
    handleDelete,
  };
}

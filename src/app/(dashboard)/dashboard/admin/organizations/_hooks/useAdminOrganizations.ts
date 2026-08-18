'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { ApiClientError } from '@/lib/api/http';
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

export function useAdminOrganizations() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, status } = useSessionStore();
  const { addAlert } = useAlert();

  const [organizations, setOrganizations] = useState<OrganizationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  const [formData, setFormData] = useState<OrganizationFormData>({
    name: '',
    description: '',
    isActive: true,
  });

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

  // Fetch Organizations
  const fetchOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await listOrganizations({ includeInactive: true });
      setOrganizations(data.organizations || []);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedFetchOrganizations');
      addAlert({ type: 'error', message });
    } finally {
      setIsLoading(false);
    }
  }, [t, addAlert]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

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

  // Clipboard Helper
  const copyToClipboard = useCallback((text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(`${type}-${text}`);
    setTimeout(() => setCopiedCode(null), 2000);
  }, []);

  // Modal Openers
  const openCreateModal = () => {
    setFormData({ name: '', description: '', isActive: true });
    setShowCreateModal(true);
  };

  const openEditModal = (org: OrganizationItem) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
      isActive: org.isActive,
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
      await createOrganization(formData);
      addAlert({ type: 'success', message: t('organizations.create') + ' ' + t('common.success') });
      setShowCreateModal(false);
      setFormData({ name: '', description: '', isActive: true });
      fetchOrganizations();
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
      await updateOrganization(selectedOrg._id, formData);
      addAlert({ type: 'success', message: t('organizations.statusUpdated') });
      setShowEditModal(false);
      if (showDetailModal) {
        setSelectedOrg((prev) => (prev ? { ...prev, ...formData } : null));
      } else {
        setSelectedOrg(null);
      }
      fetchOrganizations();
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
      setOrganizations((prev) =>
        prev.map((o) => (o._id === org._id ? { ...o, isActive: newStatus } : o))
      );
      if (selectedOrg?._id === org._id) {
        setSelectedOrg((prev) => (prev ? { ...prev, isActive: newStatus } : null));
      }
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
      addAlert({ type: 'success', message: t('common.deletedSuccessfully') || 'Deleted successfully' });
      setShowDeleteDialog(false);
      setShowDetailModal(false);
      setDeleteTargetOrg(null);
      fetchOrganizations();
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

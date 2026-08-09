// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { motion } from 'framer-motion';
import {
  Users,
  Trash2,
  Shield,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import Tooltip from '@/components/ui/Tooltip';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
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

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  organizationId?: string | null;
  organization?: {
    _id: string;
    name: string;
  } | null;
  limits?: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  canUploadVideos?: boolean;
  canCreatePublicCourses?: boolean;
}

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      setMessage({
        type: 'error',
        text:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.errorLoadingUsers'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, roleFilter, page, t]);

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
      setMessage({ type: 'success', text: t('adminUsers.userRoleUpdatedSuccess') });
    } catch (err) {
      setMessage({
        type: 'error',
        text:
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
      setMessage({ type: 'success', text: t('adminUsers.videoPermissionUpdated') });
    } catch (err) {
      setMessage({
        type: 'error',
        text:
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
      setMessage({ type: 'success', text: t('adminUsers.publicCoursePermissionUpdated') });
    } catch (err) {
      setMessage({
        type: 'error',
        text:
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
      setMessage({ type: 'success', text: t('adminUsers.userDeletedSuccess') });
      setDeleteId(null);
      setShowDeleteDialog(false);
    } catch (err) {
      setMessage({
        type: 'error',
        text:
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
      setMessage({ type: 'success', text: t('adminUsers.userLimitsUpdated') });
      handleCloseLimits();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
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
      setMessage({ type: 'success', text: t('adminUsers.userOrganizationUpdated') });
      handleCloseOrgAssign();
    } catch (err) {
      setMessage({
        type: 'error',
        text:
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
    <div className="space-y-6 overflow-x-hidden">
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

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
      )}

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm overflow-hidden hidden sm:block"
      >
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--color-surface-muted)]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.user')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.role')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.limits')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.joined')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
            {users.map((user, index) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
                onClick={() => handleOpenUserDetail(user)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-[var(--info-light)] text-[var(--info)] mr-3">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)] flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--color-foreground)] capitalize">{user.role}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.organizationId ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--info)]" />
                        <span className="text-sm text-[var(--color-foreground)]">
                          {organizations.find(org => org._id === user.organizationId)?.name || user.organizationId}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--color-muted-foreground)]">None</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'teacher' ? (
                    <span className="text-sm text-[var(--color-foreground)]">
                      C: {user.limits?.courses || '-'} | Q: {user.limits?.quizzes || '-'} | B: {user.limits?.blogs || '-'}
                    </span>
                  ) : (
                    <span className="text-sm text-[var(--color-muted-foreground)]">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)] flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[var(--info)] font-medium">View Details</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

      </motion.div>

      {/* Users Cards - Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="sm:hidden flex flex-col gap-4"
      >
        {users.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            className="bg-[var(--card-solid)] rounded-2xl p-4 border border-[var(--border)] cursor-pointer hover:bg-[var(--color-surface-muted)] transition-colors"
            onClick={() => handleOpenUserDetail(user)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[var(--info-light)] text-[var(--info)]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)] flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {user.email}
                  </p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 bg-[var(--info-light)] text-[var(--info)] rounded-full capitalize">{user.role}</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted-foreground)]">Organization</span>
                <div className="flex items-center gap-2">
                  {user.organizationId ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--info)]" />
                      <span className="text-sm text-[var(--color-foreground)]">
                        {organizations.find(org => org._id === user.organizationId)?.name || user.organizationId}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--color-muted-foreground)]">None</span>
                  )}
                </div>
              </div>

              {user.role === 'teacher' && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--color-muted-foreground)]">{t('adminUsers.limits')}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--color-foreground)]">
                      C: {user.limits?.courses || '-'} | Q: {user.limits?.quizzes || '-'} | B: {user.limits?.blogs || '-'}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted-foreground)]">{t('admin.joined')}</span>
                <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(user.createdAt)}
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)]">
                <span className="text-xs text-[var(--info)] font-medium">Tap for details</span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Mobile Delete Confirmation */}
      </motion.div>

      {/* Limits Modal */}
      {limitsUserId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--card-solid)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-4">{t('adminUsers.editTeacherLimits')}</h3>
            <div className="space-y-4">
              <TextField
                label={t('adminUsers.coursesLimit')}
                type="number"
                min="1"
                value={limitsForm.courses}
                onChange={(e) => setLimitsForm({ ...limitsForm, courses: e.target.value })}
                placeholder={t('adminUsers.leaveEmptyForGlobal')}
                fullWidth
              />
              <TextField
                label={t('adminUsers.quizzesLimit')}
                type="number"
                min="1"
                value={limitsForm.quizzes}
                onChange={(e) => setLimitsForm({ ...limitsForm, quizzes: e.target.value })}
                placeholder={t('adminUsers.leaveEmptyForGlobal')}
                fullWidth
              />
              <TextField
                label={t('adminUsers.blogsLimit')}
                type="number"
                min="1"
                value={limitsForm.blogs}
                onChange={(e) => setLimitsForm({ ...limitsForm, blogs: e.target.value })}
                placeholder={t('adminUsers.leaveEmptyForGlobal')}
                fullWidth
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveLimits}
                variant="primary"
                className="flex-1"
              >
                {t('adminUsers.saveLimits')}
              </Button>
              <Button
                onClick={handleCloseLimits}
                variant="secondary"
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Organization Assignment Modal */}
      {orgAssignUserId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--card-solid)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{t('adminUsers.assignOrganization')}</h3>
              <Tooltip label={t('common.close')} position="bottom">
                <button
                  onClick={handleCloseOrgAssign}
                  aria-label={t('common.close')}
                  className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </Tooltip>
            </div>
            <div className="space-y-4">
              <Dropdown
                label={t('adminUsers.selectOrganization')}
                value={selectedOrganizationId || ''}
                onChange={(val) => setSelectedOrganizationId(val || null)}
                options={[
                  { value: '', label: t('adminUsers.noOrganization') },
                  ...organizations.map((org) => ({
                    value: org._id,
                    label: org.name,
                  })),
                ]}
                placeholder=""
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleSaveOrgAssign}
                variant="primary"
                className="flex-1"
              >
                Save
              </Button>
              <Button
                onClick={handleCloseOrgAssign}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseUserDetail}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-[var(--card-solid)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[var(--info-light)] text-[var(--info)]">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)]">{selectedUser.name}</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)] flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <Tooltip label={t('common.close')} position="bottom">
                  <button
                    onClick={handleCloseUserDetail}
                    aria-label={t('common.close')}
                    className="p-2 hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                  </button>
                </Tooltip>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[var(--color-surface-muted)]/30 rounded-xl">
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Role</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)] capitalize">{selectedUser.role}</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-muted)]/30 rounded-xl">
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Joined</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-[var(--color-surface-muted)]/30 rounded-xl col-span-2">
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Organization</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">
                    {selectedUser.organizationId
                      ? organizations.find(org => org._id === selectedUser.organizationId)?.name || selectedUser.organizationId
                      : 'None'}
                  </p>
                </div>
              </div>

              {/* Operations */}
              <div className="space-y-4">
                {/* Change Role */}
                <Dropdown
                  label="Change Role"
                  value={selectedUser.role}
                  onChange={(val) => handleRoleChange(selectedUser._id, val)}
                  disabled={selectedUser._id === session?.user?.id}
                  options={[
                    { value: 'student', label: t('roles.student') },
                    { value: 'teacher', label: t('roles.teacher') },
                    { value: 'admin', label: t('roles.admin') },
                  ]}
                  placeholder=""
                />

                {/* Assign Organization */}
                <div>
                  <div className="flex gap-2 items-end">
                    <Dropdown
                      label="Assign Organization"
                      value={selectedUser.organizationId || ''}
                      onChange={(val) => {
                        setOrgAssignUserId(selectedUser._id);
                        setSelectedOrganizationId(val || null);
                      }}
                      options={[
                        { value: '', label: 'None' },
                        ...organizations.map((org) => ({ value: org._id, label: org.name })),
                      ]}
                      placeholder=""
                      containerClassName="flex-1"
                    />
                    <Button
                      onClick={() => handleSaveOrgAssign()}
                      variant="primary"
                      className="px-4 py-2.5"
                    >
                      Save
                    </Button>
                  </div>
                </div>

                {/* Video Upload Permission */}
                {selectedUser.role === 'teacher' && (
                  <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)]/30 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {t('adminUsers.videoUploadPermission') || 'Video Upload Permission'}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        {t('adminUsers.videoUploadPermissionDesc') || 'Allow teacher to upload unlisted YouTube video lectures.'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedUser.canUploadVideos || false}
                        onChange={() => handleToggleVideoUpload(selectedUser._id, selectedUser.canUploadVideos || false)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                  </div>
                )}

                {selectedUser.role === 'teacher' && (
                  <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)]/30 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-foreground)]">
                        {t('adminUsers.canCreatePublicCourses') || 'Public Course Creation'}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                        Allow teacher to create public courses (without requiring a course code).
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(selectedUser.canCreatePublicCourses)}
                        onChange={() =>
                          handleTogglePublicCoursePermission(
                            selectedUser._id,
                            Boolean(selectedUser.canCreatePublicCourses)
                          )
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                    </label>
                  </div>
                )}

                {/* Teacher Limits */}
                {selectedUser.role === 'teacher' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Teacher Limits</label>
                    <div className="grid grid-cols-3 gap-2">
                      <TextField
                        label="Courses"
                        type="number"
                        min="1"
                        value={limitsUserId === selectedUser._id ? limitsForm.courses : selectedUser.limits?.courses || ''}
                        onChange={(e) => {
                          setLimitsUserId(selectedUser._id);
                          setLimitsForm({ ...limitsForm, courses: e.target.value });
                        }}
                        placeholder="Unlimited"
                        fullWidth
                      />
                      <TextField
                        label="Quizzes"
                        type="number"
                        min="1"
                        value={limitsUserId === selectedUser._id ? limitsForm.quizzes : selectedUser.limits?.quizzes || ''}
                        onChange={(e) => {
                          setLimitsUserId(selectedUser._id);
                          setLimitsForm({ ...limitsForm, quizzes: e.target.value });
                        }}
                        placeholder="Unlimited"
                        fullWidth
                      />
                      <TextField
                        label="Blogs"
                        type="number"
                        min="1"
                        value={limitsUserId === selectedUser._id ? limitsForm.blogs : selectedUser.limits?.blogs || ''}
                        onChange={(e) => {
                          setLimitsUserId(selectedUser._id);
                          setLimitsForm({ ...limitsForm, blogs: e.target.value });
                        }}
                        placeholder="Unlimited"
                        fullWidth
                      />
                    </div>
                    {(limitsForm.courses || limitsForm.quizzes || limitsForm.blogs) && (
                      <Button
                        onClick={() => handleSaveLimits()}
                        variant="primary"
                        fullWidth
                        className="mt-2"
                      >
                        Save Limits
                      </Button>
                    )}
                  </div>
                )}

                {/* Delete User */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <Button
                    onClick={() => {
                      handleCloseUserDetail();
                      handleDeleteClick(selectedUser._id);
                    }}
                    disabled={selectedUser._id === session?.user?.id || selectedUser.role === 'superadmin'}
                    variant="danger"
                    fullWidth
                    className="flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('admin.delete')}
                  </Button>
                  {selectedUser.role === 'superadmin' && (
                    <p className="text-xs text-[var(--color-muted-foreground)] mt-2 text-center">Super admin accounts cannot be deleted</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

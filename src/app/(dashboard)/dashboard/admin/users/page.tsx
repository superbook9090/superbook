// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { debounce } from '@/lib/debounce';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Trash2,
  Shield,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';

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
}

export default function AdminUsersPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [users, setUsers] = useState<User[]>([]);

  // Frontend role guard (secondary security layer)
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (!isSuperAdmin(session.user?.role) && session.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debounce((...args: unknown[]) => setSearch(args[0] as string), 300)(value);
  };

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

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      params.append('page', page.toString());

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setPagination(data.pagination || { total: 0, totalPages: 1 });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load users' });
      }
    } catch {
      setMessage({ type: 'error', text: t('admin.errorLoadingUsers') || 'Error loading users' });
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, page, t]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch('/api/organizations');
      const data = await response.json();

      if (response.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch {
      // Organizations fetch failed, handled silently
    }
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    // Auth and role-based redirects handled by middleware and /dashboard/page.tsx

    fetchUsers();
    fetchOrganizations();
  }, [session, status, fetchUsers, fetchOrganizations, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { role: newRole } }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        setMessage({ type: 'success', text: 'User role updated successfully' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update user' });
      }
    } catch {
      setMessage({ type: 'error', text: t('admin.errorUpdatingUser') || 'Error updating user' });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
        setMessage({ type: 'success', text: 'User deleted successfully' });
        setDeleteId(null);
        setShowDeleteDialog(false);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete user' });
      }
    } catch {
      setMessage({ type: 'error', text: t('admin.errorDeletingUser') || 'Error deleting user' });
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

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: limitsUserId, updates }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map(u => u._id === limitsUserId ? { ...u, limits: updates.limits } : u));
        setMessage({ type: 'success', text: t('adminUsers.userLimitsUpdated') });
        handleCloseLimits();
      } else {
        setMessage({ type: 'error', text: data.message || t('adminUsers.failedUpdateLimits') });
      }
    } catch {
      setMessage({ type: 'error', text: t('admin.errorUpdatingLimits') || 'Error updating limits' });
    }
  };


  const handleCloseOrgAssign = () => {
    setOrgAssignUserId(null);
    setSelectedOrganizationId(null);
  };

  const handleSaveOrgAssign = async () => {
    try {
      const response = await fetch(`/api/admin/users/${orgAssignUserId}/organization`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId: selectedOrganizationId }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.map(u => u._id === orgAssignUserId ? { ...u, ...data } : u));
        setMessage({ type: 'success', text: 'User organization updated successfully' });
        handleCloseOrgAssign();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update user organization' });
      }
    } catch {
      setMessage({ type: 'error', text: t('admin.errorUpdatingOrganization') || 'Error updating user organization' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-24 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
        className="bg-[var(--card-solid)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-muted-foreground)]" />
          <input
            type="text"
            placeholder={t('admin.searchUsers')}
            defaultValue={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--color-muted-foreground)]" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
          >
            <option value="">{t('admin.allRoles')}</option>
            <option value="student">{t('roles.student')}</option>
            <option value="teacher">{t('roles.teacher')}</option>
            <option value="admin">{t('roles.admin')}</option>
          </select>
        </div>
      </motion.div>

      {/* Users Table - Desktop */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm overflow-hidden hidden sm:block"
      >
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--color-muted)]">
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
                className="hover:bg-[var(--color-muted)] transition-colors cursor-pointer"
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
            className="bg-[var(--card-solid)] rounded-2xl p-4 border border-[var(--border)] cursor-pointer hover:bg-[var(--color-muted)] transition-colors"
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
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">{t('adminUsers.coursesLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={limitsForm.courses}
                  onChange={(e) => setLimitsForm({ ...limitsForm, courses: e.target.value })}
                  placeholder={t('adminUsers.leaveEmptyForGlobal')}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">{t('adminUsers.quizzesLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={limitsForm.quizzes}
                  onChange={(e) => setLimitsForm({ ...limitsForm, quizzes: e.target.value })}
                  placeholder={t('adminUsers.leaveEmptyForGlobal')}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">{t('adminUsers.blogsLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={limitsForm.blogs}
                  onChange={(e) => setLimitsForm({ ...limitsForm, blogs: e.target.value })}
                  placeholder={t('adminUsers.leaveEmptyForGlobal')}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveLimits}
                className={`flex-1 min-h-[44px] sm:min-h-0 px-4 py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-colors text-sm font-medium`}
              >
                {t('adminUsers.saveLimits')}
              </button>
              <button
                onClick={handleCloseLimits}
                className="flex-1 min-h-[44px] sm:min-h-0 px-4 py-2.5 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--color-muted)]/80 transition-colors text-sm font-medium"
              >
                {t('common.cancel')}
              </button>
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
              <button
                onClick={handleCloseOrgAssign}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">{t('adminUsers.selectOrganization')}</label>
                <select
                  value={selectedOrganizationId || ''}
                  onChange={(e) => setSelectedOrganizationId(e.target.value || null)}
                  className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                >
                  <option value="">{t('adminUsers.noOrganization')}</option>
                  {organizations.map((org) => (
                    <option key={org._id} value={org._id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveOrgAssign}
                className={`flex-1 min-h-[44px] sm:min-h-0 px-4 py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-colors text-sm font-medium`}
              >
                Save
              </button>
              <button
                onClick={handleCloseOrgAssign}
                className="flex-1 min-h-[44px] sm:min-h-0 px-4 py-2.5 bg-[var(--color-muted)] text-[var(--color-foreground)] rounded-xl hover:bg-[var(--color-muted)]/80 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
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
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 min-h-[44px] sm:min-h-0 border border-[var(--border)] rounded-lg hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
              {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="p-2 min-h-[44px] sm:min-h-0 border border-[var(--border)] rounded-lg hover:bg-[var(--color-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
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
                <button
                  onClick={handleCloseUserDetail}
                  className="p-2 hover:bg-[var(--color-muted)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--color-muted-foreground)]" />
                </button>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[var(--color-muted)]/30 rounded-xl">
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Role</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)] capitalize">{selectedUser.role}</p>
                </div>
                <div className="p-4 bg-[var(--color-muted)]/30 rounded-xl">
                  <p className="text-xs text-[var(--color-muted-foreground)] mb-1">Joined</p>
                  <p className="text-sm font-medium text-[var(--color-foreground)]">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-[var(--color-muted)]/30 rounded-xl col-span-2">
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
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Change Role</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => handleRoleChange(selectedUser._id, e.target.value)}
                    disabled={selectedUser._id === session?.user?.id}
                    className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] disabled:bg-[var(--color-muted)] disabled:cursor-not-allowed"
                  >
                    <option value="student">{t('roles.student')}</option>
                    <option value="teacher">{t('roles.teacher')}</option>
                    <option value="admin">{t('roles.admin')}</option>
                  </select>
                </div>

                {/* Assign Organization */}
                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Assign Organization</label>
                  <div className="flex gap-2">
                    <select
                      value={selectedUser.organizationId || ''}
                      onChange={(e) => {
                        setOrgAssignUserId(selectedUser._id);
                        setSelectedOrganizationId(e.target.value || null);
                      }}
                      className="flex-1 px-4 py-2.5 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                    >
                      <option value="">None</option>
                      {organizations.map(org => (
                        <option key={org._id} value={org._id}>{org.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSaveOrgAssign()}
                      className="px-4 py-2.5 min-h-[44px] bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Teacher Limits */}
                {selectedUser.role === 'teacher' && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">Teacher Limits</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Courses</label>
                        <input
                          type="number"
                          min="1"
                          value={limitsUserId === selectedUser._id ? limitsForm.courses : selectedUser.limits?.courses || ''}
                          onChange={(e) => {
                            setLimitsUserId(selectedUser._id);
                            setLimitsForm({ ...limitsForm, courses: e.target.value });
                          }}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Quizzes</label>
                        <input
                          type="number"
                          min="1"
                          value={limitsUserId === selectedUser._id ? limitsForm.quizzes : selectedUser.limits?.quizzes || ''}
                          onChange={(e) => {
                            setLimitsUserId(selectedUser._id);
                            setLimitsForm({ ...limitsForm, quizzes: e.target.value });
                          }}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--color-muted-foreground)] mb-1">Blogs</label>
                        <input
                          type="number"
                          min="1"
                          value={limitsUserId === selectedUser._id ? limitsForm.blogs : selectedUser.limits?.blogs || ''}
                          onChange={(e) => {
                            setLimitsUserId(selectedUser._id);
                            setLimitsForm({ ...limitsForm, blogs: e.target.value });
                          }}
                          placeholder="Unlimited"
                          className="w-full px-3 py-2 min-h-[44px] bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
                        />
                      </div>
                    </div>
                    {(limitsForm.courses || limitsForm.quizzes || limitsForm.blogs) && (
                      <button
                        onClick={() => handleSaveLimits()}
                        className="mt-2 w-full px-4 py-2.5 min-h-[44px] bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-colors"
                      >
                        Save Limits
                      </button>
                    )}
                  </div>
                )}

                {/* Delete User */}
                <div className="pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => {
                      handleCloseUserDetail();
                      handleDeleteClick(selectedUser._id);
                    }}
                    disabled={selectedUser._id === session?.user?.id || selectedUser.role === 'superadmin'}
                    className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--error-light)] text-[var(--error)] rounded-xl hover:bg-[var(--error-light)]/80 transition-colors disabled:bg-[var(--color-muted)] disabled:text-[var(--color-muted-foreground)] disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('admin.delete')}
                  </button>
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

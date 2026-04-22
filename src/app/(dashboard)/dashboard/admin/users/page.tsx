// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
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
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';

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

    if (session.user?.role !== 'admin' && session.user?.role !== 'superadmin') {
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Error loading users' });
      console.error('Users error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, page]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const response = await fetch('/api/organizations');
      const data = await response.json();

      if (response.ok) {
        setOrganizations(data.organizations || []);
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating user' });
      console.error('Users error:', err);
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
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error deleting user' });
      console.error('Users error:', err);
    }
  };

  const handleOpenLimits = (user: User) => {
    setLimitsUserId(user._id);
    setLimitsForm({
      courses: user.limits?.courses?.toString() || '',
      quizzes: user.limits?.quizzes?.toString() || '',
      blogs: user.limits?.blogs?.toString() || '',
    });
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating limits' });
      console.error('Limits error:', err);
    }
  };

  const handleOpenOrgAssign = (user: User) => {
    setOrgAssignUserId(user._id);
    setSelectedOrganizationId(user.organizationId || null);
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
    } catch (err) {
      setMessage({ type: 'error', text: 'Error updating user organization' });
      console.error('Organization assignment error:', err);
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-indigo-100 rounded-xl">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('admin.userManagement')}</h1>
          <p className="text-gray-500 mt-1">{t('admin.userDesc')}</p>
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
        className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('admin.searchUsers')}
            defaultValue={search}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">{t('admin.allRoles')}</option>
            <option value="student">{t('roles.student')}</option>
            <option value="teacher">{t('roles.teacher')}</option>
            <option value="admin">{t('roles.admin')}</option>
          </select>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm overflow-hidden"
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('admin.user')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('admin.role')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('adminUsers.limits')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('admin.joined')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.tr
                key={user._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    disabled={user._id === session?.user?.id}
                    className="text-sm px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="student">{t('roles.student')}</option>
                    <option value="teacher">{t('roles.teacher')}</option>
                    <option value="admin">{t('roles.admin')}</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {user.organization ? (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-500" />
                        <span className="text-sm text-gray-700">{user.organization.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">None</span>
                    )}
                    <button
                      onClick={() => handleOpenOrgAssign(user)}
                      className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                    >
                      Assign
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'teacher' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">
                        C: {user.limits?.courses || '-'} | Q: {user.limits?.quizzes || '-'} | B: {user.limits?.blogs || '-'}
                      </span>
                      <button
                        onClick={() => handleOpenLimits(user)}
                        className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors"
                      >
                        {t('adminUsers.editLimits')}
                      </button>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setDeleteId(user._id)}
                    disabled={user._id === session?.user?.id}
                    className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {t('admin.delete')}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Delete Confirmation */}
        {deleteId && (
          <div className="p-4 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-800 mb-3">
              {t('admin.deleteConfirm')}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteId)}
                className={`px-4 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:opacity-90 transition-colors text-sm`}
              >
                {t('admin.delete')}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-white text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        )}
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
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('adminUsers.editTeacherLimits')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminUsers.coursesLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={limitsForm.courses}
                  onChange={(e) => setLimitsForm({ ...limitsForm, courses: e.target.value })}
                  placeholder={t('adminUsers.leaveEmptyForGlobal')}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminUsers.quizzesLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={limitsForm.quizzes}
                  onChange={(e) => setLimitsForm({ ...limitsForm, quizzes: e.target.value })}
                  placeholder={t('adminUsers.leaveEmptyForGlobal')}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminUsers.blogsLimit')}</label>
                <input
                  type="number"
                  min="1"
                  value={limitsForm.blogs}
                  onChange={(e) => setLimitsForm({ ...limitsForm, blogs: e.target.value })}
                  placeholder={t('adminUsers.leaveEmptyForGlobal')}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveLimits}
                className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-colors text-sm font-medium`}
              >
                {t('adminUsers.saveLimits')}
              </button>
              <button
                onClick={handleCloseLimits}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
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
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('adminUsers.assignOrganization')}</h3>
              <button
                onClick={handleCloseOrgAssign}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('adminUsers.selectOrganization')}</label>
                <select
                  value={selectedOrganizationId || ''}
                  onChange={(e) => setSelectedOrganizationId(e.target.value || null)}
                  className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                className={`flex-1 px-4 py-2.5 bg-gradient-to-r ${theme.gradient} text-white rounded-xl hover:opacity-90 transition-colors text-sm font-medium`}
              >
                Save
              </button>
              <button
                onClick={handleCloseOrgAssign}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
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
          <p className="text-sm text-gray-600">
            {t('admin.showing').replace('{current}', String(users.length)).replace('{total}', String(pagination.total))}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              {t('admin.page').replace('{current}', String(page)).replace('{total}', String(pagination.totalPages))}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

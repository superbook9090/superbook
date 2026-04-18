// src/app/(dashboard)/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Users,
  Search,
  Filter,
  Loader2,
  Trash2,
  Shield,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Alert from '@/components/ui/Alert';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [session, status, router, search, roleFilter, page]);

  const fetchUsers = async () => {
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
  };

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

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
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

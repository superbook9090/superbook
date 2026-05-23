'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Copy,
  X,
  Check,
  Users,
  BookOpen,
  FileText,
  ClipboardList,
} from 'lucide-react';
import Alert from '@/components/ui/Alert';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin } from '@/lib/roles';
import {
  listOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} from '@/lib/api/organizations';
import { ApiClientError } from '@/lib/api/http';

interface Organization {
  _id: string;
  name: string;
  code: string;
  inviteCode: string;
  description?: string;
  isActive: boolean;
  userCount: number;
  courseCount: number;
  blogCount: number;
  quizCount: number;
  createdAt: string;
}

export default function OrganizationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { session, status } = useSessionStore();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  // Frontend role guard (secondary security layer)
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/login');
      return;
    }

    if (!isSuperAdmin(session.user?.role)) {
      router.push('/dashboard');
      return;
    }
  }, [session, status, router]);

  const fetchOrganizations = useCallback(async () => {
    try {
      const data = await listOrganizations();
      setOrganizations(data.organizations as Organization[]);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedFetchOrganizations');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createOrganization(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', isActive: true });
      fetchOrganizations();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedCreateOrganization');
      setError(message);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      await updateOrganization(selectedOrg._id, formData);
      setShowEditModal(false);
      setSelectedOrg(null);
      setFormData({ name: '', description: '', isActive: true });
      fetchOrganizations();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedUpdateOrganization');
      setError(message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('organizations.deleteConfirm'))) {
      return;
    }

    try {
      await deleteOrganization(id);
      fetchOrganizations();
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : t('organizations.failedDeleteOrganization');
      setError(message);
    }
  };

  const openEditModal = (org: Organization) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      description: org.description || '',
      isActive: org.isActive,
    });
    setShowEditModal(true);
  };

  const copyToClipboard = (code: string, type: 'code' | 'inviteCode') => {
    navigator.clipboard.writeText(code);
    setCopiedCode(`${type}-${code}`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="w-32 h-8 bg-[var(--color-surface-muted)] rounded-lg animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[var(--color-surface-muted)] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('organizations.title')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('organizations.description')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 sm:px-4 sm:py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t('organizations.createOrganization')}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* Organizations List */}
      <div className="bg-[var(--card-solid)] rounded-xl shadow-sm overflow-hidden">
        {organizations.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto text-[var(--color-muted-foreground)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">{t('organizations.noOrganizations')}</h3>
            <p className="text-[var(--color-muted-foreground)] mb-4">{t('organizations.noOrganizationsDesc')}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 py-3 sm:px-4 sm:py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
            >
              <Plus className="w-5 h-5" />
              {t('organizations.createOrganization')}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {organizations.map((org) => (
              <motion.div
                key={org._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{org.name}</h3>
                      {!org.isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] rounded-full">
                          {t('organizations.inactive')}
                        </span>
                      )}
                    </div>
                    {org.description && (
                      <p className="text-[var(--color-muted-foreground)] text-sm mb-3">{org.description}</p>
                    )}

                    {/* Codes */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] px-3 py-1.5 rounded-lg">
                        <span className="text-xs text-[var(--color-muted-foreground)]">{t('organizations.code')}:</span>
                        <code className="text-sm font-mono text-[var(--color-foreground)]">{org.code}</code>
                        <button
                          onClick={() => copyToClipboard(org.code, 'code')}
                          className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                        >
                          {copiedCode === `code-${org.code}` ? (
                            <Check className="w-4 h-4 text-[var(--success)]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 bg-[var(--info-light)] px-3 py-1.5 rounded-lg">
                        <span className="text-xs text-[var(--info)]">{t('organizations.inviteCode')}:</span>
                        <code className="text-sm font-mono text-[var(--info)]">{org.inviteCode}</code>
                        <button
                          onClick={() => copyToClipboard(org.inviteCode, 'inviteCode')}
                          className="text-[var(--info)] hover:text-[var(--info)]/80 transition-colors"
                        >
                          {copiedCode === `inviteCode-${org.inviteCode}` ? (
                            <Check className="w-4 h-4 text-[var(--success)]" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <Users className="w-4 h-4" />
                        <span>{org.userCount} {t('organizations.users')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <BookOpen className="w-4 h-4" />
                        <span>{org.courseCount} {t('organizations.courses')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <FileText className="w-4 h-4" />
                        <span>{org.blogCount} {t('organizations.blogs')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <ClipboardList className="w-4 h-4" />
                        <span>{org.quizCount} {t('organizations.quizzes')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 sm:ml-4 mt-4 sm:mt-0">
                    <button
                      onClick={() => openEditModal(org)}
                      className="p-2 min-h-[44px] sm:min-h-0 text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--info-light)] rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(org._id)}
                      className="p-2 min-h-[44px] sm:min-h-0 text-[var(--color-muted-foreground)] hover:text-[var(--error)] hover:bg-[var(--error-light)] rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-solid)] rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-foreground)]">{t('organizations.createOrganization')}</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  {t('organizations.organizationName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 min-h-[44px] border border-[var(--border)] text-[var(--color-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder={t('organizations.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  {t('organizations.descriptionOptional')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] text-[var(--color-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder={t('organizations.briefDescription')}
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--primary)]"
                />
                <label htmlFor="isActive" className="text-sm text-[var(--color-foreground)]">
                  {t('organizations.active')}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 min-h-[44px] sm:min-h-0 px-4 py-2 border border-[var(--border)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  {t('organizations.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] sm:min-h-0 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                >
                  {t('organizations.create')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedOrg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-solid)] rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--color-foreground)]">{t('organizations.editOrganization')}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  {t('organizations.organizationName')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 min-h-[44px] border border-[var(--border)] text-[var(--color-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder={t('organizations.namePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">
                  {t('organizations.descriptionOptional')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-[var(--border)] text-[var(--color-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--primary)]"
                />
                <label htmlFor="isActive" className="text-sm text-[var(--color-foreground)]">
                  {t('organizations.active')}
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 min-h-[44px] sm:min-h-0 px-4 py-2 border border-[var(--border)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
                >
                  {t('organizations.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[44px] sm:min-h-0 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
                >
                  {t('organizations.update')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

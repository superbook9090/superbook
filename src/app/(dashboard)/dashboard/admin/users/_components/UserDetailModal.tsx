import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Trash2, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { TextField } from '@/components/ui/TextField';
import type { User } from './types';

type Props = {
  selectedUser: User;
  session: { user?: { id?: string; role?: string; } | null } | null;
  organizations: Array<{ _id: string; name: string }>;
  handleCloseUserDetail: () => void;
  handleRoleChange: (userId: string, newRole: string) => void;
  setOrgAssignUserId: (id: string | null) => void;
  setSelectedOrganizationId: (id: string | null) => void;
  handleSaveOrgAssign: () => void;
  handleToggleVideoUpload: (userId: string, currentVal: boolean) => void;
  handleTogglePublicCoursePermission: (userId: string, currentVal: boolean) => void;
  limitsUserId: string | null;
  setLimitsUserId: (id: string | null) => void;
  limitsForm: { courses: string; quizzes: string; blogs: string };
  setLimitsForm: (form: { courses: string; quizzes: string; blogs: string }) => void;
  handleSaveLimits: () => void;
  handleDeleteClick: (userId: string) => void;
};

export function UserDetailModal({
  selectedUser,
  session,
  organizations,
  handleCloseUserDetail,
  handleRoleChange,
  setOrgAssignUserId,
  setSelectedOrganizationId,
  handleSaveOrgAssign,
  handleToggleVideoUpload,
  handleTogglePublicCoursePermission,
  limitsUserId,
  setLimitsUserId,
  limitsForm,
  setLimitsForm,
  handleSaveLimits,
  handleDeleteClick,
}: Props) {
  const { t } = useTranslation();

  return (
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
              <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{t('admin.role')}</p>
              <p className="text-sm font-medium text-[var(--color-foreground)] capitalize">{selectedUser.role}</p>
            </div>
            <div className="p-4 bg-[var(--color-surface-muted)]/30 rounded-xl">
              <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{t('admin.joined')}</p>
              <p className="text-sm font-medium text-[var(--color-foreground)]">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="p-4 bg-[var(--color-surface-muted)]/30 rounded-xl col-span-2">
              <p className="text-xs text-[var(--color-muted-foreground)] mb-1">{t('adminUsers.organization')}</p>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {selectedUser.organizationId
                  ? organizations.find(org => org._id === selectedUser.organizationId)?.name || selectedUser.organizationId
                  : t('common.none')}
              </p>
            </div>
          </div>

          {/* Operations */}
          <div className="space-y-4">
            {/* Change Role */}
            <Dropdown
              label={t('adminUsers.changeRole')}
              value={selectedUser.role}
              onChange={(val) => handleRoleChange(selectedUser._id, val || selectedUser.role)}
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
                  label={t('adminUsers.assignOrganization')}
                  value={selectedUser.organizationId || ''}
                  onChange={(val) => {
                    setOrgAssignUserId(selectedUser._id);
                    setSelectedOrganizationId(val || null);
                  }}
                  options={[
                    { value: '', label: t('common.none') },
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
                  {t('common.save')}
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
                    {t('adminUsers.canCreatePublicCourses')}
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {t('adminUsers.canCreatePublicCoursesDesc')}
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
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">{t('adminUsers.teacherLimits')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <TextField
                    label={t('adminUsers.courses')}
                    type="number"
                    min="1"
                    value={limitsUserId === selectedUser._id ? limitsForm.courses : selectedUser.limits?.courses || ''}
                    onChange={(e) => {
                      setLimitsUserId(selectedUser._id);
                      setLimitsForm({ ...limitsForm, courses: e.target.value });
                    }}
                    placeholder={t('adminUsers.unlimited')}
                    fullWidth
                  />
                  <TextField
                    label={t('adminUsers.quizzes')}
                    type="number"
                    min="1"
                    value={limitsUserId === selectedUser._id ? limitsForm.quizzes : selectedUser.limits?.quizzes || ''}
                    onChange={(e) => {
                      setLimitsUserId(selectedUser._id);
                      setLimitsForm({ ...limitsForm, quizzes: e.target.value });
                    }}
                    placeholder={t('adminUsers.unlimited')}
                    fullWidth
                  />
                  <TextField
                    label={t('adminUsers.blogs')}
                    type="number"
                    min="1"
                    value={limitsUserId === selectedUser._id ? limitsForm.blogs : selectedUser.limits?.blogs || ''}
                    onChange={(e) => {
                      setLimitsUserId(selectedUser._id);
                      setLimitsForm({ ...limitsForm, blogs: e.target.value });
                    }}
                    placeholder={t('adminUsers.unlimited')}
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
                    {t('adminUsers.saveLimits')}
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
                <p className="text-xs text-[var(--color-muted-foreground)] mt-2 text-center">{t('adminUsers.superAdminCannotDelete')}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

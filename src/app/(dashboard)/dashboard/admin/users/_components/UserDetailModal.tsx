'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, CheckCircle2, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { User } from './types';
import { UserProfileInfoSection } from './UserProfileInfoSection';
import { UserRoleOrgSection } from './UserRoleOrgSection';
import { UserTeacherPermissionsSection } from './UserTeacherPermissionsSection';
import { UserModerationSection } from './UserModerationSection';
import { SendEmailModal } from './SendEmailModal';

type Props = {
  selectedUser: User;
  session: { user?: { id?: string; role?: string } | null } | null;
  organizations: Array<{ _id: string; name: string }>;
  handleCloseUserDetail: () => void;
  handleRoleChange: (userId: string, newRole: string) => void;
  handleSaveOrgAssign: (userId: string, orgId: string | null) => Promise<void>;
  handleToggleVideoUpload: (userId: string, currentVal: boolean) => void;
  handleTogglePublicCoursePermission: (userId: string, currentVal: boolean) => void;
  handleSaveLimits: (userId: string, limits: { courses?: number; quizzes?: number; blogs?: number; aiQuizGenerations?: number }) => Promise<void>;
  handleToggleSuspend: (userId: string, isSuspended: boolean) => Promise<void>;
  handleDeleteClick: (userId: string) => void;
};

export function UserDetailModal({
  selectedUser, session, organizations, handleCloseUserDetail, handleRoleChange,
  handleSaveOrgAssign, handleToggleVideoUpload, handleTogglePublicCoursePermission,
  handleSaveLimits, handleToggleSuspend, handleDeleteClick,
}: Props) {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(selectedUser.organizationId ?? null);
  const [limitsForm, setLimitsForm] = useState({
    courses: selectedUser.limits?.courses ? String(selectedUser.limits.courses) : '',
    quizzes: selectedUser.limits?.quizzes ? String(selectedUser.limits.quizzes) : '',
    blogs: selectedUser.limits?.blogs ? String(selectedUser.limits.blogs) : '',
    aiQuizGenerations: selectedUser.limits?.aiQuizGenerations ? String(selectedUser.limits.aiQuizGenerations) : '',
  });
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isSavingLimits, setIsSavingLimits] = useState(false);
  const [isSuspending, setIsSuspending] = useState(false);

  useEffect(() => {
    setSelectedOrgId(selectedUser.organizationId ?? null);
    setLimitsForm({
      courses: selectedUser.limits?.courses ? String(selectedUser.limits.courses) : '',
      quizzes: selectedUser.limits?.quizzes ? String(selectedUser.limits.quizzes) : '',
      blogs: selectedUser.limits?.blogs ? String(selectedUser.limits.blogs) : '',
      aiQuizGenerations: selectedUser.limits?.aiQuizGenerations ? String(selectedUser.limits.aiQuizGenerations) : '',
    });
  }, [selectedUser]);

  const copyUserId = () => {
    navigator.clipboard.writeText(selectedUser._id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const onSaveOrg = async () => {
    setIsSavingOrg(true);
    try {
      await handleSaveOrgAssign(selectedUser._id, selectedOrgId);
    } finally {
      setIsSavingOrg(false);
    }
  };

  const onSaveLimits = async () => {
    setIsSavingLimits(true);
    try {
      const parsed: { courses?: number; quizzes?: number; blogs?: number; aiQuizGenerations?: number } = {};
      if (limitsForm.courses) parsed.courses = parseInt(limitsForm.courses, 10);
      if (limitsForm.quizzes) parsed.quizzes = parseInt(limitsForm.quizzes, 10);
      if (limitsForm.blogs) parsed.blogs = parseInt(limitsForm.blogs, 10);
      if (limitsForm.aiQuizGenerations) parsed.aiQuizGenerations = parseInt(limitsForm.aiQuizGenerations, 10);
      await handleSaveLimits(selectedUser._id, parsed);
    } finally {
      setIsSavingLimits(false);
    }
  };

  const onToggleSuspend = async (isSuspended: boolean) => {
    setIsSuspending(true);
    try {
      await handleToggleSuspend(selectedUser._id, isSuspended);
    } finally {
      setIsSuspending(false);
    }
  };

  const initials = selectedUser.name
    ? selectedUser.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
      onClick={handleCloseUserDetail}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 15 }}
        transition={{ duration: 0.2 }}
        className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[min(90vh,calc(100dvh-1.5rem))] sm:max-h-[min(88dvh,850px)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed & Pinned to Top */}
        <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--card-solid)] shrink-0 z-10">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--student-accent)] text-white flex items-center justify-center font-black text-base sm:text-xl shadow-md shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] truncate">
                    {selectedUser.name}
                  </h3>
                  {selectedUser.isVerified && (
                    <Tooltip label={t('adminUsers.verified') || 'Verified Account'}>
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                    </Tooltip>
                  )}
                  <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[var(--primary-soft)] text-[var(--primary)] capitalize">
                    {selectedUser.role}
                  </span>
                  {selectedUser.isSuspended && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[var(--error-light)] text-[var(--error)]">
                      {t('adminUsers.suspended') || 'Suspended'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={copyUserId}
                    className="flex items-center gap-1.5 bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] px-2 py-0.5 rounded-md transition-colors font-mono text-[11px] text-[var(--color-muted-foreground)]"
                    title={t('adminUsers.copyUserId') || 'Copy User ID'}
                  >
                    <Shield className="w-3 h-3 text-[var(--info)] shrink-0" />
                    <span className="truncate max-w-[120px] sm:max-w-none">ID: {selectedUser._id}</span>
                    {copiedId ? <Check className="w-3 h-3 text-[var(--success)] shrink-0" /> : <Copy className="w-3 h-3 shrink-0" />}
                  </button>
                </div>
              </div>
            </div>

            <Tooltip label={t('common.close')} position="bottom">
              <button
                onClick={handleCloseUserDetail}
                aria-label={t('common.close')}
                className="p-2 hover:bg-[var(--color-surface-muted)] rounded-xl transition-colors text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {/* User Profile Overview & Contact Info */}
          <UserProfileInfoSection
            user={selectedUser}
            organizations={organizations}
            onSendEmailClick={() => setShowEmailModal(true)}
          />

          {/* Role & Org Section */}
          <UserRoleOrgSection
            user={selectedUser}
            currentUserId={session?.user?.id}
            organizations={organizations}
            selectedOrgId={selectedOrgId}
            onRoleChange={(newRole) => handleRoleChange(selectedUser._id, newRole)}
            onOrgSelect={setSelectedOrgId}
            onSaveOrg={onSaveOrg}
            isSavingOrg={isSavingOrg}
          />

          {/* Teacher Capabilities & Quotas */}
          <UserTeacherPermissionsSection
            user={selectedUser}
            onToggleVideo={(val) => handleToggleVideoUpload(selectedUser._id, val)}
            onTogglePublicCourse={(val) => handleTogglePublicCoursePermission(selectedUser._id, val)}
            limitsForm={limitsForm}
            onLimitsChange={(field, val) => setLimitsForm((prev) => ({ ...prev, [field]: val }))}
            onSaveLimits={onSaveLimits}
            isSavingLimits={isSavingLimits}
          />

          {/* Moderation & Danger Zone */}
          <UserModerationSection
            user={selectedUser}
            currentUserId={session?.user?.id}
            currentUserRole={session?.user?.role}
            onToggleSuspend={onToggleSuspend}
            onDeleteClick={handleDeleteClick}
            isSuspending={isSuspending}
          />
        </div>

        {/* Send Direct Email Modal */}
        {showEmailModal && (
          <SendEmailModal
            user={selectedUser}
            onClose={() => setShowEmailModal(false)}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

'use client';

import React from 'react';
import { Shield, Building2, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import type { User } from './types';

interface UserRoleOrgSectionProps {
  user: User;
  currentUserId?: string | null;
  organizations: Array<{ _id: string; name: string }>;
  selectedOrgId: string | null;
  onRoleChange: (newRole: string) => void;
  onOrgSelect: (orgId: string | null) => void;
  onSaveOrg: () => void;
  isSavingOrg?: boolean;
}

export function UserRoleOrgSection({
  user,
  currentUserId,
  organizations,
  selectedOrgId,
  onRoleChange,
  onOrgSelect,
  onSaveOrg,
  isSavingOrg,
}: UserRoleOrgSectionProps) {
  const { t } = useTranslation();
  const isSelf = user._id === currentUserId;
  const isSuperAdminUser = user.role === 'superadmin';

  const roleOptions = [
    { value: 'student', label: t('roles.student') || 'Student' },
    { value: 'teacher', label: t('roles.teacher') || 'Teacher' },
    { value: 'admin', label: t('roles.admin') || 'Admin' },
  ];

  const orgOptions = [
    { value: '', label: t('adminUsers.noOrganization') || 'No Organization (Public)' },
    ...organizations.map((org) => ({ value: org._id, label: org.name })),
  ];

  const hasOrgChanged = (selectedOrgId ?? '') !== (user.organizationId ?? '');

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)]">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        <Shield className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span>{t('adminUsers.changeRole') || 'Role & Organization'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Role Selector */}
        <div>
          <Dropdown
            label={t('admin.role') || 'Role'}
            value={user.role}
            onChange={(val) => val && onRoleChange(val)}
            disabled={isSelf || isSuperAdminUser}
            options={
              isSuperAdminUser
                ? [{ value: 'superadmin', label: 'Super Admin' }]
                : roleOptions
            }
            placeholder=""
          />
          {isSelf && (
            <p className="text-[11px] text-[var(--color-muted)] mt-1">
              You cannot modify your own role.
            </p>
          )}
        </div>

        {/* Organization Assignment */}
        <div>
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Dropdown
                label={
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-[var(--info)]" />
                    <span>{t('adminUsers.organization') || 'Organization'}</span>
                  </span>
                }
                value={selectedOrgId ?? user.organizationId ?? ''}
                onChange={(val) => onOrgSelect(val || null)}
                options={orgOptions}
                placeholder=""
              />
            </div>
            {hasOrgChanged && (
              <Button
                onClick={onSaveOrg}
                variant="primary"
                size="md"
                disabled={isSavingOrg}
                className="shrink-0 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{isSavingOrg ? t('admin.saving') : t('common.save')}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

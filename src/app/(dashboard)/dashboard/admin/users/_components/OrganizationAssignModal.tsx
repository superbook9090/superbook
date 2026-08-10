import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';

type Props = {
  selectedOrganizationId: string | null;
  setSelectedOrganizationId: (id: string | null) => void;
  organizations: Array<{ _id: string; name: string }>;
  handleSaveOrgAssign: () => void;
  handleCloseOrgAssign: () => void;
};

export function OrganizationAssignModal({
  selectedOrganizationId,
  setSelectedOrganizationId,
  organizations,
  handleSaveOrgAssign,
  handleCloseOrgAssign,
}: Props) {
  const { t } = useTranslation();

  return (
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
            {t('common.save')}
          </Button>
          <Button
            onClick={handleCloseOrgAssign}
            variant="secondary"
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

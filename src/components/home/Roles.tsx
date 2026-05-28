'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';
import { landing } from '@/components/home/landingStyles';
import { HomeRoleIcon, type HomeRoleKey } from '@/components/home/homeIcons';

const roleKeys: HomeRoleKey[] = ['student', 'teacher', 'admin'];

export default function Roles() {
  const { t } = useTranslation();

  return (
    <section
      id="roles"
      aria-labelledby="roles-heading"
      className={`${landing.section} bg-[var(--color-surface-muted)]`}
    >
      <div className={landing.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={landing.sectionHeader}
        >
          <h2 id="roles-heading" className={landing.title}>
            {t('home.roles.title')}
          </h2>
          <p className={landing.subtitle}>{t('home.roles.subtitle')}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleKeys.map((roleKey, index) => {
            const theme = roleThemes[roleKey];
            return (
              <motion.div
                key={roleKey}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-6 bg-[var(--card-solid)] rounded-2xl hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.gradient} rounded-t-2xl`}
                />

                <div
                  className={`w-14 h-14 ${theme.activeBg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <HomeRoleIcon roleKey={roleKey} className={`w-7 h-7 ${theme.text}`} />
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                  {t(`home.roles.${roleKey}`)}
                </h3>
                <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {t(`home.roles.${roleKey}Desc`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

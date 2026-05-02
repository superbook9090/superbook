'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';
import { GraduationCap, Users, Shield } from 'lucide-react';

const getRoles = (t: (key: string) => string) => [
  {
    id: 'student',
    icon: GraduationCap,
    title: t('home.roles.student'),
    description: t('home.roles.studentDesc'),
    theme: roleThemes.student,
  },
  {
    id: 'teacher',
    icon: Users,
    title: t('home.roles.teacher'),
    description: t('home.roles.teacherDesc'),
    theme: roleThemes.teacher,
  },
  {
    id: 'admin',
    icon: Shield,
    title: t('home.roles.admin'),
    description: t('home.roles.adminDesc'),
    theme: roleThemes.admin,
  },
];

export default function Roles() {
  const { t } = useTranslation();

  return (
    <section className="py-20 sm:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {t('home.roles.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('home.roles.subtitle')}
          </p>
        </motion.div>

        {/* Roles Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {getRoles(t).map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 bg-white rounded-2xl hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Gradient Top Border */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${role.theme.gradient} rounded-t-2xl`} />

              {/* Icon */}
              <div className={`w-14 h-14 ${role.theme.activeBg} rounded-xl flex items-center justify-center mb-4`}>
                <role.icon className={`w-7 h-7 ${role.theme.text}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {role.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

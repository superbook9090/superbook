'use client';

import { Sparkles, Radio, Award, FileCheck2, BookOpen, Settings2, Megaphone, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import type { NotificationTemplateItem } from './types';

interface NotificationTemplatesProps {
  onApplyTemplate: (template: NotificationTemplateItem) => void;
}

export function NotificationTemplates({ onApplyTemplate }: NotificationTemplatesProps) {
  const { t } = useTranslation();

  const TEMPLATES: NotificationTemplateItem[] = [
    {
      id: 'live-class-start',
      category: 'liveClasses',
      nameKey: 'admin.notifications.templateLiveClass',
      titleEn: t('admin.notifications.templateLiveClassTitleEn'),
      titleHi: t('admin.notifications.templateLiveClassTitleHi'),
      bodyEn: t('admin.notifications.templateLiveClassBodyEn'),
      bodyHi: t('admin.notifications.templateLiveClassBodyHi'),
      defaultDeepLink: '/dashboard/student',
      defaultAudience: 'students',
      icon: Radio,
      badgeColor: 'text-rose-600 bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'new-quiz-assessment',
      category: 'quizzes',
      nameKey: 'admin.notifications.templateQuiz',
      titleEn: t('admin.notifications.templateQuizTitleEn'),
      titleHi: t('admin.notifications.templateQuizTitleHi'),
      bodyEn: t('admin.notifications.templateQuizBodyEn'),
      bodyHi: t('admin.notifications.templateQuizBodyHi'),
      defaultDeepLink: '/quizzes',
      defaultAudience: 'students',
      icon: Award,
      badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'assignment-due',
      category: 'assignments',
      nameKey: 'admin.notifications.templateAssignment',
      titleEn: t('admin.notifications.templateAssignmentTitleEn'),
      titleHi: t('admin.notifications.templateAssignmentTitleHi'),
      bodyEn: t('admin.notifications.templateAssignmentBodyEn'),
      bodyHi: t('admin.notifications.templateAssignmentBodyHi'),
      defaultDeepLink: '/assignments',
      defaultAudience: 'students',
      icon: FileCheck2,
      badgeColor: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      id: 'course-published',
      category: 'lessons',
      nameKey: 'admin.notifications.templateCourse',
      titleEn: t('admin.notifications.templateCourseTitleEn'),
      titleHi: t('admin.notifications.templateCourseTitleHi'),
      bodyEn: t('admin.notifications.templateCourseBodyEn'),
      bodyHi: t('admin.notifications.templateCourseBodyHi'),
      defaultDeepLink: '/courses',
      defaultAudience: 'all',
      icon: BookOpen,
      badgeColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'system-maintenance',
      category: 'system',
      nameKey: 'admin.notifications.templateMaintenance',
      titleEn: t('admin.notifications.templateMaintenanceTitleEn'),
      titleHi: t('admin.notifications.templateMaintenanceTitleHi'),
      bodyEn: t('admin.notifications.templateMaintenanceBodyEn'),
      bodyHi: t('admin.notifications.templateMaintenanceBodyHi'),
      defaultDeepLink: '',
      defaultAudience: 'all',
      icon: Settings2,
      badgeColor: 'text-purple-600 bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 'general-announcement',
      category: 'announcements',
      nameKey: 'admin.notifications.templateAnnouncement',
      titleEn: t('admin.notifications.templateAnnouncementTitleEn'),
      titleHi: t('admin.notifications.templateAnnouncementTitleHi'),
      bodyEn: t('admin.notifications.templateAnnouncementBodyEn'),
      bodyHi: t('admin.notifications.templateAnnouncementBodyHi'),
      defaultDeepLink: '',
      defaultAudience: 'all',
      icon: Megaphone,
      badgeColor: 'text-sky-600 bg-sky-500/10 border-sky-500/30',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--primary)]" />
            <span>{t('admin.notifications.quickTemplates')}</span>
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {t('admin.notifications.quickTemplatesDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.id}
              className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-200 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${tpl.badgeColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t(tpl.nameKey)}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {/* English Snippet */}
                  <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] text-xs space-y-1">
                    <div className="font-bold text-[var(--color-foreground)] line-clamp-1">
                      🇬🇧 {tpl.titleEn}
                    </div>
                    <div className="text-[var(--color-muted-foreground)] text-[11px] line-clamp-2">
                      {tpl.bodyEn}
                    </div>
                  </div>

                  {/* Hindi Snippet */}
                  <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)]/70 border border-[var(--color-border)] text-xs space-y-1">
                    <div className="font-bold text-[var(--color-foreground)] line-clamp-1">
                      🇮🇳 {tpl.titleHi}
                    </div>
                    <div className="text-[var(--color-muted-foreground)] text-[11px] line-clamp-2">
                      {tpl.bodyHi}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                onClick={() => onApplyTemplate(tpl)}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold py-2 touch-target"
              >
                <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{t('admin.notifications.applyTemplate')}</span>
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, BookOpen, FileText, GraduationCap, Settings, Sparkles, Shield, Users, Phone } from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

type Props = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  theme: { text: string };
  canManageSolutionAnalysis: boolean;
};

export function FeatureTogglesSection({ settings, setSettings, theme, canManageSolutionAnalysis }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
    >
      <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
        <ToggleLeft className="w-5 h-5" />
        {t('adminSettings.featureToggles')}
      </h2>

      <div className="space-y-4">
        {/* Enable Blogs */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <BookOpen className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableBlogs')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableBlogsDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.featureToggles.enableBlogs}
            onChange={(enableBlogs) =>
              setSettings({
                ...settings,
                featureToggles: { ...settings.featureToggles, enableBlogs },
              })
            }
            label={t('adminSettings.enableBlogs')}
          />
        </div>

        {/* Enable Quizzes */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileText className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableQuizzes')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableQuizzesDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.featureToggles.enableQuizzes}
            onChange={(enableQuizzes) =>
              setSettings({
                ...settings,
                featureToggles: { ...settings.featureToggles, enableQuizzes },
              })
            }
            label={t('adminSettings.enableQuizzes')}
          />
        </div>

        {/* Enable Courses */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <GraduationCap className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableCourses')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableCoursesDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.featureToggles.enableCourses}
            onChange={(enableCourses) =>
              setSettings({
                ...settings,
                featureToggles: { ...settings.featureToggles, enableCourses },
              })
            }
            label={t('adminSettings.enableCourses')}
          />
        </div>

        {/* Enable Analytics */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Settings className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableAnalytics')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableAnalyticsDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.featureToggles.enableAnalytics}
            onChange={(enableAnalytics) =>
              setSettings({
                ...settings,
                featureToggles: { ...settings.featureToggles, enableAnalytics },
              })
            }
            label={t('adminSettings.enableAnalytics')}
          />
        </div>

        {/* Enable Microsoft Clarity */}
        <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Settings className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableClarity')}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableClarityDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.featureToggles.enableClarity}
            onChange={(enableClarity) =>
              setSettings({
                ...settings,
                featureToggles: { ...settings.featureToggles, enableClarity },
              })
            }
            label={t('adminSettings.enableClarity')}
          />
        </div>

        {canManageSolutionAnalysis && (
          <>
            <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Sparkles className={`w-5 h-5 shrink-0 ${theme.text}`} />
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-foreground)]">
                    {t('adminSettings.enableQuizSolutionAnalysis')}
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('adminSettings.enableQuizSolutionAnalysisDesc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.featureToggles.enableQuizSolutionAnalysis}
                onChange={(enableQuizSolutionAnalysis) =>
                  setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, enableQuizSolutionAnalysis },
                  })
                }
                label={t('adminSettings.enableQuizSolutionAnalysis')}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Shield className={`w-5 h-5 shrink-0 ${theme.text}`} />
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-foreground)]">
                    {t('adminSettings.restrictPublicCourseCreation')}
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('adminSettings.restrictPublicCourseCreationDesc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.featureToggles.restrictPublicCourseCreation ?? false}
                onChange={(restrictPublicCourseCreation) =>
                  setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, restrictPublicCourseCreation },
                  })
                }
                label={t('adminSettings.restrictPublicCourseCreation')}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Users className={`w-5 h-5 shrink-0 ${theme.text}`} />
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-foreground)]">
                    {t('adminSettings.enableEnrollmentManagement')}
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('adminSettings.enableEnrollmentManagementDesc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.featureToggles.enableEnrollmentManagement ?? true}
                onChange={(enableEnrollmentManagement) =>
                  setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, enableEnrollmentManagement },
                  })
                }
                label={t('adminSettings.enableEnrollmentManagement')}
              />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Phone className={`w-5 h-5 shrink-0 ${theme.text}`} />
                <div className="min-w-0">
                  <p className="font-medium text-[var(--color-foreground)]">
                    {t('adminSettings.enablePhoneAuth')}
                  </p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('adminSettings.enablePhoneAuthDesc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.featureToggles.enablePhoneAuth ?? true}
                onChange={(enablePhoneAuth) =>
                  setSettings({
                    ...settings,
                    featureToggles: { ...settings.featureToggles, enablePhoneAuth },
                  })
                }
                label={t('adminSettings.enablePhoneAuth')}
              />
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

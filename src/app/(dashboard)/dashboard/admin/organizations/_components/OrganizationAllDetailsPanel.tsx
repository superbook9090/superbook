'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Globe,
  Palette,
  Loader2,
  Search,
  Mail,
  Phone,
  ExternalLink,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrganizationFullDetails } from '@/lib/api/organizations';
import type { OrganizationItem } from './types';

export type OrgDetailTab = 'users' | 'courses' | 'quizzes' | 'blogs';

interface OrganizationAllDetailsPanelProps {
  org: OrganizationItem;
  detailsData: OrganizationFullDetails | null;
  isLoading: boolean;
  error: string | null;
  activeTab: OrgDetailTab;
  onTabChange: (tab: OrgDetailTab) => void;
  onRetry: () => void;
}

const ROLE_STYLES: Record<string, string> = {
  superadmin: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  admin: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
  teacher: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
  student: 'bg-[var(--student-soft)] text-[var(--student-primary)]',
};

export function OrganizationAllDetailsPanel({
  org,
  detailsData,
  isLoading,
  error,
  activeTab,
  onTabChange,
  onRetry,
}: OrganizationAllDetailsPanelProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const details = detailsData?.details;

  const filteredUsers = useMemo(() => {
    const list = details?.users || [];
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q)
    );
  }, [details?.users, q]);

  const filteredCourses = useMemo(() => {
    const list = details?.courses || [];
    if (!q) return list;
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.instructorName.toLowerCase().includes(q)
    );
  }, [details?.courses, q]);

  const filteredQuizzes = useMemo(() => {
    const list = details?.quizzes || [];
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.courseTitle.toLowerCase().includes(q) ||
        item.instructorName.toLowerCase().includes(q)
    );
  }, [details?.quizzes, q]);

  const filteredBlogs = useMemo(() => {
    const list = details?.blogs || [];
    if (!q) return list;
    return list.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.authorName.toLowerCase().includes(q)
    );
  }, [details?.blogs, q]);

  const tabs: Array<{ id: OrgDetailTab; label: string; count: number; icon: React.ReactNode }> = [
    { id: 'users', label: t('organizations.users'), count: detailsData?.userCount ?? org.userCount ?? 0, icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'courses', label: t('organizations.courses'), count: detailsData?.courseCount ?? org.courseCount ?? 0, icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'quizzes', label: t('organizations.quizzes'), count: detailsData?.quizCount ?? org.quizCount ?? 0, icon: <ClipboardList className="w-3.5 h-3.5" /> },
    { id: 'blogs', label: t('organizations.blogs'), count: detailsData?.blogCount ?? org.blogCount ?? 0, icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  const hasBranding = Boolean(org.tagline || org.website || org.primaryColor || org.updatedAt);

  return (
    <div className="space-y-4">
      {/* Branding & Profile Info */}
      {hasBranding && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)]/35 p-3.5 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] tracking-wider block">
            {t('organizations.brandingDetails')}
          </span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-foreground)]">
            {org.tagline && (
              <span className="text-[var(--color-muted-foreground)] italic">&ldquo;{org.tagline}&rdquo;</span>
            )}
            {org.website && (
              <a
                href={org.website.startsWith('http') ? org.website : `https://${org.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[var(--primary)] hover:underline font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{org.website}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {org.primaryColor && (
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                <Palette className="w-3.5 h-3.5 text-[var(--color-muted-foreground)]" />
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/15 inline-block"
                  style={{ backgroundColor: org.primaryColor }}
                />
                <span>{org.primaryColor}</span>
              </span>
            )}
            {org.updatedAt && (
              <span className="inline-flex items-center gap-1 text-[11px] text-[var(--color-muted-foreground)]">
                <Calendar className="w-3 h-3" />
                <span>{t('organizations.lastUpdated')}: {new Date(org.updatedAt).toLocaleDateString()}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Role Breakdown Summary */}
      {details?.roleBreakdown && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full font-semibold bg-[var(--student-soft)] text-[var(--student-primary)]">
            {details.roleBreakdown.students} {t('roles.student')}
          </span>
          <span className="px-2.5 py-1 rounded-full font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)]">
            {details.roleBreakdown.teachers} {t('roles.teacher')}
          </span>
          <span className="px-2.5 py-1 rounded-full font-semibold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            {details.roleBreakdown.admins} {t('roles.admin')}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => { onTabChange(tab.id); setSearch(''); }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                  : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] border-[var(--border)] hover:text-[var(--color-foreground)]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] tabular-nums ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-foreground)]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Local Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-[var(--color-muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('organizations.searchInTab')}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--color-surface-muted)]/60 border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/25"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-xs text-[var(--color-muted-foreground)]">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--primary)]" />
          <span>{t('common.loading')}</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl border border-red-500/25 bg-red-500/10 text-xs text-red-500 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </span>
          <button type="button" onClick={onRetry} className="font-bold underline cursor-pointer shrink-0">
            {t('analytics.refresh')}
          </button>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden max-h-[340px] overflow-y-auto bg-[var(--card-solid)]">
          {activeTab === 'users' && (
            filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-muted-foreground)]">
                {t('organizations.noItemsInOrg')}
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u._id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-foreground)] truncate">{u.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${ROLE_STYLES[u.role] || ROLE_STYLES.student}`}>
                        {u.role}
                      </span>
                      {u.isSuspended && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-500">
                          {t('adminUsers.suspended')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-[var(--color-muted-foreground)] mt-1">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Mail className="w-3 h-3 shrink-0" />
                        {u.email}
                      </span>
                      {u.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          {u.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--color-muted-foreground)] shrink-0">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>
              ))
            )
          )}

          {activeTab === 'courses' && (
            filteredCourses.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-muted-foreground)]">
                {t('organizations.noItemsInOrg')}
              </div>
            ) : (
              filteredCourses.map((c) => (
                <div key={c._id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-foreground)] truncate">{c.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.isPublished ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'}`}>
                        {c.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                      {c.instructorName ? `${c.instructorName} · ` : ''}
                      {c.enrolledCount} enrolled · {c.lessonCount} lessons
                      {c.category ? ` · ${c.category}` : ''}
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/teacher/courses/${c._id}/edit`}
                    className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 shrink-0"
                    title={t('organizations.viewDetails')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )
          )}

          {activeTab === 'quizzes' && (
            filteredQuizzes.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-muted-foreground)]">
                {t('organizations.noItemsInOrg')}
              </div>
            ) : (
              filteredQuizzes.map((item) => (
                <div key={item._id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-foreground)] truncate">{item.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.isPublished ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'}`}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                      {item.courseTitle ? `${item.courseTitle} · ` : ''}
                      {item.instructorName ? `${item.instructorName} · ` : ''}
                      {item.questionCount} Qs
                    </p>
                  </div>
                  <Link
                    href={`/dashboard/admin/quizzes/${item._id}`}
                    className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 shrink-0"
                    title={t('organizations.viewDetails')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )
          )}

          {activeTab === 'blogs' && (
            filteredBlogs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-muted-foreground)]">
                {t('organizations.noItemsInOrg')}
              </div>
            ) : (
              filteredBlogs.map((b) => (
                <div key={b._id} className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[var(--color-foreground)] truncate">{b.title}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isPublished ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'}`}>
                        {b.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
                      {b.authorName ? `${b.authorName} · ` : ''}
                      {b.views} views{b.category ? ` · ${b.category}` : ''}
                    </p>
                  </div>
                  {b.slug && (
                    <Link
                      href={`/blog/${b.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg border border-[var(--border)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:border-[var(--primary)]/40 shrink-0"
                      title={t('organizations.viewDetails')}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))
            )
          )}
        </div>
      )}
    </div>
  );
}

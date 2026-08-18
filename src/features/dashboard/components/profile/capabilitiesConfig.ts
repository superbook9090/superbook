import React from 'react';
import type { Session } from '@/types';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileText,
  Award,
  Video,
  BarChart3,
  Users,
  Building2,
  Sliders,
  Bell,
  FolderGit2,
  Sparkles,
} from 'lucide-react';
import type { AccountInfo } from '@/lib/api/auth';

export interface CapabilityItem {
  title: string;
  desc: string;
  icon: React.ElementType;
  allowed: boolean;
  scope: string;
}

export function getRoleCapabilities(
  role: string,
  superAdmin: boolean,
  adminUser: boolean,
  accountInfo: AccountInfo | null,
  session: Session,
  t: (key: string) => string
): { title: string; desc: string; items: CapabilityItem[] } {
  if (adminUser) {
    return {
      title: t('profile.adminPrivilegesTitle') || 'Administrative Authority Matrix',
      desc: t('profile.adminPrivilegesDesc') || 'Capabilities and privileges assigned to your administrative role.',
      items: [
        {
          title: t('profile.permUserManagement') || 'User & Account Management',
          desc: t('profile.permUserManagementDesc') || 'Create, update, suspend users, and assign access roles.',
          icon: Users,
          allowed: true,
          scope: superAdmin ? 'Global Platform' : 'Organization Scope',
        },
        {
          title: t('profile.permOrgManagement') || 'Organization Governance',
          desc: t('profile.permOrgManagementDesc') || 'Configure organizational settings, invite codes, and memberships.',
          icon: Building2,
          allowed: true,
          scope: superAdmin ? 'All Organizations' : 'Assigned Organization',
        },
        {
          title: t('profile.permSystemConfig') || 'Platform Config & Feature Flags',
          desc: t('profile.permSystemConfigDesc') || 'Toggle feature switches, maintenance mode, and global configs.',
          icon: Sliders,
          allowed: superAdmin,
          scope: superAdmin ? 'Superadmin Only' : 'Restricted',
        },
        {
          title: t('profile.permBroadcast') || 'Push & System Broadcasts',
          desc: t('profile.permBroadcastDesc') || 'Dispatch system-wide notifications and announcement broadcasts.',
          icon: Bell,
          allowed: superAdmin,
          scope: superAdmin ? 'Superadmin Only' : 'Restricted',
        },
        {
          title: t('profile.permContentModeration') || 'Course & Content Oversight',
          desc: t('profile.permContentModerationDesc') || 'Inspect and govern courses, quizzes, notes, video lectures, and blogs.',
          icon: BookOpen,
          allowed: true,
          scope: superAdmin ? 'All Platform Courses' : 'Org Courses',
        },
        {
          title: t('profile.permFileHub') || 'File Asset Repository',
          desc: t('profile.permFileHubDesc') || 'Centrally inspect, download, and manage storage assets across the platform.',
          icon: FolderGit2,
          allowed: true,
          scope: 'Platform Files',
        },
        {
          title: t('profile.permAnalytics') || 'Analytics & System Telemetry',
          desc: t('profile.permAnalyticsDesc') || 'Monitor platform engagement, active enrollments, and traffic analytics.',
          icon: BarChart3,
          allowed: true,
          scope: superAdmin ? 'Global System' : 'Org Analytics',
        },
      ],
    };
  }

  if (role === 'teacher') {
    const canCreatePublic = accountInfo?.canCreatePublicCourses ?? false;
    const canUploadVideos = Boolean(session.user?.canUploadVideos);

    return {
      title: t('profile.teacherPrivilegesTitle') || 'Educator Teaching Capabilities',
      desc: t('profile.teacherPrivilegesDesc') || 'Course authoring permissions, video lecture rights, and student oversight tools.',
      items: [
        {
          title: t('profile.permTeacherCourses') || 'Course Authoring & Curriculum',
          desc: t('profile.permTeacherCoursesDesc') || 'Create comprehensive courses, add curriculum chapters, and publish lessons.',
          icon: BookOpen,
          allowed: true,
          scope: 'Teacher Studio',
        },
        {
          title: t('profile.permTeacherPublicCourses') || 'Public Course Publishing',
          desc: t('profile.permTeacherPublicCoursesDesc') || 'Publish courses visible to all learners without requiring invite codes.',
          icon: Sparkles,
          allowed: canCreatePublic,
          scope: canCreatePublic ? 'Public Catalog' : 'Course Code Required',
        },
        {
          title: t('profile.permTeacherQuizzes') || 'Quiz & Assessment Creation',
          desc: t('profile.permTeacherQuizzesDesc') || 'Author interactive quizzes and examine student performance attempts.',
          icon: HelpCircle,
          allowed: true,
          scope: 'Course Quizzes',
        },
        {
          title: t('profile.permTeacherNotes') || 'Curated Study Materials',
          desc: t('profile.permTeacherNotesDesc') || 'Publish lesson notes and study documentation for your students.',
          icon: FileText,
          allowed: true,
          scope: 'Study Hub',
        },
        {
          title: t('profile.permTeacherVideos') || 'Video Lecture Hosting',
          desc: t('profile.permTeacherVideosDesc') || 'Host unlisted YouTube video lectures directly within courses.',
          icon: Video,
          allowed: canUploadVideos,
          scope: canUploadVideos ? 'Video Lectures Active' : 'Admin Approval Needed',
        },
        {
          title: t('profile.permTeacherAnalytics') || 'Student Telemetry & Analytics',
          desc: t('profile.permTeacherAnalyticsDesc') || 'Monitor enrollment statistics, course progress, and quiz attempt rates.',
          icon: BarChart3,
          allowed: true,
          scope: 'Instructor Analytics',
        },
      ],
    };
  }

  return {
    title: t('profile.studentPrivilegesTitle') || 'Student Learning Capabilities',
    desc: t('profile.studentPrivilegesDesc') || 'Access permissions and learning tools available to your student account.',
    items: [
      {
        title: t('profile.permStudentCourses') || 'Course Enrollment & Lessons',
        desc: t('profile.permStudentCoursesDesc') || 'Access enrolled curriculum, track lesson completion, and stream video lectures.',
        icon: GraduationCap,
        allowed: true,
        scope: 'Active Courses',
      },
      {
        title: t('profile.permStudentQuizzes') || 'Interactive Assessments',
        desc: t('profile.permStudentQuizzesDesc') || 'Attempt quizzes, review performance analytics, and practice questions.',
        icon: HelpCircle,
        allowed: true,
        scope: 'Practice & Tests',
      },
      {
        title: t('profile.permStudentNotes') || 'Study Materials & Notes',
        desc: t('profile.permStudentNotesDesc') || 'Read and download study guides, notes, and curriculum attachments.',
        icon: FileText,
        allowed: true,
        scope: 'Study Library',
      },
      {
        title: t('profile.permStudentCerts') || 'Course Certificates',
        desc: t('profile.permStudentCertsDesc') || 'Earn and verify downloadable completion certificates.',
        icon: Award,
        allowed: true,
        scope: 'Accredited Certificates',
      },
    ],
  };
}

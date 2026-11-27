import type { OrganizationItem } from '@/lib/api/organizations';

const DEFAULT_PUBLIC_ORIGIN = 'https://www.quizdo.in';

function resolveOrigin(origin?: string): string {
  const raw =
    origin?.trim() ||
    (typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : DEFAULT_PUBLIC_ORIGIN);
  return raw.replace(/\/+$/, '');
}

export function buildOrganizationRegistrationUrl(
  inviteCode: string,
  role: 'student' | 'teacher',
  origin?: string
): string {
  const base = resolveOrigin(origin);
  return `${base}/register?inviteCode=${encodeURIComponent(inviteCode)}&role=${role}`;
}

function formatIsoDate(value?: string): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

export function buildOrganizationShareText(org: OrganizationItem, origin?: string): string {
  const studentUrl = buildOrganizationRegistrationUrl(org.inviteCode, 'student', origin);
  const teacherCode = org.teacherInviteCode || org.inviteCode;
  const teacherUrl = buildOrganizationRegistrationUrl(teacherCode, 'teacher', origin);

  const lines: string[] = [];

  lines.push(`Organization: ${org.name}`);
  if (org.tagline?.trim()) {
    lines.push(`Tagline: ${org.tagline.trim()}`);
  }
  lines.push(`Status: ${org.isActive ? 'Active' : 'Inactive'}`);
  if (org.description?.trim()) {
    lines.push(`Description: ${org.description.trim()}`);
  }
  if (org.website?.trim()) {
    lines.push(`Website: ${org.website.trim()}`);
  }

  lines.push('');
  lines.push('Codes & Join Links:');
  lines.push(`- Org Code: ${org.code}`);
  lines.push(`- Student Invite Code: ${org.inviteCode}`);
  if (org.teacherInviteCode) {
    lines.push(`- Teacher Invite Code: ${org.teacherInviteCode}`);
  }
  lines.push(`- Student Registration Link: ${studentUrl}`);
  lines.push(`- Teacher Registration Link: ${teacherUrl}`);

  const enabledFeatures = [
    org.permissions?.canUploadVideos && 'Video Upload',
    org.permissions?.canCreatePublicCourses && 'Public Courses',
    org.permissions?.canCreateContests && 'Contests',
    org.permissions?.canGenerateAiQuizzes && 'AI Quiz Generation',
  ].filter(Boolean) as string[];

  const quotaCeilings = [
    org.teacherLimits?.courses && `Courses: ${org.teacherLimits.courses}`,
    org.teacherLimits?.quizzes && `Quizzes: ${org.teacherLimits.quizzes}`,
    org.teacherLimits?.blogs && `Blogs: ${org.teacherLimits.blogs}`,
    org.teacherLimits?.aiQuizGenerations &&
      `AI Quiz Generations: ${org.teacherLimits.aiQuizGenerations}`,
    org.teacherLimits?.aiQuizMaxQuestions &&
      `Max Questions/AI Quiz: ${org.teacherLimits.aiQuizMaxQuestions}`,
  ].filter(Boolean) as string[];

  const createdDate = formatIsoDate(org.createdAt);

  lines.push('');
  lines.push('Meta Info:');
  lines.push(
    `- Users: ${org.userCount || 0} | Courses: ${org.courseCount || 0} | Quizzes: ${org.quizCount || 0} | Blogs: ${org.blogCount || 0}`
  );
  if (createdDate) {
    lines.push(`- Created: ${createdDate}`);
  }
  lines.push(
    `- Enabled Teacher Features: ${
      enabledFeatures.length > 0 ? enabledFeatures.join(', ') : 'None (standard defaults)'
    }`
  );
  lines.push(
    `- Teacher Quota Ceilings: ${
      quotaCeilings.length > 0 ? quotaCeilings.join(', ') : 'Standard defaults'
    }`
  );

  return lines.join('\n');
}

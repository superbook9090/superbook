// @vitest-environment node
import { describe, it, expect } from 'vitest';
import type { OrganizationItem } from '@/lib/api/organizations';
import {
  buildOrganizationRegistrationUrl,
  buildOrganizationShareText,
} from '../formatOrgShareInfo';

function makeOrg(overrides: Partial<OrganizationItem> = {}): OrganizationItem {
  return {
    _id: 'org-1',
    name: 'Springdale High School',
    code: 'SPRINGDALE',
    inviteCode: 'SPR-8492',
    description: 'K-12 science and mathematics institution',
    tagline: 'Excellence in Learning',
    website: 'https://springdale.edu',
    isActive: true,
    permissions: {
      canUploadVideos: true,
      canCreatePublicCourses: true,
      canCreateContests: false,
      canGenerateAiQuizzes: true,
    },
    teacherLimits: {
      courses: 20,
      quizzes: 50,
      blogs: 15,
      aiQuizGenerations: 10,
      aiQuizMaxQuestions: 30,
    },
    userCount: 42,
    courseCount: 8,
    quizCount: 25,
    blogCount: 6,
    createdAt: '2026-03-14T10:30:00.000Z',
    ...overrides,
  };
}

describe('formatOrgShareInfo', () => {
  it('builds student and teacher registration links with encoded invite code and stripped trailing slash', () => {
    expect(buildOrganizationRegistrationUrl('ABC 123+/', 'student', 'https://www.quizdo.in/')).toBe(
      'https://www.quizdo.in/register?inviteCode=ABC%20123%2B%2F&role=student'
    );
    expect(buildOrganizationRegistrationUrl('SPR-8492', 'teacher', 'https://app.quizdo.in')).toBe(
      'https://app.quizdo.in/register?inviteCode=SPR-8492&role=teacher'
    );
  });

  it('formats full organization share summary with codes, links, permissions, quotas, and meta counts', () => {
    const text = buildOrganizationShareText(makeOrg(), 'https://www.quizdo.in');

    expect(text).toContain('Organization: Springdale High School');
    expect(text).toContain('Tagline: Excellence in Learning');
    expect(text).toContain('Status: Active');
    expect(text).toContain('Description: K-12 science and mathematics institution');
    expect(text).toContain('Website: https://springdale.edu');
    expect(text).toContain('- Org Code: SPRINGDALE');
    expect(text).toContain('- Invite Code: SPR-8492');
    expect(text).toContain(
      '- Student Registration Link: https://www.quizdo.in/register?inviteCode=SPR-8492&role=student'
    );
    expect(text).toContain(
      '- Teacher Registration Link: https://www.quizdo.in/register?inviteCode=SPR-8492&role=teacher'
    );
    expect(text).toContain('- Users: 42 | Courses: 8 | Quizzes: 25 | Blogs: 6');
    expect(text).toContain('- Created: 2026-03-14');
    expect(text).toContain(
      '- Enabled Teacher Features: Video Upload, Public Courses, AI Quiz Generation'
    );
    expect(text).toContain(
      '- Teacher Quota Ceilings: Courses: 20, Quizzes: 50, Blogs: 15, AI Quiz Generations: 10, Max Questions/AI Quiz: 30'
    );
  });

  it('omits empty optional metadata and displays defaults when no extra features or quotas are granted', () => {
    const text = buildOrganizationShareText(
      makeOrg({
        tagline: '   ',
        description: undefined,
        website: '',
        isActive: false,
        permissions: {},
        teacherLimits: {},
        userCount: 0,
        courseCount: 0,
        quizCount: 0,
        blogCount: 0,
      }),
      'https://www.quizdo.in'
    );

    expect(text).not.toContain('Tagline:');
    expect(text).not.toContain('Description:');
    expect(text).not.toContain('Website:');
    expect(text).toContain('Status: Inactive');
    expect(text).toContain('- Users: 0 | Courses: 0 | Quizzes: 0 | Blogs: 0');
    expect(text).toContain('- Enabled Teacher Features: None (standard defaults)');
    expect(text).toContain('- Teacher Quota Ceilings: Standard defaults');
  });
});

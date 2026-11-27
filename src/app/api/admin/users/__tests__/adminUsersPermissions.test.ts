// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

const mockGetServerSession = vi.fn();
const mockUserFindById = vi.fn();
const mockUserFindByIdAndUpdate = vi.fn();
const mockUserFindByIdAndDelete = vi.fn();
const mockOrgFindById = vi.fn();
const mockFetchAdminUsersWithStats = vi.fn();
const mockDeleteUserRelatedData = vi.fn();

vi.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/db', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/logger', () => ({ logApiError: vi.fn() }));
vi.mock('@/lib/cascade/deleteRelated', () => ({
  deleteUserRelatedData: (...args: unknown[]) => mockDeleteUserRelatedData(...args),
}));
vi.mock('@/lib/admin/userQuery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/admin/userQuery')>();
  return {
    ...actual,
    fetchAdminUsersWithStats: (...args: unknown[]) => mockFetchAdminUsersWithStats(...args),
  };
});
vi.mock('@/models/User', () => ({
  default: {
    findById: (...args: unknown[]) => mockUserFindById(...args),
    findByIdAndUpdate: (...args: unknown[]) => mockUserFindByIdAndUpdate(...args),
    findByIdAndDelete: (...args: unknown[]) => mockUserFindByIdAndDelete(...args),
  },
}));
vi.mock('@/models/Organization', () => ({
  default: {
    findById: (...args: unknown[]) => mockOrgFindById(...args),
  },
}));

import { GET, PATCH, DELETE } from '../route';

function makeSelectLean(doc: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(doc),
    }),
  };
}

describe('/api/admin/users permission & organization policy enforcement', () => {
  const orgA = new mongoose.Types.ObjectId();
  const orgB = new mongoose.Types.ObjectId();
  const orgAdminId = new mongoose.Types.ObjectId();
  const superAdminId = new mongoose.Types.ObjectId();
  const teacherId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchAdminUsersWithStats.mockResolvedValue({
      users: [],
      total: 0,
      stats: { total: 0, students: 0, teachers: 0, admins: 0, superadmins: 0, suspended: 0 },
    });
    mockUserFindByIdAndUpdate.mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: teacherId, role: 'teacher' }),
    });
    mockUserFindByIdAndDelete.mockResolvedValue({ _id: teacherId });
    mockDeleteUserRelatedData.mockResolvedValue(undefined);
  });

  describe('GET /api/admin/users', () => {
    it('blocks unauthenticated, student, and teacher callers (403)', async () => {
      for (const session of [
        null,
        { user: { id: teacherId.toString(), role: 'student' } },
        { user: { id: teacherId.toString(), role: 'teacher' } },
      ]) {
        mockGetServerSession.mockResolvedValue(session);
        const res = await GET(new NextRequest('http://localhost/api/admin/users'));
        expect(res.status).toBe(403);
      }
    });

    it('returns organizationPolicy for org admin and ignores cross-org organizationId query param', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockOrgFindById.mockReturnValue(
        makeSelectLean({
          permissions: { canUploadVideos: true, canCreateContests: false },
          teacherLimits: { courses: 20 },
        })
      );

      const res = await GET(
        new NextRequest(`http://localhost/api/admin/users?organizationId=${orgB}`)
      );
      expect(res.status).toBe(200);
      const body = await res.json();

      expect(body.organizationPolicy).toEqual({
        permissions: {
          canUploadVideos: true,
          canCreatePublicCourses: false,
          canCreateContests: false,
          canGenerateAiQuizzes: false,
        },
        teacherLimits: { courses: 20 },
      });
      // Ensure orgFilter passed into fetchAdminUsersWithStats is orgA, not orgB
      expect(mockFetchAdminUsersWithStats.mock.calls[0][1]).toEqual({ organizationId: orgA });
    });

    it('does not attach organizationPolicy cap for superadmin', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: superAdminId.toString(), role: 'superadmin', organizationId: null },
      });

      const res = await GET(new NextRequest('http://localhost/api/admin/users'));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.organizationPolicy).toBeUndefined();
      expect(mockOrgFindById).not.toHaveBeenCalled();
    });
  });

  describe('PATCH /api/admin/users', () => {
    it('blocks org admin from toggling Video Upload Permission when not granted to their org (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockUserFindById.mockReturnValue(
        makeSelectLean({ _id: teacherId, role: 'teacher', organizationId: orgA })
      );
      mockOrgFindById.mockReturnValue(
        makeSelectLean({ permissions: { canUploadVideos: false }, teacherLimits: {} })
      );

      const res = await PATCH(
        new NextRequest('http://localhost/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({ userId: teacherId.toString(), updates: { canUploadVideos: true } }),
        })
      );
      expect(res.status).toBe(403);
      expect(mockUserFindByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('allows org admin to toggle Video Upload Permission when superadmin granted it to their org (200)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockUserFindById.mockReturnValue(
        makeSelectLean({ _id: teacherId, role: 'teacher', organizationId: orgA })
      );
      mockOrgFindById.mockReturnValue(
        makeSelectLean({ permissions: { canUploadVideos: true }, teacherLimits: {} })
      );

      const res = await PATCH(
        new NextRequest('http://localhost/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({ userId: teacherId.toString(), updates: { canUploadVideos: true } }),
        })
      );
      expect(res.status).toBe(200);
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledOnce();
    });

    it('enforces organization teacherLimits ceiling for org admin (400 above max, 200 within max, 403 ungranted)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockUserFindById.mockReturnValue(
        makeSelectLean({ _id: teacherId, role: 'teacher', organizationId: orgA })
      );
      mockOrgFindById.mockReturnValue(
        makeSelectLean({ permissions: {}, teacherLimits: { courses: 20 } })
      );

      const overLimit = await PATCH(
        new NextRequest('http://localhost/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({ userId: teacherId.toString(), updates: { limits: { courses: 25 } } }),
        })
      );
      expect(overLimit.status).toBe(400);

      const ungrantedField = await PATCH(
        new NextRequest('http://localhost/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({ userId: teacherId.toString(), updates: { limits: { blogs: 5 } } }),
        })
      );
      expect(ungrantedField.status).toBe(403);

      const withinLimit = await PATCH(
        new NextRequest('http://localhost/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({ userId: teacherId.toString(), updates: { limits: { courses: 15 } } }),
        })
      );
      expect(withinLimit.status).toBe(200);
    });

    it('allows superadmin to toggle any feature and set any valid limit without org ceiling (200)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: superAdminId.toString(), role: 'superadmin', organizationId: null },
      });
      mockUserFindById.mockReturnValue(
        makeSelectLean({ _id: teacherId, role: 'teacher', organizationId: orgA })
      );

      const res = await PATCH(
        new NextRequest('http://localhost/api/admin/users', {
          method: 'PATCH',
          body: JSON.stringify({
            userId: teacherId.toString(),
            updates: {
              canUploadVideos: true,
              canCreateContests: true,
              limits: { courses: 500, blogs: 100 },
            },
          }),
        })
      );
      expect(res.status).toBe(200);
      expect(mockUserFindByIdAndUpdate).toHaveBeenCalledOnce();
    });
  });

  describe('DELETE /api/admin/users', () => {
    it('blocks org admin from deleting users in another organization (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockUserFindById.mockReturnValue(
        makeSelectLean({ _id: teacherId, role: 'teacher', organizationId: orgB })
      );

      const res = await DELETE(
        new NextRequest(`http://localhost/api/admin/users?id=${teacherId}`, { method: 'DELETE' })
      );
      expect(res.status).toBe(403);
      expect(mockUserFindByIdAndDelete).not.toHaveBeenCalled();
    });

    it('allows org admin to delete a teacher in their own organization (200)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockUserFindById.mockReturnValue(
        makeSelectLean({ _id: teacherId, role: 'teacher', organizationId: orgA })
      );

      const res = await DELETE(
        new NextRequest(`http://localhost/api/admin/users?id=${teacherId}`, { method: 'DELETE' })
      );
      expect(res.status).toBe(200);
      expect(mockUserFindByIdAndDelete).toHaveBeenCalledWith(teacherId.toString());
    });
  });
});

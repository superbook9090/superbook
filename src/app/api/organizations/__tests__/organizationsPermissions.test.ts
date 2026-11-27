// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

const {
  mockGetServerSession,
  mockOrgFind,
  mockOrgExists,
  mockOrgFindById,
  mockOrgSave,
} = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
  mockOrgFind: vi.fn(),
  mockOrgExists: vi.fn(),
  mockOrgFindById: vi.fn(),
  mockOrgSave: vi.fn(),
}));

vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/db', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/logger', () => ({ logApiError: vi.fn() }));
vi.mock('@/lib/inviteCode', () => ({
  generateOrgCode: () => 'ORGCODE1',
  generateInviteCode: () => 'INVITE1',
}));
vi.mock('@/models', () => {
  class MockOrganizationModel {
    permissions?: Record<string, unknown>;
    teacherLimits?: Record<string, unknown>;
    constructor(data: Record<string, unknown>) {
      Object.assign(this, data);
    }
    save = (...args: unknown[]) => mockOrgSave(...args);
    static find = (...args: unknown[]) => mockOrgFind(...args);
    static exists = (...args: unknown[]) => mockOrgExists(...args);
    static findById = (...args: unknown[]) => mockOrgFindById(...args);
    static findByIdAndDelete = vi.fn();
  }
  return {
    Organization: MockOrganizationModel,
    User: { aggregate: vi.fn().mockResolvedValue([]), countDocuments: vi.fn().mockResolvedValue(0) },
    Course: { aggregate: vi.fn().mockResolvedValue([]), countDocuments: vi.fn().mockResolvedValue(0) },
    Blog: { aggregate: vi.fn().mockResolvedValue([]), countDocuments: vi.fn().mockResolvedValue(0) },
    Quiz: { aggregate: vi.fn().mockResolvedValue([]), countDocuments: vi.fn().mockResolvedValue(0) },
  };
});

import { GET as listOrgs, POST as createOrg } from '../route';
import { PATCH as patchOrg } from '../[id]/route';

describe('Organizations API permission & policy controls', () => {
  const orgA = new mongoose.Types.ObjectId();
  const orgB = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOrgFind.mockReturnValue({
      sort: vi.fn().mockReturnValue({ lean: vi.fn().mockResolvedValue([]) }),
    });
    mockOrgExists.mockResolvedValue(null);
    mockOrgSave.mockResolvedValue(undefined);
  });

  describe('GET & POST /api/organizations', () => {
    it('rejects unauthenticated requests (401)', async () => {
      mockGetServerSession.mockResolvedValue(null);

      const getRes = await listOrgs(new NextRequest('http://localhost/api/organizations'));
      expect(getRes.status).toBe(401);

      const postRes = await createOrg(
        new NextRequest('http://localhost/api/organizations', {
          method: 'POST',
          body: JSON.stringify({ name: 'Acme' }),
        })
      );
      expect(postRes.status).toBe(401);
    });

    it('blocks organization admin, teacher, and student from listing or creating organizations (403)', async () => {
      for (const role of ['admin', 'teacher', 'student']) {
        mockGetServerSession.mockResolvedValue({
          user: { id: 'u1', role, organizationId: orgA.toString() },
        });

        const getRes = await listOrgs(new NextRequest('http://localhost/api/organizations'));
        expect(getRes.status).toBe(403);

        const postRes = await createOrg(
          new NextRequest('http://localhost/api/organizations', {
            method: 'POST',
            body: JSON.stringify({ name: 'Acme' }),
          })
        );
        expect(postRes.status).toBe(403);
      }
    });

    it('allows superadmin to create an organization with valid permissions and teacherLimits (201)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'super-1', role: 'superadmin', organizationId: null },
      });

      const res = await createOrg(
        new NextRequest('http://localhost/api/organizations', {
          method: 'POST',
          body: JSON.stringify({
            name: 'Acme Academy',
            permissions: { canUploadVideos: true, canGenerateAiQuizzes: true },
            teacherLimits: { courses: 25, quizzes: 40 },
          }),
        })
      );
      expect(res.status).toBe(201);
      expect(mockOrgSave).toHaveBeenCalledOnce();
    });

    it('rejects invalid permissions or teacherLimits payloads from superadmin (400)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'super-1', role: 'superadmin', organizationId: null },
      });

      const badPerm = await createOrg(
        new NextRequest('http://localhost/api/organizations', {
          method: 'POST',
          body: JSON.stringify({ name: 'Acme', permissions: { canUploadVideos: 'yes' } }),
        })
      );
      expect(badPerm.status).toBe(400);

      const badLimit = await createOrg(
        new NextRequest('http://localhost/api/organizations', {
          method: 'POST',
          body: JSON.stringify({ name: 'Acme', teacherLimits: { aiQuizMaxQuestions: 100 } }),
        })
      );
      expect(badLimit.status).toBe(400);
    });
  });

  describe('PATCH /api/organizations/[id]', () => {
    const makeOrgDoc = (id: mongoose.Types.ObjectId) => ({
      _id: id,
      name: 'Org A',
      isActive: true,
      permissions: { canUploadVideos: false },
      teacherLimits: { courses: 10 },
      save: vi.fn().mockResolvedValue(undefined),
    });

    it('blocks teacher and student from updating organizations (403)', async () => {
      for (const role of ['teacher', 'student']) {
        mockGetServerSession.mockResolvedValue({
          user: { id: 'u1', role, organizationId: orgA.toString() },
        });
        const res = await patchOrg(
          new NextRequest(`http://localhost/api/organizations/${orgA}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: 'Hacked' }),
          }),
          { params: Promise.resolve({ id: orgA.toString() }) }
        );
        expect(res.status).toBe(403);
      }
    });

    it('blocks org admin from updating another organization (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', organizationId: orgA.toString() },
      });
      mockOrgFindById.mockResolvedValue(makeOrgDoc(orgB));

      const res = await patchOrg(
        new NextRequest(`http://localhost/api/organizations/${orgB}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: 'Renamed' }),
        }),
        { params: Promise.resolve({ id: orgB.toString() }) }
      );
      expect(res.status).toBe(403);
    });

    it('blocks org admin from self-granting permissions or upgrading teacherLimits on their own org (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', organizationId: orgA.toString() },
      });
      mockOrgFindById.mockResolvedValue(makeOrgDoc(orgA));

      const permRes = await patchOrg(
        new NextRequest(`http://localhost/api/organizations/${orgA}`, {
          method: 'PATCH',
          body: JSON.stringify({ permissions: { canUploadVideos: true } }),
        }),
        { params: Promise.resolve({ id: orgA.toString() }) }
      );
      expect(permRes.status).toBe(403);

      const limitRes = await patchOrg(
        new NextRequest(`http://localhost/api/organizations/${orgA}`, {
          method: 'PATCH',
          body: JSON.stringify({ teacherLimits: { courses: 999 } }),
        }),
        { params: Promise.resolve({ id: orgA.toString() }) }
      );
      expect(limitRes.status).toBe(403);
    });

    it('allows org admin to update branding fields on their own organization (200)', async () => {
      const doc = makeOrgDoc(orgA);
      mockGetServerSession.mockResolvedValue({
        user: { id: 'admin-1', role: 'admin', organizationId: orgA.toString() },
      });
      mockOrgFindById.mockResolvedValue(doc);

      const res = await patchOrg(
        new NextRequest(`http://localhost/api/organizations/${orgA}`, {
          method: 'PATCH',
          body: JSON.stringify({ tagline: 'Learning First' }),
        }),
        { params: Promise.resolve({ id: orgA.toString() }) }
      );
      expect(res.status).toBe(200);
      expect(doc.save).toHaveBeenCalledOnce();
    });

    it('allows superadmin to update organization permissions and teacherLimits (200)', async () => {
      const doc = makeOrgDoc(orgA);
      mockGetServerSession.mockResolvedValue({
        user: { id: 'super-1', role: 'superadmin', organizationId: null },
      });
      mockOrgFindById.mockResolvedValue(doc);

      const res = await patchOrg(
        new NextRequest(`http://localhost/api/organizations/${orgA}`, {
          method: 'PATCH',
          body: JSON.stringify({
            permissions: { canUploadVideos: true, canCreateContests: true },
            teacherLimits: { courses: 25, quizzes: 50 },
          }),
        }),
        { params: Promise.resolve({ id: orgA.toString() }) }
      );
      expect(res.status).toBe(200);
      expect(doc.permissions).toMatchObject({ canUploadVideos: true, canCreateContests: true });
      expect(doc.teacherLimits).toMatchObject({ courses: 25, quizzes: 50 });
      expect(doc.save).toHaveBeenCalledOnce();
    });
  });
});

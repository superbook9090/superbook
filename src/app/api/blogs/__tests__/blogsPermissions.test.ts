// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

const mockGetServerSession = vi.fn();
const mockBlogFind = vi.fn();
const mockBlogCountDocuments = vi.fn();
const mockBlogFindOne = vi.fn();
const mockBlogFindById = vi.fn();
const mockBlogFindByIdAndDelete = vi.fn();
const mockUserFind = vi.fn();
const mockUserFindById = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('@/lib/blogs/public', () => ({
  slugifyBlogTitle: (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
}));
vi.mock('next-auth', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));
vi.mock('@/lib/auth', () => ({ authOptions: {} }));
vi.mock('@/lib/db', () => ({ default: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/lib/settingsHelpers', () => ({
  requireFeature: vi.fn().mockResolvedValue(null),
  checkTeacherLimit: vi.fn().mockResolvedValue(null),
}));
vi.mock('@/lib/redis', () => ({
  getCachedData: vi.fn().mockResolvedValue(null),
  setCachedData: vi.fn().mockResolvedValue(undefined),
  invalidatePattern: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn() }));
vi.mock('@/lib/logger', () => ({
  logApiError: vi.fn(),
  logFailedRequest: vi.fn(),
}));

vi.mock('@/models/Blog', () => ({
  default: {
    find: (...args: unknown[]) => mockBlogFind(...args),
    countDocuments: (...args: unknown[]) => mockBlogCountDocuments(...args),
    findOne: (...args: unknown[]) => mockBlogFindOne(...args),
    findById: (...args: unknown[]) => mockBlogFindById(...args),
    findByIdAndDelete: (...args: unknown[]) => mockBlogFindByIdAndDelete(...args),
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    find: (...args: unknown[]) => mockUserFind(...args),
    findById: (...args: unknown[]) => mockUserFindById(...args),
  },
}));

import { GET as listBlogs } from '../route';
import { GET as getBlog, PATCH as patchBlog, DELETE as deleteBlog } from '../[id]/route';

function makeBlogChain(items: unknown[] = []) {
  const chain = {
    populate: vi.fn().mockReturnThis(),
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue(items),
  };
  return chain;
}

function makeUserFindByIdChain(doc: unknown) {
  return {
    select: vi.fn().mockReturnValue({
      lean: vi.fn().mockResolvedValue(doc),
    }),
  };
}

describe('Blog API permission & organization scoping', () => {
  const orgA = new mongoose.Types.ObjectId();
  const orgB = new mongoose.Types.ObjectId();
  const superAdminId = new mongoose.Types.ObjectId();
  const orgAdminId = new mongoose.Types.ObjectId();
  const teacherId = new mongoose.Types.ObjectId();
  const otherTeacherId = new mongoose.Types.ObjectId();
  const blogId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    vi.clearAllMocks();
    mockBlogFind.mockReturnValue(makeBlogChain([]));
    mockBlogCountDocuments.mockResolvedValue(0);
    mockBlogFindByIdAndDelete.mockResolvedValue({ _id: blogId });
  });

  describe('GET /api/blogs', () => {
    it('restricts org admin strictly to their organization even when orgId=public is requested', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });

      const req = new NextRequest(
        'http://localhost/api/blogs?orgId=public&includeDrafts=true&includeStats=true'
      );
      const res = await listBlogs(req);
      expect(res.status).toBe(200);

      const findQuery = mockBlogFind.mock.calls[0][0];
      expect(findQuery).toEqual({ organizationId: orgA });
    });

    it('hydrates missing organizationId from DB for org admin instead of exposing public blogs', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: null },
      });
      mockUserFindById.mockReturnValue(makeUserFindByIdChain({ organizationId: orgA }));

      const req = new NextRequest('http://localhost/api/blogs?includeDrafts=true');
      const res = await listBlogs(req);
      expect(res.status).toBe(200);

      expect(mockUserFindById).toHaveBeenCalledWith(orgAdminId.toString());
      expect(mockBlogFind.mock.calls[0][0]).toEqual({ organizationId: orgA });
    });

    it('restricts admin without any organization in DB to self-authored blogs only (never all public blogs)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: null },
      });
      mockUserFindById.mockReturnValue(makeUserFindByIdChain({ organizationId: null }));

      const req = new NextRequest('http://localhost/api/blogs?includeDrafts=true');
      const res = await listBlogs(req);
      expect(res.status).toBe(200);
      expect(mockBlogFind.mock.calls[0][0]).toEqual({ author: orgAdminId });
    });

    it('allows superadmin to list all blogs without an organization filter', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: superAdminId.toString(), role: 'superadmin', organizationId: null },
      });

      const req = new NextRequest('http://localhost/api/blogs?includeDrafts=true');
      const res = await listBlogs(req);
      expect(res.status).toBe(200);
      expect(mockBlogFind.mock.calls[0][0]).toEqual({});
    });
  });

  describe('GET /api/blogs/[id]', () => {
    it('hides unpublished platform draft from org admin (404)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockBlogFindOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          _id: blogId,
          author: { _id: superAdminId, name: 'Super Admin' },
          organizationId: null,
          visibility: 'public',
          isPublished: false,
        }),
      });

      const res = await getBlog(new NextRequest(`http://localhost/api/blogs/${blogId}`), {
        params: Promise.resolve({ id: blogId.toString() }),
      });
      expect(res.status).toBe(404);
    });

    it('blocks org admin from reading another organization blog (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockBlogFindOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          _id: blogId,
          author: { _id: otherTeacherId, name: 'Other Teacher' },
          organizationId: orgB,
          visibility: 'organization',
          isPublished: true,
        }),
      });

      const res = await getBlog(new NextRequest(`http://localhost/api/blogs/${blogId}`), {
        params: Promise.resolve({ id: blogId.toString() }),
      });
      expect(res.status).toBe(403);
    });

    it('allows org admin to read unpublished draft belonging to their own organization', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockBlogFindOne.mockReturnValue({
        populate: vi.fn().mockResolvedValue({
          _id: blogId,
          title: 'Org Draft',
          author: { _id: teacherId, name: 'Org Teacher' },
          organizationId: orgA,
          visibility: 'organization',
          isPublished: false,
        }),
      });

      const res = await getBlog(new NextRequest(`http://localhost/api/blogs/${blogId}`), {
        params: Promise.resolve({ id: blogId.toString() }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('PATCH & DELETE /api/blogs/[id]', () => {
    const makeBlogDoc = (overrides: Record<string, unknown>) => ({
      _id: blogId,
      title: 'Existing Blog',
      content: '<p>Hello world</p>',
      topic: 'General',
      isPublished: true,
      visibility: 'public',
      author: superAdminId,
      organizationId: null,
      save: vi.fn().mockResolvedValue(undefined),
      populate: vi.fn().mockResolvedValue(undefined),
      ...overrides,
    });

    it('denies unauthenticated PATCH and DELETE (401)', async () => {
      mockGetServerSession.mockResolvedValue(null);
      mockBlogFindById.mockResolvedValue(makeBlogDoc({}));

      const patchRes = await patchBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, {
          method: 'PATCH',
          body: JSON.stringify({ isPublished: false }),
        }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(patchRes.status).toBe(401);

      const delRes = await deleteBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(delRes.status).toBe(401);
    });

    it('blocks org admin from editing or deleting public/platform blogs authored by superadmin (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockBlogFindById.mockResolvedValue(
        makeBlogDoc({ author: superAdminId, organizationId: null })
      );

      const patchRes = await patchBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, {
          method: 'PATCH',
          body: JSON.stringify({ title: 'Hijacked Title' }),
        }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(patchRes.status).toBe(403);

      const delRes = await deleteBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(delRes.status).toBe(403);
      expect(mockBlogFindByIdAndDelete).not.toHaveBeenCalled();
    });

    it('blocks org admin from editing or deleting another organization blog (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockBlogFindById.mockResolvedValue(
        makeBlogDoc({ author: otherTeacherId, organizationId: orgB, visibility: 'organization' })
      );

      const patchRes = await patchBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, {
          method: 'PATCH',
          body: JSON.stringify({ isPublished: false }),
        }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(patchRes.status).toBe(403);

      const delRes = await deleteBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(delRes.status).toBe(403);
    });

    it('allows org admin to edit and delete a blog belonging to their own organization (200)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: orgAdminId.toString(), role: 'admin', organizationId: orgA.toString() },
      });
      mockBlogFindById.mockResolvedValue(
        makeBlogDoc({ author: teacherId, organizationId: orgA, visibility: 'organization' })
      );

      const patchRes = await patchBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, {
          method: 'PATCH',
          body: JSON.stringify({ isPublished: false }),
        }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(patchRes.status).toBe(200);

      const delRes = await deleteBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(delRes.status).toBe(200);
      expect(mockBlogFindByIdAndDelete).toHaveBeenCalledWith(blogId.toString());
    });

    it('blocks teacher from editing or deleting another teacher blog in the same org (403)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: teacherId.toString(), role: 'teacher', organizationId: orgA.toString() },
      });
      mockBlogFindById.mockResolvedValue(
        makeBlogDoc({ author: otherTeacherId, organizationId: orgA, visibility: 'organization' })
      );

      const patchRes = await patchBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, {
          method: 'PATCH',
          body: JSON.stringify({ isPublished: false }),
        }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(patchRes.status).toBe(403);

      const delRes = await deleteBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(delRes.status).toBe(403);
    });

    it('allows superadmin to edit and delete any blog across organizations (200)', async () => {
      mockGetServerSession.mockResolvedValue({
        user: { id: superAdminId.toString(), role: 'superadmin', organizationId: null },
      });
      mockBlogFindById.mockResolvedValue(
        makeBlogDoc({ author: otherTeacherId, organizationId: orgB, visibility: 'organization' })
      );

      const patchRes = await patchBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, {
          method: 'PATCH',
          body: JSON.stringify({ isPublished: false }),
        }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(patchRes.status).toBe(200);

      const delRes = await deleteBlog(
        new NextRequest(`http://localhost/api/blogs/${blogId}`, { method: 'DELETE' }),
        { params: Promise.resolve({ id: blogId.toString() }) }
      );
      expect(delRes.status).toBe(200);
    });
  });
});

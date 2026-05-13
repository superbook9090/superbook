import { apiJson } from '@/lib/api/http';

const BASE = '/api/blogs';

/** Shape returned by GET/PATCH/POST blog routes (populated author optional). */
export type BlogDocument = {
  _id: string;
  title: string;
  topic: string;
  content: string;
  language?: string;
  isPublished: boolean;
  excerpt?: string;
  author?: { _id: string; name: string; email?: string };
  createdAt?: string;
  updatedAt?: string;
};

export type CreateBlogInput = {
  title: string;
  topic: string;
  content: string;
  language?: string;
  isPublished?: boolean;
};

export type UpdateBlogInput = Partial<CreateBlogInput & { isPublished: boolean }>;

export function getBlogById(id: string): Promise<BlogDocument> {
  return apiJson<BlogDocument>(`${BASE}/${id}`, { method: 'GET' });
}

export function createBlog(body: CreateBlogInput): Promise<BlogDocument> {
  return apiJson<BlogDocument>(BASE, { method: 'POST', body });
}

export function updateBlog(id: string, body: UpdateBlogInput): Promise<BlogDocument> {
  return apiJson<BlogDocument>(`${BASE}/${id}`, { method: 'PATCH', body });
}

export function deleteBlog(id: string): Promise<unknown> {
  return apiJson(`${BASE}/${id}`, { method: 'DELETE' });
}

export type BlogsListPayload = { blogs: unknown[] };

export function listBlogs(orgId: string, includeDrafts: boolean): Promise<BlogsListPayload> {
  const o = orgId || 'public';
  const url = includeDrafts
    ? `${BASE}?includeDrafts=true&orgId=${encodeURIComponent(o)}`
    : `${BASE}?orgId=${encodeURIComponent(o)}`;
  return apiJson<BlogsListPayload>(url, { method: 'GET' });
}

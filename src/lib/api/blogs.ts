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

export type BlogsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BlogsListPayload = {
  blogs: BlogDocument[];
  pagination?: BlogsPagination;
  stats?: {
    total: number;
    published: number;
    draft: number;
  };
};

export type ListBlogsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  topic?: string;
  language?: string;
  includeDrafts?: boolean;
  includeStats?: boolean;
  author?: 'self';
  orgId?: string;
};

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

export function listBlogsPaginated(params: ListBlogsParams = {}): Promise<BlogsListPayload> {
  const searchParams = new URLSearchParams();
  const orgId = params.orgId || 'public';

  searchParams.set('orgId', orgId);
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.status && params.status !== 'all') searchParams.set('status', params.status);
  if (params.topic && params.topic !== 'all') searchParams.set('topic', params.topic);
  if (params.language && params.language !== 'all') searchParams.set('language', params.language);
  if (params.includeDrafts) searchParams.set('includeDrafts', 'true');
  if (params.includeStats) searchParams.set('includeStats', 'true');
  if (params.author) searchParams.set('author', params.author);

  return apiJson<BlogsListPayload>(`${BASE}?${searchParams.toString()}`, { method: 'GET' });
}

/** @deprecated Use listBlogsPaginated */
export function listBlogs(orgId: string, includeDrafts: boolean): Promise<BlogsListPayload> {
  return listBlogsPaginated({
    orgId,
    includeDrafts,
    limit: 200,
    page: 1,
  });
}

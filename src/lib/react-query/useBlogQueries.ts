'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listBlogsPaginated,
  createBlog,
  deleteBlog,
  updateBlog,
  type CreateBlogInput,
  type ListBlogsParams,
} from '@/lib/api/blogs';

export interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  language: string;
  isPublished: boolean;
  author: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export function useBlogs(orgId?: string, includeDrafts = false) {
  return useQuery({
    queryKey: ['blogs', orgId || 'public', includeDrafts],
    queryFn: async () => {
      const data = await listBlogsPaginated({
        orgId: orgId || 'public',
        includeDrafts,
        limit: 200,
        page: 1,
      });
      return (data.blogs || []) as Blog[];
    },
    enabled: !!orgId || orgId === 'public',
  });
}

export function usePaginatedBlogs(params: ListBlogsParams, enabled = true) {
  return useQuery({
    queryKey: ['blogs', 'paginated', params],
    queryFn: async () => {
      const data = await listBlogsPaginated(params);
      return {
        blogs: (data.blogs || []) as Blog[],
        pagination: data.pagination ?? {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
          total: 0,
          totalPages: 1,
        },
        stats: data.stats,
      };
    },
    enabled,
    placeholderData: (previousData, previousQuery) => {
      if (!previousData || !previousQuery) return undefined;
      const prev = previousQuery.queryKey[2] as ListBlogsParams;
      const filtersChanged =
        prev.search !== params.search ||
        prev.status !== params.status ||
        prev.topic !== params.topic ||
        prev.language !== params.language ||
        prev.limit !== params.limit ||
        prev.includeDrafts !== params.includeDrafts ||
        prev.author !== params.author ||
        prev.orgId !== params.orgId ||
        prev.sort !== params.sort;
      if (filtersChanged) return undefined;
      return previousData;
    },
  });
}

export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBlogInput) => createBlog(input),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (blogId: string) => {
      return deleteBlog(blogId);
    },
    onMutate: async (blogId) => {
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      const previousBlogs = queryClient.getQueryData<Blog[]>(['blogs']);
      queryClient.setQueryData<Blog[]>(['blogs'], (old) =>
        (old || []).filter((b) => b._id !== blogId)
      );
      return { previousBlogs };
    },
    onError: (_err, _blogId, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blogId, data }: { blogId: string; data: Partial<Blog> }) => {
      return updateBlog(blogId, data);
    },
    onMutate: async ({ blogId, data }) => {
      await queryClient.cancelQueries({ queryKey: ['blogs'] });
      const previousBlogs = queryClient.getQueryData<Blog[]>(['blogs']);
      queryClient.setQueryData<Blog[]>(['blogs'], (old) =>
        (old || []).map((b) => (b._id === blogId ? { ...b, ...data } : b))
      );
      return { previousBlogs };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousBlogs) {
        queryClient.setQueryData(['blogs'], context.previousBlogs);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
}

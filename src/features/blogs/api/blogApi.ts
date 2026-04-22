/**
 * Blog API - Centralized API calls for blog-related operations
 * 
 * All blog-related network calls should be made through this file.
 * This separates API logic from UI components.
 */

export interface Blog {
  _id: string;
  title: string;
  content: string;
  topic: string;
  language: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { _id: string; name: string };
}

/**
 * Get all blogs
 */
export async function getBlogs(): Promise<Blog[]> {
  const response = await fetch('/api/blogs');
  if (!response.ok) {
    throw new Error('Failed to fetch blogs');
  }
  return response.json();
}

/**
 * Get a single blog by ID
 */
export async function getBlogById(id: string): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch blog');
  }
  return response.json();
}

/**
 * Create a new blog
 */
export async function createBlog(data: Partial<Blog>): Promise<Blog> {
  const response = await fetch('/api/blogs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create blog');
  }
  return response.json();
}

/**
 * Update an existing blog
 */
export async function updateBlog(id: string, data: Partial<Blog>): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update blog');
  }
  return response.json();
}

/**
 * Delete a blog
 */
export async function deleteBlog(id: string): Promise<void> {
  const response = await fetch(`/api/blogs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete blog');
  }
}

/**
 * Toggle blog publish status
 */
export async function toggleBlogPublish(id: string, isPublished: boolean): Promise<Blog> {
  const response = await fetch(`/api/blogs/${id}/publish`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isPublished }),
  });
  if (!response.ok) {
    throw new Error('Failed to update blog publish status');
  }
  return response.json();
}

/**
 * Course API - Centralized API calls for course-related operations
 * 
 * All course-related network calls should be made through this file.
 * This separates API logic from UI components.
 */

export interface Course {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  language: string;
  thumbnail?: string;
  instructor: { name: string; email: string };
  isPublished: boolean;
}

export interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  status: string;
  enrolledAt: string;
}

/**
 * Get all courses
 */
export async function getCourses(): Promise<Course[]> {
  const response = await fetch('/api/courses');
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  return response.json();
}

/**
 * Get a single course by ID
 */
export async function getCourseById(id: string): Promise<Course> {
  const response = await fetch(`/api/courses/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch course');
  }
  return response.json();
}

/**
 * Get user's enrollments
 */
export async function getEnrollments(): Promise<Enrollment[]> {
  const response = await fetch('/api/enrollments');
  if (!response.ok) {
    throw new Error('Failed to fetch enrollments');
  }
  return response.json();
}

/**
 * Enroll in a course
 */
export async function enrollCourse(courseId: string): Promise<Enrollment> {
  const response = await fetch('/api/enrollments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId }),
  });
  if (!response.ok) {
    throw new Error('Failed to enroll in course');
  }
  return response.json();
}

/**
 * Drop a course enrollment
 */
export async function dropEnrollment(enrollmentId: string): Promise<void> {
  const response = await fetch(`/api/enrollments/${enrollmentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to drop enrollment');
  }
}

/**
 * Create a new course
 */
export async function createCourse(data: Partial<Course>): Promise<Course> {
  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create course');
  }
  return response.json();
}

/**
 * Update an existing course
 */
export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const response = await fetch(`/api/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update course');
  }
  return response.json();
}

/**
 * Delete a course
 */
export async function deleteCourse(id: string): Promise<void> {
  const response = await fetch(`/api/courses/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete course');
  }
}

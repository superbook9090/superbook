// src/app/(dashboard)/dashboard/teacher/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  isPublished: boolean;
  enrolledStudents: string[];
  createdAt: string;
}

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      router.push('/dashboard/student');
      return;
    }

    fetchCourses();
  }, [session, status, router]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses?instructor=self');
      const data = await response.json();

      if (response.ok) {
        setCourses(data.courses || []);
      } else {
        setError(data.message || 'Failed to load courses');
      }
    } catch (err) {
      setError('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
        <a
          href="/dashboard/teacher/courses/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Create New Course
        </a>
      </div>
      <p className="mt-2 text-gray-600">
        Manage your courses, lessons, and enrolled students.
      </p>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8">
        {courses.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t created any courses yet.</p>
              <a
                href="/dashboard/teacher/courses/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Create Your First Course
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-white text-4xl">📚</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.isPublished
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {course.category && (
                      <span className="text-xs text-gray-500">{course.category}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description || 'No description'}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{course.enrolledStudents?.length || 0} students enrolled</span>
                    <span>{course.price > 0 ? `₹${course.price}` : 'Free'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

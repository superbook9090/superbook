// src/app/(dashboard)/dashboard/student/courses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CourseCard from '@/components/dashboard/CourseCard';

interface Enrollment {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail?: string;
    category?: string;
    price: number;
    instructor: { name: string; email: string };
  };
  progress: number;
  status: string;
  enrolledAt: string;
}

export default function StudentCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (session.user?.role === 'teacher' || session.user?.role === 'admin') {
      router.push('/dashboard/teacher/courses');
      return;
    }

    fetchEnrollments();
  }, [session, status, router]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch('/api/enrollments');
      const data = await response.json();
      if (response.ok) {
        setEnrollments(data.enrollments || []);
      } else {
        setError(data.message || 'Failed to load courses');
      }
    } catch (err) {
      setError('Error loading courses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (enrollmentId: string) => {
    if (!confirm('Are you sure you want to drop this course?')) return;

    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setEnrollments(enrollments.filter(e => e._id !== enrollmentId));
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to drop course');
      }
    } catch (err) {
      alert('Error dropping course');
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="mt-2 text-gray-600">
            Continue your learning journey.
          </p>
        </div>
        <a
          href="/dashboard/student/browse"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Browse More Courses
        </a>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-8">
        {enrollments.length === 0 ? (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-8 sm:p-6 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t enrolled in any courses yet.</p>
              <a
                href="/dashboard/student/browse"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Browse Available Courses
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard
                key={enrollment._id}
                course={enrollment}
                type="enrolled"
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

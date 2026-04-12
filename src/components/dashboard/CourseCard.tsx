'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category?: string;
  price: number;
  instructor: { name: string; email: string };
  isPublished: boolean;
}

interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  status: string;
  enrolledAt: string;
}

interface CourseCardProps {
  course: Course | Enrollment;
  type: 'enrolled' | 'available';
  onEnroll?: (courseId: string) => Promise<void>;
  onDrop?: (enrollmentId: string) => Promise<void>;
}

export default function CourseCard({ course, type, onEnroll, onDrop }: CourseCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Handle both course and enrollment objects
  const isEnrollment = 'course' in course;
  const courseData = isEnrollment ? (course as Enrollment).course : (course as Course);
  const enrollment = isEnrollment ? (course as Enrollment) : null;

  const handleEnroll = async () => {
    if (!onEnroll) return;
    setIsLoading(true);
    try {
      await onEnroll(courseData._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async () => {
    if (!onDrop || !enrollment) return;
    setIsLoading(true);
    try {
      await onDrop(enrollment._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push(`/dashboard/student/courses/${courseData._id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {courseData.thumbnail ? (
        <img
          src={courseData.thumbnail}
          alt={courseData.title}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
          <span className="text-white text-4xl">📚</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          {courseData.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
              {courseData.category}
            </span>
          )}
          <span className="text-lg font-bold text-gray-900">
            {courseData.price === 0 ? 'Free' : `$${courseData.price}`}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{courseData.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{courseData.description || 'No description available'}</p>

        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span>By {courseData.instructor?.name || 'Unknown'}</span>
        </div>

        {type === 'enrolled' && enrollment && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-indigo-600">{enrollment.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{ width: `${enrollment.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Status: <span className={`capitalize font-medium ${enrollment.status === 'completed' ? 'text-green-600' : enrollment.status === 'active' ? 'text-indigo-600' : 'text-red-600'}`}>{enrollment.status}</span>
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {type === 'available' ? (
            <button
              onClick={handleEnroll}
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Enrolling...' : 'Enroll Now'}
            </button>
          ) : (
            <>
              <button
                onClick={handleContinue}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {enrollment?.progress === 0 ? 'Start' : enrollment?.progress === 100 ? 'Review' : 'Continue'}
              </button>
              <button
                onClick={handleDrop}
                disabled={isLoading}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Drop
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

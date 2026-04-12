'use client';

import React, { useState } from 'react';
import Loader, { LoadingButton, LoadingOverlay } from './Loader';
import Skeleton, {
  CardSkeleton,
  StatsCardSkeleton,
  ListItemSkeleton,
  DashboardSkeleton,
  CourseGridSkeleton,
  QuizListSkeleton,
  FormSkeleton,
  ProfileSkeleton,
} from './Skeleton';

/**
 * ========================================
 * LOADER USAGE EXAMPLES
 * ========================================
 */

// Example 1: Full Page Loader (for page loading states)
export function FullPageLoaderExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative min-h-screen">
      {/* Your page content */}
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <button
          onClick={() => setIsLoading(!isLoading)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Toggle Loading
        </button>
      </div>

      {/* Full page loader overlay */}
      {isLoading && (
        <Loader
          variant="full-page"
          size="lg"
          text="Loading dashboard..."
        />
      )}
    </div>
  );
}

// Example 2: Button Loader (for button loading states)
export function ButtonLoaderExample() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-xl font-semibold">Button Loading States</h2>

      {/* Using LoadingButton component */}
      <div className="flex gap-4">
        <LoadingButton
          isLoading={isLoading}
          onClick={handleClick}
          loadingText="Saving..."
        >
          Save Changes
        </LoadingButton>

        <LoadingButton
          isLoading={isLoading}
          variant="secondary"
          onClick={handleClick}
          loadingText="Processing..."
        >
          Secondary Action
        </LoadingButton>

        <LoadingButton
          isLoading={isLoading}
          variant="outline"
          onClick={handleClick}
          loadingText="Loading..."
        >
          Outline Button
        </LoadingButton>
      </div>

      {/* Manual button with loader */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="
          inline-flex items-center px-4 py-2
          bg-indigo-600 text-white
          rounded-lg font-medium
          disabled:opacity-70
        "
      >
        {isLoading ? (
          <>
            <Loader variant="button" size="sm" />
            <span className="ml-2">Processing...</span>
          </>
        ) : (
          'Custom Button'
        )}
      </button>
    </div>
  );
}

// Example 3: Section Loader (for component loading states)
export function SectionLoaderExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8 max-w-4xl">
      <h2 className="text-xl font-semibold mb-4">Section Loading</h2>

      <div className="bg-gray-50 rounded-lg p-6 min-h-[300px]">
        {isLoading ? (
          <Loader
            variant="section"
            size="md"
            text="Loading courses..."
          />
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Your Courses</h3>
            <p>Course content loaded!</p>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Loading
      </button>
    </div>
  );
}

// Example 4: Loading Overlay (for blocking interactions)
export function LoadingOverlayExample() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-xl font-semibold mb-4">Loading Overlay</h2>

      <LoadingOverlay isLoading={isLoading} text="Updating...">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h3 className="text-lg font-medium">Card with Overlay</h3>
          <p className="text-gray-600">
            When loading is active, this card gets an overlay with a spinner.
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Action 1
            </button>
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
              Action 2
            </button>
          </div>
        </div>
      </LoadingOverlay>

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Overlay
      </button>
    </div>
  );
}

/**
 * ========================================
 * SKELETON USAGE EXAMPLES
 * ========================================
 */

// Example 5: Card Skeleton
export function CardSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Card Skeleton</h2>

      <div className="max-w-sm">
        {isLoading ? (
          <CardSkeleton />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <div className="p-4">
              <h3 className="text-lg font-semibold">Course Title</h3>
              <p className="text-gray-600 mt-1">
                Course description goes here.
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-500">$99.99</span>
                <button className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                  Enroll
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 6: Stats Card Skeleton
export function StatsCardSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Stats Cards</h2>

      <div className="grid grid-cols-2 gap-4 max-w-lg">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-md flex items-center justify-center text-indigo-600 font-bold">
                  12
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Total Courses</p>
                  <p className="text-2xl font-semibold">12</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center text-green-600 font-bold">
                  85%
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Completion</p>
                  <p className="text-2xl font-semibold">85%</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 7: Dashboard Skeleton
export function DashboardSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Dashboard Skeleton</h2>

      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              New Course
            </button>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-4">
                Stat {i}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-lg shadow p-6 h-64">
              Main Content
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4 h-40">
                Sidebar 1
              </div>
              <div className="bg-white rounded-lg shadow p-4 h-40">
                Sidebar 2
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 8: Course Grid Skeleton
export function CourseGridSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Course Grid Skeleton</h2>

      {isLoading ? (
        <CourseGridSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-40 bg-gradient-to-r from-indigo-500 to-purple-500" />
              <div className="p-4">
                <h3 className="font-semibold">Course {i}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 9: Quiz List Skeleton
export function QuizListSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Quiz List Skeleton</h2>

      {isLoading ? (
        <QuizListSkeleton count={3} />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h3 className="font-semibold">Your Quizzes</h3>
          </div>
          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <span>Quiz {i}</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                  Published
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 10: Profile Skeleton
export function ProfileSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Profile Skeleton</h2>

      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600">
              JD
            </div>
            <div>
              <h3 className="text-2xl font-bold">John Doe</h3>
              <p className="text-gray-600">john@example.com</p>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                Student
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 11: List Items Skeleton
export function ListItemSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">List Items</h2>

      <div className="max-w-md bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <>
            <ListItemSkeleton />
            <ListItemSkeleton />
            <ListItemSkeleton />
          </>
        ) : (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center px-4 py-3 border-b last:border-0">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  {i}
                </div>
                <div className="ml-4 flex-1">
                  <p className="font-medium">Item {i}</p>
                  <p className="text-sm text-gray-500">Description {i}</p>
                </div>
                <button className="px-3 py-1 text-sm text-indigo-600">
                  Edit
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

// Example 12: Form Skeleton
export function FormSkeletonExample() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-4">Form Skeleton</h2>

      {isLoading ? (
        <FormSkeleton fields={4} />
      ) : (
        <form className="space-y-4 max-w-lg">
          {['Name', 'Email', 'Password', 'Confirm Password'].map((label) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder={`Enter ${label.toLowerCase()}`}
              />
            </div>
          ))}
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">
              Submit
            </button>
          </div>
        </form>
      )}

      <button
        onClick={() => setIsLoading(!isLoading)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
      >
        Toggle Skeleton
      </button>
    </div>
  );
}

/**
 * ========================================
 * COMBINED EXAMPLE PAGE
 * ========================================
 */
export default function LoaderExamples() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-8">Loader & Skeleton Examples</h1>

        <div className="space-y-16">
          {/* Loader Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b">
              Loaders
            </h2>
            <div className="space-y-8">
              <FullPageLoaderExample />
              <ButtonLoaderExample />
              <SectionLoaderExample />
              <LoadingOverlayExample />
            </div>
          </section>

          {/* Skeleton Examples */}
          <section>
            <h2 className="text-2xl font-semibold mb-6 pb-2 border-b">
              Skeletons
            </h2>
            <div className="space-y-8">
              <CardSkeletonExample />
              <StatsCardSkeletonExample />
              <DashboardSkeletonExample />
              <CourseGridSkeletonExample />
              <QuizListSkeletonExample />
              <ProfileSkeletonExample />
              <ListItemSkeletonExample />
              <FormSkeletonExample />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

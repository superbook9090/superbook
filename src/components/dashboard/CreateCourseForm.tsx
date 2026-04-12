'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCourseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    thumbnail: '',
    isPublished: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price) || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create course');
      }

      // Success - redirect to teacher courses page
      router.push('/dashboard/teacher/courses');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-r-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1.5">
          Course Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm text-gray-900 touch-manipulation"
          placeholder="Enter course title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm text-gray-900 resize-y"
          placeholder="Enter course description"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
            Price ($)
          </label>
          <input
            type="number"
            name="price"
            id="price"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm text-gray-900"
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
            Category
          </label>
          <input
            type="text"
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm text-gray-900"
            placeholder="e.g., Programming, Design"
          />
        </div>
      </div>

      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1.5">
          Thumbnail URL
        </label>
        <input
          type="url"
          name="thumbnail"
          id="thumbnail"
          value={formData.thumbnail}
          onChange={handleChange}
          className="px-3 py-2.5 sm:py-2 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base sm:text-sm text-gray-900"
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center py-2">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
        />
        <label htmlFor="isPublished" className="ml-3 block text-base sm:text-sm text-gray-900 cursor-pointer">
          Publish immediately
        </label>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/dashboard/teacher/courses')}
          className="px-4 py-3 sm:py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-3 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          {isLoading ? 'Creating...' : 'Create Course'}
        </button>
      </div>
    </form>
  );
}

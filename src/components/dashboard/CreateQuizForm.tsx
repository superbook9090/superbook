'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

interface Course {
  _id: string;
  title: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ExcelRow {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number; // 0-3 representing A-D
}

export default function CreateQuizForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    timeLimit: '30',
    isPublished: false,
  });
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctAnswer: 0 },
  ]);

  // Excel upload states
  const [showUpload, setShowUpload] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Fetch teacher's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses?instructor=self');
        const data = await response.json();
        if (response.ok && data.courses) {
          setCourses(data.courses);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCourses();
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  }, []);

  const handleQuestionChange = useCallback((index: number, field: string, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (field === 'question') {
        updated[index] = { ...updated[index], question: value };
      } else if (field.startsWith('option')) {
        const optionIndex = parseInt(field.replace('option', ''));
        const newOptions = [...updated[index].options];
        newOptions[optionIndex] = value;
        updated[index] = { ...updated[index], options: newOptions };
      } else if (field === 'correctAnswer') {
        updated[index] = { ...updated[index], correctAnswer: parseInt(value) };
      }
      return updated;
    });
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, { question: '', options: ['', ''], correctAnswer: 0 }]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions(prev => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  const addOption = useCallback((questionIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: [...updated[questionIndex].options, '']
      };
      return updated;
    });
  }, []);

  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[questionIndex].options.length > 2) {
        const newOptions = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
        let newCorrectAnswer = updated[questionIndex].correctAnswer;
        if (newCorrectAnswer >= newOptions.length) {
          newCorrectAnswer = newOptions.length - 1;
        }
        updated[questionIndex] = {
          ...updated[questionIndex],
          options: newOptions,
          correctAnswer: newCorrectAnswer
        };
      }
      return updated;
    });
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv') && !file.name.endsWith('.xls')) {
      setUploadError('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    setIsParsing(true);
    setUploadError('');
    setPreviewData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

      if (jsonData.length < 2) {
        setUploadError('File is empty or has no data rows');
        setIsParsing(false);
        return;
      }

      // Parse headers (first row)
      const headers = jsonData[0].map((h) => h.toString().toLowerCase().trim());
      const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
      const hasAllColumns = requiredColumns.every((col) =>
        headers.some((h) => h === col || h === col.replace('option', 'option_'))
      );

      if (!hasAllColumns) {
        setUploadError(`Invalid format. Required columns: question, optionA, optionB, optionC, optionD, correctAnswer. Found: ${headers.join(', ')}`);
        setIsParsing(false);
        return;
      }

      // Map column indices
      const getColIndex = (names: string[]) => {
        for (const name of names) {
          const idx = headers.findIndex((h) => h === name.toLowerCase());
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const colMap = {
        question: getColIndex(['question']),
        optionA: getColIndex(['optiona', 'option_a']),
        optionB: getColIndex(['optionb', 'option_b']),
        optionC: getColIndex(['optionc', 'option_c']),
        optionD: getColIndex(['optiond', 'option_d']),
        correctAnswer: getColIndex(['correctanswer', 'correct_answer']),
      };

      // Parse data rows
      const parsed: ExcelRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.every((cell) => !cell)) continue; // Skip empty rows

        const question = row[colMap.question]?.toString().trim();
        const optionA = row[colMap.optionA]?.toString().trim();
        const optionB = row[colMap.optionB]?.toString().trim();
        const optionC = row[colMap.optionC]?.toString().trim();
        const optionD = row[colMap.optionD]?.toString().trim();
        const correctAnswer = row[colMap.correctAnswer];

        if (!question) {
          errors.push(`Row ${i + 1}: Question is required`);
          continue;
        }
        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push(`Row ${i + 1}: All options (A, B, C, D) are required`);
          continue;
        }
        if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
          errors.push(`Row ${i + 1}: Correct answer is required`);
          continue;
        }

        // Normalize correct answer
        let correctIndex: number;
        const ca = correctAnswer.toString().trim().toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(ca)) {
          correctIndex = ca.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        } else {
          correctIndex = parseInt(ca) - 1; // 1=0, 2=1, etc.
        }

        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
          errors.push(`Row ${i + 1}: Correct answer must be A, B, C, D or 1, 2, 3, 4`);
          continue;
        }

        parsed.push({
          question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: correctIndex,
        });
      }

      if (errors.length > 0) {
        setUploadError(`Validation errors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ''}`);
      }

      if (parsed.length === 0) {
        setUploadError((prev) => prev || 'No valid questions found in the file');
      } else {
        setPreviewData(parsed);
      }
    } catch (_err) {
      setUploadError('Error parsing file. Please ensure it is a valid Excel or CSV file.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  const handleConfirmImport = useCallback(() => {
    const importedQuestions: Question[] = previewData.map((row) => ({
      question: row.question,
      options: [row.optionA, row.optionB, row.optionC, row.optionD],
      correctAnswer: row.correctAnswer,
    }));

    setQuestions(importedQuestions);
    setPreviewData([]);
    setShowUpload(false);
    setError('');
  }, [previewData]);

  const downloadTemplate = useCallback(() => {
    const template = [
      ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'],
      ['What is 2+2?', '3', '4', '5', '6', 'B'],
      ['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'],
      ['Which planet is closest to the Sun?', 'Venus', 'Earth', 'Mercury', 'Mars', 'C'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
    XLSX.writeFile(wb, 'quiz_template.xlsx');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is required`);
        setIsLoading(false);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(`All options in Question ${i + 1} must be filled`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timeLimit: Number(formData.timeLimit),
          questions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create quiz');
      }

      // Success - redirect to teacher quizzes page
      router.push('/dashboard/teacher/quizzes');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-center py-8 text-gray-500">Loading courses...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Quiz Title *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          placeholder="Enter quiz title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={2}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
          placeholder="Enter quiz description"
        />
      </div>

      <div>
        <label htmlFor="course" className="block text-sm font-medium text-gray-700">
          Course *
        </label>
        <select
          name="course"
          id="course"
          required
          value={formData.course}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
        >
          <option value="">Select a course</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
        {courses.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            You need to create a course first before creating a quiz.
          </p>
        )}
      </div>

      <div>
        <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700">
          Time Limit (minutes)
        </label>
        <input
          type="number"
          name="timeLimit"
          id="timeLimit"
          min="1"
          max="180"
          value={formData.timeLimit}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
        />
      </div>

      {/* Excel Upload Section */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Questions</h3>
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {showUpload ? 'Hide Import' : '📁 Import from Excel'}
          </button>
        </div>

        {showUpload && (
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-indigo-900">Import Questions from Excel</h4>
                <p className="text-sm text-indigo-700 mt-1">
                  Upload an Excel file with columns: question, optionA, optionB, optionC, optionD, correctAnswer
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-sm text-indigo-600 hover:text-indigo-800 underline"
              >
                Download Template
              </button>
            </div>

            <div className="mt-3">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isParsing}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 disabled:opacity-50"
              />
            </div>

            {isParsing && (
              <p className="mt-2 text-sm text-indigo-600">Parsing file...</p>
            )}

            {uploadError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700 whitespace-pre-line">{uploadError}</p>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="mt-4 bg-white rounded-md border border-indigo-200 overflow-hidden">
                <div className="px-4 py-3 bg-indigo-100 border-b border-indigo-200">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium text-indigo-900">
                      Preview: {previewData.length} question(s) found
                    </h5>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewData([]);
                          setUploadError('');
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        className="text-sm text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded"
                      >
                        Confirm Import
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Question</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Options</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Answer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm text-gray-900">{idx + 1}</td>
                          <td className="px-3 py-2 text-sm text-gray-900 max-w-xs truncate">{row.question}</td>
                          <td className="px-3 py-2 text-sm text-gray-500">A, B, C, D</td>
                          <td className="px-3 py-2 text-sm font-medium text-green-600">
                            {['A', 'B', 'C', 'D'][typeof row.correctAnswer === 'number' ? row.correctAnswer : 0]}
                          </td>
                        </tr>
                      ))}
                      {previewData.length > 5 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-2 text-sm text-gray-500 text-center italic">
                            ... and {previewData.length - 5} more questions
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Questions</h3>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-700">Question {qIndex + 1}</h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={question.question}
                onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                className="px-3 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                placeholder="Enter question"
                required
              />
            </div>

            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={question.correctAnswer === oIndex}
                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex.toString())}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleQuestionChange(qIndex, `option${oIndex}`, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
                    placeholder={`Option ${oIndex + 1}`}
                    required
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addOption(qIndex)}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Option
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          + Add Question
        </button>
      </div>

      <div className="flex items-center pt-4">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
          Publish immediately
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.push('/dashboard/teacher/quizzes')}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || courses.length === 0}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Quiz'}
        </button>
      </div>
    </form>
  );
}

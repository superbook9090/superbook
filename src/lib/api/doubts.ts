import { apiJsonData } from './http';

export interface DoubtQuestion {
  _id: string;
  studentId: { _id: string; name: string; avatar?: string; image?: string };
  question: string;
  teacherId?: { _id: string; name: string; avatar?: string; image?: string };
  answer?: string;
  status: 'pending' | 'answered';
  createdAt: string;
  updatedAt: string;
}

export async function fetchCourseDoubts(courseId: string): Promise<DoubtQuestion[]> {
  const { data } = await apiJsonData<{ doubts: DoubtQuestion[] }>(`/api/courses/${courseId}/doubts`);
  return data.doubts || [];
}

export async function askCourseDoubt(courseId: string, question: string): Promise<void> {
  await apiJsonData(`/api/courses/${courseId}/doubts`, {
    method: 'POST',
    body: { question },
  });
}

export async function replyCourseDoubt(courseId: string, doubtId: string, answer: string): Promise<void> {
  await apiJsonData(`/api/courses/${courseId}/doubts/${doubtId}/reply`, {
    method: 'PATCH',
    body: { answer },
  });
}

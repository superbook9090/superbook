import { apiJson } from '@/lib/api/http';

const BASE = '/api/certificates';

export type CertificateItem = {
  _id: string;
  student: string;
  course: string;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issuedAt: string;
};

export function listCertificates(courseId?: string): Promise<{ certificates: CertificateItem[] }> {
  const url = courseId ? `${BASE}?course=${encodeURIComponent(courseId)}` : BASE;
  return apiJson(url, { method: 'GET' });
}

export function getCertificate(id: string): Promise<CertificateItem> {
  return apiJson(`${BASE}/${encodeURIComponent(id)}`, { method: 'GET' });
}

export type PublicCourseSummary = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  locale: string;
  thumbnail: string;
  price: number;
  chapterCount: number;
  lessonCount: number;
  enrolledCount: number;
  instructor?: { _id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
};

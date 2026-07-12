import { NextRequest, NextResponse } from 'next/server';
import { listPublicCourses, listPublicCourseCategories } from '@/lib/courses/public';
import { requireFeature } from '@/lib/settingsHelpers';

export const revalidate = 300;

export async function GET(request: NextRequest) {
  const featureCheck = await requireFeature('enableCourses');
  if (featureCheck) return featureCheck;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const search = searchParams.get('search') || undefined;
  const category = searchParams.get('category') || undefined;
  const listCategories = searchParams.get('categories') === 'true';

  try {
    if (listCategories) {
      const categories = await listPublicCourseCategories();
      return NextResponse.json({ categories });
    }

    const data = await listPublicCourses({ page, limit, search, category });
    return NextResponse.json(data);
  } catch (err) {
    console.error('[/api/courses/public]', err);
    return NextResponse.json({ message: 'Failed to load courses' }, { status: 500 });
  }
}

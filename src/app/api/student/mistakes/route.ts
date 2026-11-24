import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listUserMistakes } from '@/lib/learning/mistakesService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const masteredParam = searchParams.get('mastered');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const mastered =
    masteredParam === 'true' ? true : masteredParam === 'false' ? false : undefined;

  const result = await listUserMistakes({
    userId: session.user.id,
    mastered,
    page,
    limit,
  });

  return NextResponse.json(result, {
    status: 200,
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
  });
}

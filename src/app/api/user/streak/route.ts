import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserStreak } from '@/lib/gamification/streakService';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const streak = await getUserStreak(session.user.id);
  return NextResponse.json(streak, {
    status: 200,
    headers: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
  });
}

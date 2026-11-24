import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { toggleMistakeMastered } from '@/lib/learning/mistakesService';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const mastered = Boolean(body.mastered);

  const updated = await toggleMistakeMastered(session.user.id, id, mastered);
  if (!updated) {
    return NextResponse.json({ message: 'Mistake item not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, mastered }, { status: 200 });
}

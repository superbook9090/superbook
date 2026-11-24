import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import '@/models/User';
import AppSettings, { IAppSettings } from '@/models/AppSettings';
import { createNoteSchema } from '@/lib/validation';
import { countWords } from '@/lib/wordCount';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { isSuperAdmin } from '@/lib/roles';

interface PopulatedUser {
  _id: { toString(): string };
  name?: string;
  email?: string;
  role?: string;
}

export async function GET(req: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/notes' };

  try {
    const featureError = await requireFeature('enableNotes');
    if (featureError) return featureError;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') === 'all' ? 'all' : 'mine';

    if (scope === 'all' && !isSuperAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Superadmin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    if (scope === 'all') {
      const [settingsDoc, rawNotes, ownNotesCount] = await Promise.all([
        AppSettings.findOne().lean(),
        Note.find({})
          .populate('userId', 'name email role')
          .sort({ updatedAt: -1 })
          .lean(),
        Note.countDocuments({ userId: session.user.id }),
      ]);

      const settings = settingsDoc as unknown as IAppSettings | null;
      const maxPagesPerUser = settings?.notesLimits?.maxPagesPerUser ?? 5;
      const maxWordsPerPage = settings?.notesLimits?.maxWordsPerPage ?? 1000;

      const notes = (
        rawNotes as unknown as Array<
          Record<string, unknown> & { userId?: PopulatedUser | { toString(): string } | string }
        >
      ).map((doc) => {
        const rawUser = doc.userId;
        const isPopulated =
          rawUser &&
          typeof rawUser === 'object' &&
          'email' in rawUser &&
          '_id' in rawUser;
        const owner = isPopulated
          ? {
              _id: (rawUser as PopulatedUser)._id.toString(),
              name: (rawUser as PopulatedUser).name || 'Unknown User',
              email: (rawUser as PopulatedUser).email || '',
              role: (rawUser as PopulatedUser).role || 'student',
            }
          : null;
        const userIdStr = isPopulated
          ? (rawUser as PopulatedUser)._id.toString()
          : rawUser
            ? String(rawUser)
            : '';

        return {
          ...doc,
          userId: userIdStr,
          owner,
        };
      });

      return NextResponse.json({
        notes,
        totalNotes: notes.length,
        ownNotesCount,
        scope: 'all',
        limit: maxPagesPerUser,
        maxWordsPerPage,
      });
    }

    const [settingsDoc, notes] = await Promise.all([
      AppSettings.findOne().lean(),
      Note.find({ userId: session.user.id })
        .sort({ isPinned: -1, updatedAt: -1 })
        .lean(),
    ]);

    const settings = settingsDoc as unknown as IAppSettings | null;
    const maxPagesPerUser = settings?.notesLimits?.maxPagesPerUser ?? 5;
    const maxWordsPerPage = settings?.notesLimits?.maxWordsPerPage ?? 1000;

    return NextResponse.json({
      notes,
      totalNotes: notes.length,
      ownNotesCount: notes.length,
      scope: 'mine',
      limit: maxPagesPerUser,
      maxWordsPerPage,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/notes', logContext);
    return NextResponse.json(
      { message: 'Something went wrong while fetching notes.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/notes' };

  try {
    const featureError = await requireFeature('enableNotes');
    if (featureError) return featureError;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const validationResult = createNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();

    const [settingsDoc, currentNotesCount] = await Promise.all([
      AppSettings.findOne().lean(),
      Note.countDocuments({ userId: session.user.id }),
    ]);

    const settings = settingsDoc as unknown as IAppSettings | null;
    const maxPagesPerUser = settings?.notesLimits?.maxPagesPerUser ?? 5;
    const maxWordsPerPage = settings?.notesLimits?.maxWordsPerPage ?? 1000;

    if (currentNotesCount >= maxPagesPerUser) {
      return NextResponse.json(
        {
          message: `Note page limit reached (${currentNotesCount}/${maxPagesPerUser} pages). Contact admin to increase limit.`,
          limitReached: true,
          limit: maxPagesPerUser,
        },
        { status: 400 }
      );
    }

    const { title, content, color, isPinned, tags } = validationResult.data;
    const wordCount = countWords(content);

    if (wordCount > maxWordsPerPage) {
      return NextResponse.json(
        {
          message: `Note content exceeds the word limit (${wordCount}/${maxWordsPerPage} words).`,
          wordCount,
          maxWordsPerPage,
        },
        { status: 400 }
      );
    }

    const newNote = await Note.create({
      userId: session.user.id,
      title,
      content,
      wordCount,
      color: color || 'blue',
      isPinned: isPinned || false,
      tags: tags || [],
    });

    return NextResponse.json(newNote, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/notes', logContext);
    return NextResponse.json(
      { message: 'Something went wrong while creating the note.' },
      { status: 500 }
    );
  }
}

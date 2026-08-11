import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import AppSettings, { IAppSettings } from '@/models/AppSettings';
import { updateNoteSchema } from '@/lib/validation';
import { countWords } from '@/lib/wordCount';
import { logApiError, type LogContext } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'GET', path: `/api/notes/${id}` };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const note = await Note.findOne({ _id: id, userId: session.user.id }).lean();
    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/notes/${id}`, logContext);
    return NextResponse.json(
      { message: 'Something went wrong while fetching the note.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'PATCH', path: `/api/notes/${id}` };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const validationResult = updateNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();

    const note = await Note.findOne({ _id: id, userId: session.user.id });
    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    const { title, content, color, isPinned, tags } = validationResult.data;

    if (content !== undefined) {
      const settingsDoc = await AppSettings.findOne().lean();
      const settings = settingsDoc as unknown as IAppSettings | null;
      const maxWordsPerPage = settings?.notesLimits?.maxWordsPerPage ?? 1000;
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
      note.content = content;
      note.wordCount = wordCount;
    }

    if (title !== undefined) note.title = title;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (tags !== undefined) note.tags = tags;

    await note.save();

    return NextResponse.json(note);
  } catch (error) {
    logApiError(error as Error, 'PATCH', `/api/notes/${id}`, logContext);
    return NextResponse.json(
      { message: 'Something went wrong while updating the note.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const logContext: LogContext = { method: 'DELETE', path: `/api/notes/${id}` };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const note = await Note.findOneAndDelete({ _id: id, userId: session.user.id });
    if (!note) {
      return NextResponse.json({ message: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Note deleted successfully', id });
  } catch (error) {
    logApiError(error as Error, 'DELETE', `/api/notes/${id}`, logContext);
    return NextResponse.json(
      { message: 'Something went wrong while deleting the note.' },
      { status: 500 }
    );
  }
}

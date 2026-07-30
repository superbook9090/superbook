// src/app/api/certificates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import Certificate from '@/models/Certificate';
import Course from '@/models/Course';
import mongoose from 'mongoose';
import { serialize } from '@/lib/serialize';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';

// GET /api/certificates/[id] - Single certificate.
// Accepts either the Mongo _id or the public certificateId serial, so the
// serial printed on a certificate can be used for verification.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/certificates/[id]' };

  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { certificateId: id };

    const certificate = await Certificate.findOne(query).lean();
    if (!certificate) {
      return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
    }

    const isOwner = String(certificate.student) === session.user.id;
    const isAdmin = session.user.role === 'admin' || session.user.role === 'superadmin';
    let isInstructor = false;
    if (!isOwner && !isAdmin && session.user.role === 'teacher') {
      const course = await Course.findById(certificate.course).select('instructor').lean();
      isInstructor = String(course?.instructor) === session.user.id;
    }

    if (!isOwner && !isAdmin && !isInstructor) {
      return NextResponse.json({ message: 'Certificate not found' }, { status: 404 });
    }

    return NextResponse.json(serialize(certificate));
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/certificates/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

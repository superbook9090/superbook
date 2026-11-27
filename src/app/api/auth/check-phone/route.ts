import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawPhone = body?.phone;
    if (typeof rawPhone !== 'string') {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    let formattedPhone = rawPhone.trim();
    if (!PHONE_REGEX.test(formattedPhone)) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    }

    await dbConnect();
    const user = await User.findOne({ phone: formattedPhone }).select('_id').lean();

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking phone:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}

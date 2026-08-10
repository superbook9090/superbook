import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) {
      return NextResponse.json({ exists: false });
    }
    
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith('+') && formattedPhone.length === 10) {
      formattedPhone = '+91' + formattedPhone;
    }

    await dbConnect();
    const user = await User.findOne({ phone: formattedPhone }).lean();
    
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking phone:', error);
    return NextResponse.json({ exists: false }, { status: 500 });
  }
}

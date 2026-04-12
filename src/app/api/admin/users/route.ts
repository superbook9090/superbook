// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface QueryFilter { [key: string]: any }

// Helper to check admin access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdmin(session: any) {
  if (!session || session.user?.role !== 'admin') {
    return false;
  }
  return true;
}

// GET /api/admin/users - Get all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const query: QueryFilter = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json(
      {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    const message = error instanceof Error ? error.message : 'Error fetching users';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const { userId, updates } = await request.json();

    if (!userId || !updates) {
      return NextResponse.json(
        { message: 'User ID and updates are required' },
        { status: 400 }
      );
    }

    // Prevent changing own role (to avoid locking yourself out)
    if (userId === session?.user?.id && updates.role && updates.role !== 'admin') {
      return NextResponse.json(
        { message: 'Cannot change your own role' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User updated', user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    const message = error instanceof Error ? error.message : 'Error updating user';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting self
    if (userId === session?.user?.id) {
      return NextResponse.json(
        { message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    const message = error instanceof Error ? error.message : 'Error deleting user';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

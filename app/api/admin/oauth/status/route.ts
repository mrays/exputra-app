import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userEmail = decoded.email;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        googleAccessToken: true,
        googleExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      isConnected: !!user.googleAccessToken,
      email: userEmail,
      expiresAt: user.googleExpiresAt,
    });
  } catch (error: any) {
    console.error('OAuth status error:', error);
    return NextResponse.json(
      { message: 'Gagal mendapatkan status: ' + error.message },
      { status: 500 }
    );
  }
}

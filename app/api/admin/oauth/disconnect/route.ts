import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
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

    // Update user untuk remove Google tokens
    await prisma.user.update({
      where: { email: userEmail },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleExpiresAt: null,
      },
    });

    return NextResponse.json({
      message: 'Autentikasi Gmail berhasil dihapus',
    });
  } catch (error: any) {
    console.error('OAuth disconnect error:', error);
    return NextResponse.json(
      { message: 'Gagal menghapus autentikasi: ' + error.message },
      { status: 500 }
    );
  }
}

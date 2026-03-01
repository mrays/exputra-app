import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail, getResetPasswordTemplate } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: 'Email wajib diisi' },
        { status: 400 }
      );
    }

    // Cari user dengan email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== 'ADMIN') {
      // Jangan reveal apakah email ada atau tidak (security best practice)
      return NextResponse.json(
        { message: 'Jika email terdaftar, Anda akan menerima email reset password' },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    // Update user dengan token
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Buat reset link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/reset-password?token=${resetToken}`;

    // Kirim email
    await sendEmail({
      to: email,
      subject: 'Reset Password - Admin Dashboard',
      html: getResetPasswordTemplate(resetLink, user.name),
    });

    return NextResponse.json(
      { message: 'Email reset password telah dikirim' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mengirim email' },
      { status: 500 }
    );
  }
}

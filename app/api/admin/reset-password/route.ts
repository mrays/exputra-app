import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail, getPasswordResetSuccessTemplate } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json();

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { message: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: 'Password tidak cocok' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Cari user dengan token yang valid
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Token tidak valid atau telah kadaluarsa' },
        { status: 400 }
      );
    }

    // Hash password baru
    const hashedPassword = await hashPassword(password);

    // Update password dan clear token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    // Kirim email konfirmasi
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Berhasil - Admin Dashboard',
      html: getPasswordResetSuccessTemplate(user.name),
    });

    return NextResponse.json(
      { message: 'Password berhasil direset. Silakan login dengan password baru' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan saat mereset password' },
      { status: 500 }
    );
  }
}
